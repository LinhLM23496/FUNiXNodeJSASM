const path = require("path");

const express = require("express");

const manageController = require("../controllers/manage");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/date", isAuth, manageController.getManageDate);
router.post("/user_chose", isAuth, manageController.postManageUserChose);
router.post("/search", isAuth, manageController.postManageSearch);
router.post("/delwork", isAuth, manageController.postManageDelWork);

router.get("/month", isAuth, manageController.getManageMonth);
router.post(
  "/user_chose_month",
  isAuth,
  manageController.postManageUserChoseMonth
);
router.post("/search_month", isAuth, manageController.postManageSearchMonth);
router.post("/delwork_month", isAuth, manageController.postManageDelWorkMonth);
router.post(
  "/success_user_chose",
  isAuth,
  manageController.postManageSuccessUser
);

module.exports = router;
