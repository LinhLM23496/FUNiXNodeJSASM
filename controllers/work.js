const { validationResult } = require("express-validator/check");
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
  req.user
    .populate("_id")
    .then((user) => {
      res.render("work/checkLeave", {
        user: user,
        checkLeave: 0,
        errorMessage: "",
        oldInput: {
          leaveDate: "",
          leaveTime: 0,
          reason: "",
          leaveFromDate: "",
          leaveToDate: "",
        },
        pageTitle: "Số ngày nghỉ",
        path: "/checkleave",
      });
    })
    .catch((err) => console.log(err));
};

// post data check số ngày nghỉ phép
exports.postCheckLeave = (req, res, next) => {
  const checkLeave = req.body.checkLeave;
  const userId = req.body.userId;

  User.findById(userId)
    .then((user) => {
      res.render("work/checkLeave", {
        user: user,
        checkLeave: checkLeave,
        errorMessage: "",
        oldInput: {
          leaveDate: "",
          leaveTime: 0,
          reason: "",
          leaveFromDate: "",
          leaveToDate: "",
        },
        pageTitle: "Leave Day",
        path: "/checkleave",
      });
    })
    .catch((err) => console.log(err));
};

// post data Nghỉ phép
exports.postLeaveDay = (req, res, next) => {
  // lấy gía trị input
  const errors = validationResult(req);
  const userId = req.body.userId;
  let checkLeave = req.body.checkLeave;
  let leaveTime = req.body.leaveTime;
  let leaveDate = req.body.leaveDate;
  let leaveFromDate = req.body.leaveFromDate;
  let leaveToDate = req.body.leaveToDate;
  let reason = req.body.reason;

  leaveDate = leaveDate ? moment(leaveDate).format("DD/MM/YYYY") : "0";
  leaveFromDate = leaveFromDate
    ? moment(leaveFromDate).format("DD/MM/YYYY")
    : "0";
  leaveToDate = leaveToDate ? moment(leaveToDate).format("DD/MM/YYYY") : "0";

  if (checkLeave == 1) {
    // kiểm tra input xem có null không ?
    if (leaveDate === "0") {
      User.findById(userId)
        .then((user) => {
          return res.status(422).render("work/checkLeave", {
            user: user,
            checkLeave: checkLeave,
            errorMessage: errors.array()[0].msg,
            oldInput: {
              leaveDate: req.body.leaveDate,
              leaveTime: leaveTime,
              reason: reason,
              leaveFromDate: "",
              leaveToDate: "",
            },
            pageTitle: "Leave Day",
            path: "/checkleave",
          });
        })
        .catch((err) => console.log(err));
    } else if (leaveTime <= 0) {
      User.findById(userId)
        .then((user) => {
          return res.status(422).render("work/checkLeave", {
            user: user,
            checkLeave: checkLeave,
            errorMessage: errors.array()[2].msg,
            oldInput: {
              leaveDate: req.body.leaveDate,
              leaveTime: leaveTime,
              reason: reason,
              leaveFromDate: "",
              leaveToDate: "",
            },
            pageTitle: "Leave Day",
            path: "/checkleave",
          });
        })
        .catch((err) => console.log(err));
    } else {
      const leave = new Leave({
        leaveDate: leaveDate,
        leaveTime: leaveTime,
        reason: reason,
        userId: userId,
      });
      leave.save();
      User.findById(userId)
        .then((user) => {
          // tính thời gian nghỉ phép còn lại
          user.annualLeave = user.annualLeave - leaveTime;
          user.time = user.time - leaveTime * 3600;
          user.save();
          return res.redirect("/user");
        })
        .catch((err) => console.log(err));
    }
  } else if (checkLeave == 2) {
    // check nhập ngày từ và đến sai
    if (
      leaveFromDate === "0" ||
      leaveToDate === "0" ||
      leaveFromDate > leaveToDate
    ) {
      User.findById(userId)
        .then((user) => {
          return res.status(422).render("work/checkLeave", {
            user: user,
            checkLeave: checkLeave,
            errorMessage: errors.array()[0].msg,
            oldInput: {
              leaveDate: leaveDate,
              leaveTime: leaveTime,
              reason: reason,
              leaveFromDate: req.body.leaveFromDate,
              leaveToDate: req.body.leaveToDate,
            },
            pageTitle: "Leave Day",
            path: "/checkleave",
          });
        })
        .catch((err) => console.log(err));
    } else if (leaveTime <= 0) {
      // check thời gian nghỉ phép
      User.findById(userId)
        .then((user) => {
          console.log(errors.array());
          return res.status(422).render("work/checkLeave", {
            user: user,
            checkLeave: checkLeave,
            errorMessage: errors.array()[1].msg,
            oldInput: {
              leaveDate: leaveDate,
              leaveTime: leaveTime,
              reason: reason,
              leaveFromDate: req.body.leaveFromDate,
              leaveToDate: req.body.leaveToDate,
            },
            pageTitle: "Leave Day",
            path: "/checkleave",
          });
        })
        .catch((err) => console.log(err));
    } else {
      const leave = new Leave({
        leaveDate: leaveFromDate,
        leaveFromDate: leaveFromDate,
        leaveToDate: leaveToDate,
        leaveTime: leaveTime,
        reason: reason,
        userId: userId,
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
    }
  }
};
