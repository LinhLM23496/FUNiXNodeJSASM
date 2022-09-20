const path = require("path");

const express = require("express");

const workController = require("../controllers/work");

const router = express.Router();

router.get("/", workController.getIndex);

router.post("/postWorkend", workController.postWorkEnd);

router.post("/postWorkstart", workController.postWorkstart);

// check số ngày
router.get("/checkleave", workController.getCheckLeave);

router.post("/postCheckLeave", workController.postCheckLeave);

// action form nghỉ phép
router.post("/postLeaveDay", workController.postLeaveDay);

module.exports = router;
