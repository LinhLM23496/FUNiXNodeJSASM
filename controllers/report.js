const moment = require("moment");
const User = require("../models/user");
const Work = require("../models/work");
const Leave = require("../models/leave");

let ITEMS_PER_PAGE = 2;
// get page giờ làm hằng ngày
exports.getReportDaily = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDate = moment(today).format("DD/MM/YYYY");
  const formatDate2 = moment(today).format("YYYY/MM/DD");
  const formatDate3 = moment(today).format("YYYY-MM-DD");

  const page = +req.query.page || 1;
  let totalItems = 0;

  req.user
    .populate("_id")
    .then((user) => {
      Promise.all([
        Work.find({ date: formatDate2, userId: user._id }),
        Work.find({ date: formatDate2, userId: user._id }).countDocuments(),
        Work.find({ date: formatDate2, userId: user._id })
          .skip((page - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE),
        Leave.find({ leaveDate: formatDate2, userId: user._id }),
      ])
        .then((result) => {
          const [workAll, workCount, workFilter, leave] = result;
          totalItems = workCount;
          // Thời gian đăng ký nghỉ
          let timeLeave = 0;
          leave.forEach((leave) => {
            timeLeave += leave.leaveTime;
          });

          // Tổng thời gian làm việc
          let lastTotalTime = 0;
          workAll.map((workAll) => {
            moment.duration(workAll.workTime).asSeconds();
            lastTotalTime += moment.duration(workAll.workTime).asSeconds();
          });
          // tổng thời gian làm việc + thời gian đăng ký
          let lastTotalTimeToSeconds = lastTotalTime + timeLeave * 3600;

          let lastTotalTimeToHours = moment
            .utc(lastTotalTimeToSeconds * 1000)
            .format("HH:mm:ss");

          res.render("report/daily", {
            user: user,
            workAll: workAll,
            prods: workFilter,
            date: formatDate,
            today: formatDate3,
            search: "",
            numberFilter: ITEMS_PER_PAGE,
            timeLeave: timeLeave,
            lastTotalTime: lastTotalTimeToHours,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
  const page = +req.query.page || 1;
  let totalItems = 0;
  ITEMS_PER_PAGE = req.body.numberFilter
    ? req.body.numberFilter
    : ITEMS_PER_PAGE;

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
    Work.find({
      position: { $regex: search },
      date: date,
      userId: userId,
    }).countDocuments(),
    Work.find({
      position: { $regex: search },
      date: date,
      userId: userId,
    })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE),
    Leave.find({ leaveDate: date, userId: userId }),
  ])
    .then((result) => {
      const [user, workAll, workCount, workFilter, leave] = result;
      totalItems = workCount;
      let timeLeave = 0;
      leave.map((leave) => {
        timeLeave += leave.leaveTime;
      });

      // Tổng thời gian làm việc
      let lastTotalTime = 0;
      workAll.map((workAll) => {
        moment.duration(workAll.workTime).asSeconds();
        lastTotalTime += moment.duration(workAll.workTime).asSeconds();
      });
      // tổng thời gian làm việc + thời gian đăng ký
      let lastTotalTimeToSeconds = lastTotalTime + timeLeave * 3600;

      let lastTotalTimeToHours = moment
        .utc(lastTotalTimeToSeconds * 1000)
        .format("HH:mm:ss");

      res.render("report/daily", {
        user: user,
        workAll: workAll,
        prods: workFilter,
        date: date.split("/").reverse().join("/"),
        today: req.body.dateDaily,
        search: search,
        numberFilter: ITEMS_PER_PAGE,
        timeLeave: timeLeave,
        lastTotalTime: lastTotalTimeToHours,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        pageTitle: "Report Daily",
        path: "/report/daily",
      });
    })
    .catch((err) => console.log(err));
};
// Action chuyển trang
exports.postReportDailyFilter = (req, res, next) => {
  // Lấy data input search và lọc nó vs DB Work
  const userId = req.body.userId;
  let search = req.body.search;
  const page = +req.body.nextPage || 1;
  let totalItems = 0;

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
    Work.find({
      position: { $regex: search },
      date: date,
      userId: userId,
    }).countDocuments(),
    Work.find({
      position: { $regex: search },
      date: date,
      userId: userId,
    })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE),
    Leave.find({ leaveDate: date, userId: userId }),
  ])
    .then((result) => {
      const [user, workAll, workCount, workFilter, leave] = result;
      totalItems = workCount;
      let timeLeave = 0;
      leave.map((leave) => {
        timeLeave += leave.leaveTime;
      });

      // Tổng thời gian làm việc
      let lastTotalTime = 0;
      workAll.map((workAll) => {
        moment.duration(workAll.workTime).asSeconds();
        lastTotalTime += moment.duration(workAll.workTime).asSeconds();
      });
      // tổng thời gian làm việc + thời gian đăng ký
      let lastTotalTimeToSeconds = lastTotalTime + timeLeave * 3600;

      let lastTotalTimeToHours = moment
        .utc(lastTotalTimeToSeconds * 1000)
        .format("HH:mm:ss");

      res.render("report/daily", {
        user: user,
        workAll: workAll,
        prods: workFilter,
        date: date.split("/").reverse().join("/"),
        today: req.body.dateDaily,
        search: search,
        numberFilter: ITEMS_PER_PAGE,
        timeLeave: timeLeave,
        lastTotalTime: lastTotalTimeToHours,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        pageTitle: "Report Daily",
        path: "/report/daily",
      });
    })
    .catch((err) => console.log(err));
};

// get page Lương tháng
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
  const formatMonth2 = moment(today).format("YYYY-MM");
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
        today: month.split("-").reverse().join("/"),
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
