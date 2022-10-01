const path = require("path");

const express = require("express");
const { check, body } = require("express-validator/check");

const workController = require("../controllers/work");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", isAuth, workController.getIndex);

router.post("/postWorkend", isAuth, workController.postWorkEnd);

router.post("/postWorkstart", isAuth, workController.postWorkstart);

// get page nghỉ phép
router.get("/checkleave", isAuth, workController.getCheckLeave);

router.post("/import_leave", isAuth, workController.postImportLeave);

router.post(
  "/post_date_leave",
  [
    body("leaveDate").isDate().withMessage("Hãy nhập đúng ngày"),
    body("leaveTime")
      .isFloat({ min: 1, max: 100 })
      .withMessage("Hãy nhập số giờ cho phép còn lại."),
    body("reason")
      .isLength({ min: 0 })
      .isAlphanumeric()
      .withMessage("Không được nhập ký tự đặc biệt."),
  ],
  isAuth,
  workController.postDateLeave
);

// action form nghỉ phép
router.post(
  "/post_many_date_leave",
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
  workController.postManyDateLeave
);

module.exports = router;
