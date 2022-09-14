const path = require('path');

const express = require('express');

const reportController = require('../controllers/covid');

const router = express.Router();

router.get('/temperature', reportController.getTemperature);

router.get('/positive', reportController.getPositive);

router.post('/positive', reportController.postPositive);

router.get('/vacxin', reportController.getVacxin);

router.post('/vacxin', reportController.postVacxin);

module.exports = router;