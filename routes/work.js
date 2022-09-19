const path = require('path');

const express = require('express');

const workController = require('../controllers/work');

const router = express.Router();

router.get('/', workController.getIndex);

router.post('/', workController.postWorkEnd);

router.post('/work-end', workController.postIndex);

router.get('/checkleave', workController.getCheckLeave);

router.post('/checkleave', workController.postCheckLeave);

router.post('/leaveday', workController.postLeaveDay);

module.exports = router;