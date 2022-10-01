const moment = require("moment");

const User = require("../models/user");
const Work = require("../models/work");
const Leave = require("../models/leave");

// page Manage Hằng Ngày
exports.getManageDate = (req, res, next) => {
  req.user
    .populate("_id")
    .then((user_manage) => {
      res.render("manage/date", {
        user_manage: user_manage,
        user_chose: false,
        selected: "",
        prods: "",
        date: "",
        today: "",
        search: "",
        timeLeave: "",
        lastTotalTime: "",
        pageTitle: "Quản lý ngày",
        path: "/manage/date",
      });
    })
    .catch((err) => console.log(err));
};
// Action chọn nhân viên
exports.postManageUserChose = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDate = moment(today).format("YYYY/MM/DD");
  const formatDate2 = moment(today).format("YYYY-MM-DD");
  const formatMonthLock = moment(today).format("YYYY/MM");

  const user_manage_id = req.body.user_manage_id;
  const user_chose_id = req.body.user_chose;
  let lock = false;

  Promise.all([
    User.findById(user_manage_id),
    User.findById(user_chose_id),
    User.find({ _id: user_chose_id, lock: formatMonthLock }),
    Work.find({
      date: formatDate,
      userId: user_chose_id,
    }),
    Leave.find({ leaveDate: formatDate, userId: user_chose_id }),
  ])
    .then((result) => {
      const [user_manage, user_chose, userCheck, work, leave] = result;
      if (userCheck.length > 0) {
        lock = true;
      }
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

      res.render("manage/date", {
        user_manage: user_manage,
        user_chose: user_chose,
        selected: user_chose_id,
        prods: work,
        date: formatDate.split("/").reverse().join("/"),
        today: formatDate2,
        search: "",
        timeLeave: timeLeave,
        lastTotalTime: lastTotalTimeToHours,
        lock: lock,
        pageTitle: "Quản lý ngày",
        path: "/manage/date",
      });
    })
    .catch((err) => console.log(err));
};

// Action chọn ngày
exports.postManageSearch = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDate = moment(today).format("YYYY/MM/DD");
  const formatMonthLock = moment(today).format("YYYY/MM");

  const user_manage_id = req.body.user_manage_id;
  const user_chose_id = req.body.user_chose_id;
  const search = req.body.search;
  let lock = false;

  // Lấy ngày giờ từ input
  let date = "";
  if (req.body.date) {
    date = moment(req.body.date).format("YYYY/MM/DD");
  } else {
    date = formatDate;
  }
  Promise.all([
    User.findById(user_manage_id),
    User.findById(user_chose_id),
    User.find({ _id: user_chose_id, lock: formatMonthLock }),
    Work.find({
      position: { $regex: search },
      date: date,
      userId: user_chose_id,
    }),
    Leave.find({ leaveDate: date, userId: user_chose_id }),
  ])
    .then((result) => {
      const [user_manage, user_chose, userCheck, work, leave] = result;
      if (userCheck.length > 0) {
        lock = true;
      }
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

      res.render("manage/date", {
        user_manage: user_manage,
        user_chose: user_chose,
        selected: user_chose_id,
        prods: work,
        date: date.split("/").reverse().join("/"),
        today: req.body.date,
        search: search,
        timeLeave: timeLeave,
        lastTotalTime: lastTotalTimeToHours,
        lock: lock,
        pageTitle: "Quản lý ngày",
        path: "/manage/date",
      });
    })
    .catch((err) => console.log(err));
};

