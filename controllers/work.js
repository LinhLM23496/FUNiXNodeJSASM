const moment = require('moment')
const Work = require('../models/work');
const User = require('../models/user');
const Leave = require('../models/leave');

exports.getIndex = (req, res, next) => {
  Promise.all([User.findOne(), Work.findOne()])
    .then(result => {
      const [user, work] = result;
      if(!user.statusWork) {
        res.render('work/index', {
          user: user,
          pageTitle: 'Works Start',
          path: '/'
        });
      } else {
        res.render('work/index', {
          user: user,
          work: work,
          pageTitle: 'Works End',
          path: '/'
        });
      }
    })
    .catch(err => console.log(err));
};

// CHECK OUT
exports.postIndex = (req, res, next) => {
  let totalTime = 0;
  let overTime = 0;
  // Lấy ngày giờ hiện tại
  const today = new Date();
  // format ngày tháng năm & giờ phút giây
  const formatDate = moment(today).format('DD/MM/YYYY')
  const hours = moment(today).format('HH:mm:ss');
  const formatHoursToSeconds = moment.duration(hours).asSeconds()
  Promise.all([User.findOne(),Work.find({ date: formatDate })])
    .then(result => {
      const [user1, workDate] = result;
     // tính tổng thời gian làm việc trong ngày mỗi khi check out 
      workDate.map(r => {
        totalTime += moment.duration(r.workTime).asSeconds()
      })
      Promise.all([User.findOne(),Work.findById(user1.workId)])
        .then(result => {
          const [user, work] = result;
          let total = 0;
          let workStartToSecond = moment.duration(work.start).asSeconds();
          // tính thời gian tăng ca sau 18h00
          if (formatHoursToSeconds > 64800 && workStartToSecond < 64800) {
            overTime = formatHoursToSeconds - 64800;
          }
          if (formatHoursToSeconds > 64800 && workStartToSecond > 64800) {
            overTime = formatHoursToSeconds - workStartToSecond;
          }
          //tính thời gian làm việc
          const time = formatHoursToSeconds - workStartToSecond;

          user.statusWork = false;
          user.time = user.time - time;
          user.save();
          work.end = hours;
          work.overTime = moment.utc(overTime * 1000).format('HH:mm:ss');
          work.workTime = moment.utc(time * 1000).format('HH:mm:ss');
          total = time + totalTime;
          work.totalWorkTime = moment.utc(total * 1000).format('HH:mm:ss');
          return work.save();
        })
      res.redirect(301, '/report/daily')
    })
    .catch(err => console.log(err));
};

// CHECK IN
exports.postWorkend = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  // format ngày tháng năm & giờ phút giây
  const formatDate = moment(today).format('DD/MM/YYYY')
  const hours = moment(today).format('HH:mm:ss');

  //lấy vị trí làm việc
  const position = req.body.liveWork;

  Promise.all([User.findOne(), Work.findOne()])
    .then(result => {
      const [user, work] = result;
      // tạo giờ làm việc mới
      const workNew = new Work({
        start: hours,
        end: 0,
        date: formatDate,
        workTime: 0,
        totalWorkTime: 0,
        position: position,
        leaveTime: 0,
        overTime: 0,
        userId: req.user,
      })
      user.statusWork = true;
      user.workId = workNew._id;
      user.save();
      workNew
        .save()
        .then(work => {
          res.render('work/index', {
            pageTitle: 'Works End',
            path: '/',
            work: work,
            user: user,
          });
        })
      })     
    .catch(err => console.log(err));
};

// get data check Nghỉ phép
exports.getCheckLeave = (req, res, next) => {
  User.findOne()
    .then(user => {
      res.render('work/checkLeave', {
        user: user,
        pageTitle: 'Check Leave Day',
        path: '/checkleave'
      });
    })
    .catch(err => console.log(err));
};

// post data check Nghỉ phép
exports.postLeaveDay = (req, res, next) => {
  let checkLeave = req.body.checkLeave;
  User.findOne()
    .then(user => {
      res.render('work/leaveDay', {
        user: user,
        checkLeave: checkLeave,
        pageTitle: 'Leave Day',
        path: '/leaveday'
      });
    })
    .catch(err => console.log(err));
};

// post data Nghỉ phép
exports.postCheckLeave = (req, res, next) => {
  // lấy ngày nghỉ
  let leaveDate = req.body.leaveDate;
  let leaveFromDate = req.body.leaveFromDate;
  let leaveToDate = req.body.leaveToDate;
  let reason = req.body.reason;
  if (leaveDate) {
    leaveDate = moment(leaveDate).format('DD/MM/YYYY')
    // lấy thời gian nghỉ và kiểm tra xem có null không ?
    let leaveTime = 0;
    if (req.body.leaveTime) {
      leaveTime = req.body.leaveTime;
    } else {
      res.redirect('/leaveday')
    }
    console.log('leaveDate', leaveDate);
    console.log('leaveFromDate', leaveFromDate);
    console.log('leaveToDate', leaveToDate);
    console.log('reason', reason);
    console.log('leaveTime', leaveTime);
    const leave = new Leave({
      leaveDate: leaveDate,
      leaveTime: leaveTime,
      reason: reason,
      userId: req.user,
    })
    leave.save();
    User.findOne()
      .then(user => {
        // tính thời gian nghỉ phép còn lại
          user.annualLeave = user.annualLeave - leaveTime;
          user.time = user.time - leaveTime * 3600;
          user.save()
          res.redirect('/user')
      })
      .catch(err => console.log(err));
  } else if (leaveFromDate) {
    leaveFromDate = moment(leaveFromDate).format('DD/MM/YYYY')
    leaveToDate = moment(leaveToDate).format('DD/MM/YYYY')
    // lấy thời gian nghỉ và kiểm tra xem có null không ?
    let leaveTime = 0;
    if (req.body.leaveTime) {
      leaveTime = req.body.leaveTime;
    } else {
      res.redirect('/leaveday')
    }
    const leave = new Leave({
      leaveDate: leaveFromDate,
      leaveFromDate: leaveFromDate,
      leaveToDate: leaveToDate,
      leaveTime: leaveTime,
      reason: reason,
      userId: req.user,
    })
    leave.save();
    User.findOne()
      .then(user => {
        // tính thời gian nghỉ phép còn lại
          user.annualLeave = user.annualLeave - leaveTime;
          user.time = user.time - leaveTime * 3600;
          user.save()
          res.redirect('/user')
      })
      .catch(err => console.log(err));
  }
};