const moment = require("moment");
const User = require("../models/user");
const Work = require("../models/work");
const Leave = require("../models/leave");

// page report giờ làm hằng ngày
exports.getReportDaily = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDate = moment(today).format("DD/MM/YYYY");
  const formatDate2 = moment(today).format("YYYY/MM/DD");
  const formatDate3 = moment(today).format("YYYY-MM-DD");

  req.user
    .populate("_id")
    .then((user) => {
      Promise.all([
        Work.find({ date: formatDate2, userId: user._id }),
        Leave.find({ leaveDate: formatDate2, userId: user._id }),
      ])
        .then((result) => {
          const [work, leave] = result;

          console.log(leave);
          // Thời gian đăng ký nghỉ
          let timeLeave = 0;
          leave.forEach((leave) => {
            timeLeave += leave.leaveTime;
          });

          // Tổng thời gian làm việc
          let lastTotalTime = 0;
          work.map((work) => {
            moment.duration(work.workTime).asSeconds();
            lastTotalTime += moment.duration(work.workTime).asSeconds();
          });
          // tổng thời gian làm việc + thời gian đăng ký
          let lastTotalTimeToSeconds = lastTotalTime + timeLeave * 3600;

          let lastTotalTimeToHours = moment
            .utc(lastTotalTimeToSeconds * 1000)
            .format("HH:mm:ss");

          res.render("report/daily", {
            user: user,
            prods: work,
            date: formatDate,
            today: formatDate3,
            search: "",
            timeLeave: timeLeave,
            lastTotalTime: lastTotalTimeToHours,
            pageTitle: "Report Daily",
            path: "/report/daily",
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postReportDaily = (req, res, next) => {
  // Lấy data input search và lọc nó vs DB Work
  const userId = req.body.userId;
  let search = req.body.search;

  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDate = moment(today).format("DD/MM/YYYY");
  const formatDate2 = moment(today).format("YYYY/MM/DD");

  // Lấy ngày giờ từ input
  let date = "";
  if (req.body.dateDaily) {
    date = moment(req.body.dateDaily).format("YYYY/MM/DD");
  } else {
    date = formatDate2;
  }

  Promise.all([
    User.findById(userId),
    Work.find({
      position: { $regex: search },
      date: date,
      userId: userId,
    }),
    Leave.find({ leaveDate: date, userId: userId }),
  ])
    .then((result) => {
      const [user, work, leave] = result;
      let timeLeave = 0;
      leave.map((leave) => {
        timeLeave += leave.leaveTime;
      });

      // Tổng thời gian làm việc
      let lastTotalTime = 0;
      work.map((work) => {
        moment.duration(work.workTime).asSeconds();
        lastTotalTime += moment.duration(work.workTime).asSeconds();
      });
      // tổng thời gian làm việc + thời gian đăng ký
      let lastTotalTimeToSeconds = lastTotalTime + timeLeave * 3600;

      let lastTotalTimeToHours = moment
        .utc(lastTotalTimeToSeconds * 1000)
        .format("HH:mm:ss");

      res.render("report/daily", {
        user: user,
        prods: work,
        date: date.split("/").reverse().join("/"),
        today: req.body.dateDaily,
        search: search,
        timeLeave: timeLeave,
        lastTotalTime: lastTotalTimeToHours,
        pageTitle: "Report Daily",
        path: "/report/daily",
      });
    })
    .catch((err) => console.log(err));
};

// get page Lương
exports.getReportSalary = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatMonth = moment(today).format("MM/YYYY");
  const formatMonth2 = moment(today).format("YYYY-MM");
  req.user.populate("_id").then((user) => {
    res.render("report/salary", {
      haveWork: false,
      user: user,
      pageTitle: "Report Salary",
      path: "/report/salary",
    });
  });
};

exports.postReportSalary = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatMonth = moment(today).format("MM-YYYY");
  const formatMonth2 = moment(today).format("YYYY-MM");
  const formatMonthStart = moment(today).format("YYYY/MM/01");
  const formatMonthEnd = moment(today).format("YYYY/MM/31");

  const userId = req.body.userId;

  let month = "";
  let monthStart = "";
  let monthEnd = "";
  if (req.body.month) {
    monthStart = moment(req.body.month).format("YYYY/MM/01");
    monthEnd = moment(req.body.month).format("YYYY/MM/31");
    month = moment(req.body.month).format("YYYY-MM");
  } else {
    monthStart = moment(today).format("YYYY/MM/01");
    monthEnd = moment(today).format("YYYY/MM/31");
    month = formatMonth2;
  }

  Promise.all([
    User.findById(userId),
    Work.find({
      date: { $gte: monthStart, $lte: monthEnd },
      userId: userId,
    }),
  ])
    .then((result) => {
      const [user, work] = result;
      let salaryScale = 0;
      let timeWorkSeconds = 0;
      let timeOverSeconds = 0;

      work.map((work) => {
        let workTime = moment.duration(work.workTime).asSeconds();
        let overTime = moment.duration(work.overTime).asSeconds();
        timeWorkSeconds += workTime;
        timeOverSeconds += overTime;
      });

      let workTime = moment.utc(timeWorkSeconds * 1000).format("HH:mm:ss");
      let overTime = moment.utc(timeOverSeconds * 1000).format("HH:mm:ss");
      let enoughTime = (user.time / 3600).toFixed(2);

      salaryScale =
        user.salaryScale * 3000000 +
        ((timeOverSeconds - user.time) * 200000) / 3600;

      if (timeWorkSeconds === 0) {
        salaryScale = 0;
        enoughTime = 0;
      }

      res.render("report/salary", {
        user: user,
        haveWork: true,
        today: month,
        salaryScale: salaryScale.toFixed(0),
        workTime: workTime,
        overTime: overTime,
        enoughTime: enoughTime,
        pageTitle: "Report Salary",
        path: "/report/salary",
      });
    })
    .catch((err) => console.log(err));
};