// Action Xóa giờ làm
exports.postManageDelWork = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDate = moment(today).format("YYYY/MM/DD");
  const formatDate2 = moment(today).format("YYYY-MM-DD");
  const formatDateTime = moment(today).format("DD/MM/YYYY - HH:mm:ss");
  const formatMonthLock = moment(today).format("YYYY/MM");

  const user_manage_id = req.body.user_manage_id;
  const user_chose_id = req.body.user_chose_id;
  const search = req.body.search;
  const date = req.body.date;
  const workId = req.body.workId;
  const dateformatDate = moment(date).format("YYYY/MM/DD");
  let lock = false;

  Work.deleteOne({ _id: workId })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  Promise.all([
    User.findById(user_manage_id),
    User.findById(user_chose_id),
    User.find({ _id: user_chose_id, lock: formatMonthLock }),
    Work.find({
      position: { $regex: search },
      date: dateformatDate,
      userId: user_chose_id,
    }),
    Leave.find({ leaveDate: dateformatDate, userId: user_chose_id }),
  ])
    .then((result) => {
      const [user_manage, user_chose, userCheck, work, leave] = result;
      if (userCheck.length > 0) {
        lock = true;
      }
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

      res.render("manage/date", {
        user_manage: user_manage,
        user_chose: user_chose,
        selected: user_chose_id,
        prods: work,
        date: dateformatDate,
        today: date,
        search: search,
        timeLeave: timeLeave,
        lastTotalTime: lastTotalTimeToHours,
        lock: lock,
        pageTitle: "Quản lý ngày",
        path: "/manage/date",
      });
    })
    .catch((err) => console.log(err));
};

// page Manage Hằng Tháng
exports.getManageMonth = (req, res, next) => {
  req.user
    .populate("_id")
    .then((user_manage) => {
      res.render("manage/month", {
        user_manage: user_manage,
        user_chose: false,
        selected: "",
        prods: "",
        month: "",
        toMonth: "",
        search: "",
        timeLeave: "",
        lastTotalTime: "",
        pageTitle: "Quản lý tháng",
        path: "/manage/month",
      });
    })
    .catch((err) => console.log(err));
};

// Action chọn nhân viên
exports.postManageUserChoseMonth = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatMonth = moment(today).format("MM/YYYY");
  const formatMonth2 = moment(today).format("YYYY-MM");
  const formatMonthStart = moment(today).format("YYYY/MM/01");
  const formatMonthEnd = moment(today).format("YYYY/MM/31");
  const formatMonth3 = formatMonth.split("/").reverse().join("/");
  const formatMonthLock = moment(today).format("YYYY/MM");

  const user_manage_id = req.body.user_manage_id;
  const user_chose_id = req.body.user_chose;
  let lock = false;

  Promise.all([
    User.findById(user_manage_id),
    User.findById(user_chose_id),
    User.find({ _id: user_chose_id, lock: formatMonthLock }),
    Work.find({
      date: { $gte: formatMonthStart, $lte: formatMonthEnd },
      userId: user_chose_id,
    }),
    Leave.find({
      leaveDate: { $gte: formatMonthStart, $lte: formatMonthEnd },
      userId: user_chose_id,
    }),
  ])
    .then((result) => {
      const [user_manage, user_chose, userCheck, work, leave] = result;
      if (userCheck.length > 0) {
        lock = true;
      }
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

      res.render("manage/month", {
        user_manage: user_manage,
        user_chose: user_chose,
        selected: user_chose_id,
        prods: work,
        month: formatMonth,
        timeLeave: timeLeave,
        lock: lock,
        lastTotalTime: lastTotalTimeToHours,
        pageTitle: "Quản lý tháng",
        path: "/manage/month",
      });
    })
    .catch((err) => console.log(err));
};

