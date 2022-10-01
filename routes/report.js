const path = require("path");

const express = require("express");

const reportController = require("../controllers/report");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/salary", isAuth, reportController.getReportSalary);

router.post("/salary", isAuth, reportController.postReportSalary);

router.get("/daily", isAuth, reportController.getReportDaily);

router.post("/daily", isAuth, reportController.postReportDaily);

router.post("/daily_filter", isAuth, reportController.postReportDailyFilter);

module.exports = router;
