const moment = require("moment");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const User = require("../models/user");
const Covid = require("../models/covid");

// page Thân nhiệt
exports.getTemperature = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDateTime = moment(today).format("DD/MM/YYYY - HH:mm:ss");
  req.user
    .populate("_id")
    .then((user) => {
      res.render("covid/temperature", {
        user: user,
        date: formatDateTime,
        pageTitle: "Covid Temperature",
        path: "/covid/temperature",
      });
    })
    .catch((err) => console.log(err));
};

exports.postTemperature = (req, res, next) => {
  const userId = req.body.userId;
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDate = moment(today).format("DD/MM/YYYY");
  const formatTime = moment(today).format("HH:mm:ss");
  //action page Thân nhiệt
  let temperature = req.body.temperature;
  let temperatureDate = formatDate;
  let temperatureTime = formatTime;
  Covid.find({ date: temperatureDate, userId: userId })
    .then((covid) => {
      if (covid.length === 0) {
        const covid = new Covid({
          date: temperatureDate,
          time: temperatureTime,
          temperature: temperature,
          positive: false,
          positiveDay: "",
          userId: req.user,
        });
        covid.save();
      }
      if (covid.length > 0) {
        covid.map((covid) => {
          covid.temperature = temperature;
          return covid.save();
        });
      }
      res.redirect("/covid/positive");
    })
    .catch((err) => console.log(err));
};

// page Báo nhiễm
exports.getPositive = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDate2 = moment(today).format("YYYY-MM-DD");
  req.user
    .populate("_id")
    .then((user) => {
      res.render("covid/positive", {
        user: user,
        today: formatDate2,
        pageTitle: "Covid Positive",
        path: "/covid/positive",
      });
    })
    .catch((err) => console.log(err));
};

exports.postPositive = (req, res, next) => {
  const userId = req.body.userId;
  let statusCovid = req.body.statusCovid;
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDate = moment(today).format("DD/MM/YYYY");
  //action page Báo nhiễm
  let date = "";

  if (req.body.date) {
    date = moment(req.body.date).format("DD/MM/YYYY");
  } else {
    date = formatDate;
  }
  Promise.all([
    User.findById(userId),
    Covid.find({ date: formatDate, userId: userId }),
  ])
    .then((result) => {
      const [user, covid] = result;
      user.statusCovid = statusCovid;
      user.save();
      if (covid.length === 0) {
        const covid = new Covid({
          date: formatDate,
          temperature: 0,
          positive: statusCovid,
          positiveDay: date,
          today: req.body.date,
          userId: req.user,
        });
        covid.save();
      }
      if (covid.length > 0) {
        covid.map((covid) => {
          covid.positiveDay = date;
          covid.positive = statusCovid;
          return covid.save();
        });
      }
      res.redirect("/covid/positive");
    })
    .catch((err) => console.log(err));
};

exports.getVacxin = (req, res, next) => {
  req.user
    .populate("_id")
    .then((user) => {
      res.render("covid/vacxin", {
        user: user,
        pageTitle: "Covid Vacxin",
        path: "/covid/vacxin",
      });
    })
    .catch((err) => console.log(err));
};

exports.postVacxin = (req, res, next) => {
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const formatDate = moment(today).format("YYYY-MM-DD");

  const userId = req.body.userId;
  let addressVacxin1 = req.body.addressVacxin1;
  let timeVacxin1 = req.body.timeVacxin1
    ? moment(req.body.timeVacxin1).format("YYYY-MM-DD")
    : formatDate;
  let addressVacxin2 = req.body.addressVacxin2;
  let timeVacxin2 = req.body.timeVacxin2
    ? moment(req.body.timeVacxin2).format("YYYY-MM-DD")
    : formatDate;
  User.findById(userId)
    .then((user) => {
      user.vacxin1 = addressVacxin1;
      user.dateV1 = timeVacxin1;
      user.vacxin2 = addressVacxin2;
      user.dateV2 = timeVacxin2;
      user.save();
      return res.redirect("/covid/vacxin");
    })
    .catch((err) => console.log(err));
};

// page Report Covid
exports.getReportCovid = (req, res, next) => {
  req.user
    .populate("_id")
    .then((user) => {
      res.render("covid/reportCovid", {
        user: user,
        user_manage: false,
        selected: "",
        pageTitle: "Report Covid",
        path: "/covid/reportcovid",
      });
    })
    .catch((err) => console.log(err));
};
exports.postReportCovid = (req, res, next) => {
  const userId = req.body.userId;
  const user_chose = req.body.user_chose;
  Promise.all([User.findById(userId), Covid.find({ userId: user_chose })])
    .then((result) => {
      const [user, covid] = result;
      res.render("covid/reportCovid", {
        user: user,
        user_manage: covid,
        selected: user_chose,
        pageTitle: "Report Covid",
        path: "/covid/reportcovid",
      });
    })
    .catch((err) => console.log(err));
};

exports.getInvoice = (req, res, next) => {
  const selected = req.params.selected;
  Covid.find({ userId: selected })
    .then((covid) => {
      if (!covid) {
        return next(new Error("No order found."));
      }
      let userName = "";
      let check = false;
      req.user.manage.forEach((user) => {
        if (user._id.toString() === selected) {
          check = true;
          userName = user.name;
        }
      });
      if (!check) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + selected + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);
      const positive = (boolean) => {
        if (boolean) {
          return "Positive";
        } else {
          return "Negative";
        }
      };

      const pdfDoc = new PDFDocument({ margin: 30, size: "A4" });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Information Covid", {
        underline: true,
        align: "center",
      });
      pdfDoc.text("-----------------------", {
        align: "center",
      });
      pdfDoc.text("Tên: " + userName, {
        align: "center",
      });

      // move to down
      pdfDoc.moveDown();
      covid.forEach((prod) => {
        pdfDoc
          .fontSize(14)
          .text(
            prod.date +
              " - " +
              prod.time +
              "||" +
              prod.temperature +
              "||" +
              positive(prod.positive)
          );
      });
      pdfDoc.text("---");
      pdfDoc.end();

      const file = fs.createReadStream(invoicePath);

      file.pipe(res);
    })
    .catch((err) => next(err));
};