// Action tìm kiếm theo tháng
exports.postManageSearchMonth = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatMonth = moment(today).format("MM/YYYY");
  const formatMonth2 = moment(today).format("YYYY-MM");
  const formatMonthStart = moment(today).format("YYYY/MM/01");
  const formatMonthEnd = moment(today).format("YYYY/MM/31");
  const formatMonthLock = moment(today).format("YYYY/MM");

  const user_manage_id = req.body.user_manage_id;
  const user_chose_id = req.body.user_chose_id;
  let lock = false;

  // Lấy ngày giờ từ input
  let month = "";
  let monthStart = "";
  let monthEnd = "";
  if (req.body.month) {
    monthStart = moment(req.body.month).format("YYYY/MM/01");
    monthEnd = moment(req.body.month).format("YYYY/MM/31");
    month = moment(req.body.month).format("MM/YYYY");
  } else {
    monthStart = formatMonthStart;
    monthEnd = formatMonthEnd;
    month = formatMonth;
  }

  Promise.all([
    User.findById(user_manage_id),
    User.findById(user_chose_id),
    User.find({ _id: user_chose_id, lock: formatMonthLock }),
    Work.find({
      date: { $gte: monthStart, $lte: monthEnd },
      userId: user_chose_id,
    }),
    Leave.find({
      leaveDate: { $gte: monthStart, $lte: monthEnd },
      userId: user_chose_id,
    }),
  ])
    .then((result) => {
      const [user_manage, user_chose, userCheck, work, leave] = result;
      if (userCheck.length > 0) {
        lock = true;
      }
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

      res.render("manage/month", {
        user_manage: user_manage,
        user_chose: user_chose,
        selected: user_chose_id,
        prods: work,
        month: month,
        timeLeave: timeLeave,
        lastTotalTime: lastTotalTimeToHours,
        lock: lock,
        pageTitle: "Quản lý tháng",
        path: "/manage/month",
      });
    })
    .catch((err) => console.log(err));
};

// Action Xóa giờ làm Month
exports.postManageDelWorkMonth = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatMonth = moment(today).format("MM/YYYY");
  const formatMonth2 = moment(today).format("YYYY-MM");
  const formatMonthStart = moment(today).format("YYYY/MM/01");
  const formatMonthEnd = moment(today).format("YYYY/MM/31");
  const formatMonthLock = moment(today).format("YYYY/MM");

  const user_manage_id = req.body.user_manage_id;
  const user_chose_id = req.body.user_chose_id;
  const workId = req.body.workId;
  let lock = false;

  // Lấy ngày giờ từ input
  let month = "";
  let monthStart = "";
  let monthEnd = "";
  if (req.body.month) {
    monthStart = moment(req.body.month).format("YYYY/MM/01");
    monthEnd = moment(req.body.month).format("YYYY/MM/31");
    month = moment(req.body.month).format("MM/YYYY");
  } else {
    monthStart = formatMonthStart;
    monthEnd = formatMonthEnd;
    month = formatMonth;
  }

  Work.deleteOne({ _id: workId })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  Promise.all([
    User.findById(user_manage_id),
    User.findById(user_chose_id),
    User.find({ _id: user_chose_id, lock: formatMonthLock }),
    Work.find({
      date: { $gte: monthStart, $lte: monthEnd },
      userId: user_chose_id,
    }),
    Leave.find({
      leaveDate: { $gte: monthStart, $lte: monthEnd },
      userId: user_chose_id,
    }),
  ])
    .then((result) => {
      const [user_manage, user_chose, userCheck, work, leave] = result;
      if (userCheck.length > 0) {
        lock = true;
      }
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

      res.render("manage/month", {
        user_manage: user_manage,
        user_chose: user_chose,
        selected: user_chose_id,
        prods: work,
        month: month,
        timeLeave: timeLeave,
        lastTotalTime: lastTotalTimeToHours,
        lock: lock,
        pageTitle: "Quản lý tháng",
        path: "/manage/month",
      });
    })
    .catch((err) => console.log(err));
};

// Action xác nhận dữ liệu người dùng
exports.postManageSuccessUser = (req, res, next) => {
  const user_chose_id = req.body.user_chose_id;
  const month = req.body.month;
  let monthFormat = new Date(month);

  User.find({ _id: user_chose_id, lock: month })
    .then((user) => {
      if (user.length > 0) {
        return res.redirect("/manage/month");
      }
      User.findById(user_chose_id)
        .then((user) => {
          user.lock.push(month);
          user.save();
          return res.redirect("/manage/month");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};
