const moment = require("moment");
const Work = require("../models/work");
const User = require("../models/user");
const Leave = require("../models/leave");

// GET trang index
exports.getIndex = (req, res, next) => {
  req.user
    .populate("_id")
    .then((user) => {
      Work.findById(user.workId)
        .then((work) => {
          if (!user.statusWork) {
            res.render("work/index", {
              user: user,
              pageTitle: "Works Start",
              path: "/",
            });
          } else {
            res.render("work/index", {
              user: user,
              work: work,
              pageTitle: "Works End",
              path: "/",
            });
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

// CHECK IN
exports.postWorkstart = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  // format ngày tháng năm & giờ phút giây
  const formatDate = moment(today).format("DD/MM/YYYY");
  const hours = moment(today).format("HH:mm:ss");

  //lấy gia trị input
  const position = req.body.liveWork;
  const userId = req.body.userId;

  User.findById(userId)
    .then((user) => {
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
      });
      user.statusWork = true;
      user.workId = workNew._id;
      user.save();
      workNew.save();
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

// CHECK OUT
exports.postWorkEnd = (req, res, next) => {
  //lấy gia trị input
  const userId = req.body.userId;
  const workId = req.body.workId;

  let totalTime = 0;
  let overTime = 0;

  // Lấy ngày giờ hiện tại
  const today = new Date();
  // format ngày tháng năm & giờ phút giây
  const formatDate = moment(today).format("DD/MM/YYYY");
  const hours = moment(today).format("HH:mm:ss");
  const formatHoursToSeconds = moment.duration(hours).asSeconds();

  Promise.all([
    User.findById(userId),
    Work.find({ date: formatDate, userId: userId }),
    Work.findById(workId),
  ]).then((result) => {
    const [user, workDate, work] = result;
    // tính tổng thời gian làm việc trong ngày mỗi khi check out
    workDate.map((r) => {
      totalTime += moment.duration(r.workTime).asSeconds();
    });
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
    work.overTime = moment.utc(overTime * 1000).format("HH:mm:ss");
    work.workTime = moment.utc(time * 1000).format("HH:mm:ss");
    total = time + totalTime;
    work.totalWorkTime = moment.utc(total * 1000).format("HH:mm:ss");
    work.save();
    res.redirect("/report/daily");
  });
};

// get page số ngày nghỉ phép
exports.getCheckLeave = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  let checkLeave = 0;

  req.user
    .populate("_id")
    .then((user) => {
      res.render("work/checkLeave", {
        user: user,
        checkLeave: checkLeave,
        errorMessage: message,
        pageTitle: "Số ngày nghỉ",
        path: "/checkleave",
      });
    })
    .catch((err) => console.log(err));
};

// post data check số ngày nghỉ phép
exports.postCheckLeave = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  const checkLeave = req.body.checkLeave;
  const userId = req.body.userId;

  User.findById(userId)
    .then((user) => {
      res.render("work/checkLeave", {
        user: user,
        checkLeave: checkLeave,
        errorMessage: message,
        pageTitle: "Leave Day",
        path: "/checkleave",
      });
    })
    .catch((err) => console.log(err));
};

// post data Nghỉ phép
exports.postLeaveDay = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  // lấy gía trị input
  const userId = req.body.userId;
  let leaveDate = req.body.leaveDate;
  let leaveFromDate = req.body.leaveFromDate;
  let leaveToDate = req.body.leaveToDate;
  let reason = req.body.reason;

  if (leaveDate) {
    leaveDate = moment(leaveDate).format("DD/MM/YYYY");
    // lấy thời gian nghỉ và kiểm tra xem có null không ?
    let leaveTime = 0;
    if (req.body.leaveTime) {
      leaveTime = req.body.leaveTime;
    } else {
      req.flash("error", "Hãy chọn ngày nghỉ!");
      res.redirect("/checkleave");
    }
    const leave = new Leave({
      leaveDate: leaveDate,
      leaveTime: leaveTime,
      reason: reason,
      userId: req.user,
    });
    leave.save();
    User.findById(userId)
      .then((user) => {
        // tính thời gian nghỉ phép còn lại
        user.annualLeave = user.annualLeave - leaveTime;
        user.time = user.time - leaveTime * 3600;
        user.save();
        res.redirect("/user");
      })
      .catch((err) => console.log(err));
  } else if (leaveFromDate) {
    leaveFromDate = moment(leaveFromDate).format("DD/MM/YYYY");
    leaveToDate = moment(leaveToDate).format("DD/MM/YYYY");
    // lấy thời gian nghỉ và kiểm tra xem có null không ?
    let leaveTime = 0;
    if (req.body.leaveTime) {
      leaveTime = req.body.leaveTime;
    } else {
      req.flash("error", "Hãy chọn ngày nghỉ!");
      res.redirect("/checkleave");
    }
    const leave = new Leave({
      leaveDate: leaveFromDate,
      leaveFromDate: leaveFromDate,
      leaveToDate: leaveToDate,
      leaveTime: leaveTime,
      reason: reason,
      userId: req.user,
    });
    leave.save();
    User.findById(userId)
      .then((user) => {
        // tính thời gian nghỉ phép còn lại
        user.annualLeave = user.annualLeave - leaveTime;
        user.time = user.time - leaveTime * 3600;
        user.save();
        res.redirect("/user");
      })
      .catch((err) => console.log(err));
  } else {
    req.flash("error", "Hãy điền đầy đủ thông tin!");
    res.redirect("/checkleave");
  }
};
