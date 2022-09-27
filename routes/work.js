const path = require("path");

const express = require("express");
const { check, body } = require("express-validator/check");

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
router.post(
  "/postLeaveDay",
  [
    body("leaveDate").isDate().withMessage("Hãy nhập đúng ngày"),
    body("leaveFromDate").isDate().withMessage("Hãy nhập đúng ngày."),
    body("leaveToDate").isDate().withMessage("Hãy nhập đúng ngày."),
    body("leaveTime")
      .isFloat({ min: 1, max: 100 })
      .withMessage("Hãy nhập số giờ cho phép còn lại."),
    body("reason")
      .isLength({ min: 0 })
      .isAlphanumeric()
      .withMessage("Không được nhập ký tự đặc biệt."),
  ],
  isAuth,
  workController.postLeaveDay
);

module.exports = router;
