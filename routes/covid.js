const path = require("path");

const express = require("express");

const reportController = require("../controllers/covid");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/temperature", isAuth, reportController.getTemperature);
router.post("/temperature", isAuth, reportController.postTemperature);

router.get("/positive", isAuth, reportController.getPositive);
router.post("/positive", isAuth, reportController.postPositive);

router.get("/vacxin", isAuth, reportController.getVacxin);
router.post("/vacxin", isAuth, reportController.postVacxin);

module.exports = router;
