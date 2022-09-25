const path = require("path");

const express = require("express");

const workController = require("../controllers/work");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", isAuth, workController.getIndex);

router.post("/postWorkend", isAuth, workController.postWorkEnd);

router.post("/postWorkstart", isAuth, workController.postWorkstart);

// check số ngày
router.get("/checkleave", isAuth, workController.getCheckLeave);

router.post("/postCheckLeave", isAuth, workController.postCheckLeave);

// action form nghỉ phép
router.post("/postLeaveDay", isAuth, workController.postLeaveDay);

module.exports = router;
