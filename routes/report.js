const path = require("path");

const express = require("express");

const reportController = require("../controllers/report");

const router = express.Router();

router.get("/salary", reportController.getReportSalary);

router.post("/salary", reportController.postReportSalary);

router.get("/daily", reportController.getReportDaily);

router.post("/daily", reportController.postReportDaily);

module.exports = router;
