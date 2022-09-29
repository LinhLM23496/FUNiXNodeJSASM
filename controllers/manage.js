const moment = require("moment");

const User = require("../models/user");
const Work = require("../models/work");
const Leave = require("../models/leave");

// page Manage Hằng Ngày
exports.getManageDate = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDate = moment(today).format("DD/MM/YYYY");
  const formatDate2 = moment(today).format("YYYY-MM-DD");
  const formatDateTime = moment(today).format("DD/MM/YYYY - HH:mm:ss");
  req.user
    .populate("_id")
    .then((user_manage) => {
      res.render("manage/date", {
        user_manage: user_manage,
        user_chose: false,
        selected: "",
        prods: "",
        date: formatDateTime,
        today: formatDate2,
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
  const formatDate = moment(today).format("DD/MM/YYYY");
  const formatDate2 = moment(today).format("YYYY-MM-DD");
  const formatDateTime = moment(today).format("DD/MM/YYYY - HH:mm:ss");

  const user_manage_id = req.body.user_manage_id;
  const user_chose_id = req.body.user_chose;

  Promise.all([
    User.findById(user_manage_id),
    User.findById(user_chose_id),
    Work.find({
      date: formatDate,
      userId: user_chose_id,
    }),
    Leave.find({ leaveDate: formatDate, userId: user_chose_id }),
  ])
    .then((result) => {
      const [user_manage, user_chose, work, leave] = result;
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
        date: formatDate,
        today: formatDate2,
        search: "",
        timeLeave: timeLeave,
        lastTotalTime: lastTotalTimeToHours,
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
  const formatDate = moment(today).format("DD/MM/YYYY");
  const formatDate2 = moment(today).format("YYYY-MM-DD");
  const formatDateTime = moment(today).format("DD/MM/YYYY - HH:mm:ss");

  const user_manage_id = req.body.user_manage_id;
  const user_chose_id = req.body.user_chose_id;
  const search = req.body.search;

  // Lấy ngày giờ từ input
  let date = "";
  if (req.body.date) {
    date = moment(req.body.date).format("DD/MM/YYYY");
  } else {
    date = formatDate;
  }
  Promise.all([
    User.findById(user_manage_id),
    User.findById(user_chose_id),
    Work.find({
      position: { $regex: search },
      date: date,
      userId: user_chose_id,
    }),
    Leave.find({ leaveDate: date, userId: user_chose_id }),
  ])
    .then((result) => {
      const [user_manage, user_chose, work, leave] = result;
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
        date: date,
        today: req.body.date,
        search: search,
        timeLeave: timeLeave,
        lastTotalTime: lastTotalTimeToHours,
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
  const formatDate = moment(today).format("DD/MM/YYYY");
  const formatDate2 = moment(today).format("YYYY-MM-DD");
  const formatDateTime = moment(today).format("DD/MM/YYYY - HH:mm:ss");

  const user_manage_id = req.body.user_manage_id;
  const user_chose_id = req.body.user_chose_id;
  const search = req.body.search;
  const date = req.body.date;
  const workId = req.body.workId;
  const dateformatDate = moment(date).format("DD/MM/YYYY");

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
    Work.find({
      position: { $regex: search },
      date: dateformatDate,
      userId: user_chose_id,
    }),
    Leave.find({ leaveDate: dateformatDate, userId: user_chose_id }),
  ])
    .then((result) => {
      const [user_manage, user_chose, work, leave] = result;
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
        pageTitle: "Quản lý ngày",
        path: "/manage/date",
      });
    })
    .catch((err) => console.log(err));
};

// page Manage Hằng Tháng
exports.getManageMonth = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDateTime = moment(today).format("DD/MM/YYYY - HH:mm:ss");
  req.user
    .populate("_id")
    .then((user) => {
      res.render("manage/month", {
        user: user,
        user_manage: false,
        selected: "",
        date: formatDateTime,
        pageTitle: "Quản lý tháng",
        path: "/manage/month",
      });
    })
    .catch((err) => console.log(err));
};

exports.postManageMonth = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDateTime = moment(today).format("DD/MM/YYYY - HH:mm:ss");
  req.user
    .populate("_id")
    .then((user) => {
      res.render("manage/month", {
        user: user,
        user_manage: false,
        selected: "",
        date: formatDateTime,
        pageTitle: "Quản lý tháng",
        path: "/manage/month",
      });
    })
    .catch((err) => console.log(err));
};
