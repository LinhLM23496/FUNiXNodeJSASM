const moment = require('moment')
const User = require('../models/user');
const Covid = require('../models/covid');

// get data page Thân nhiệt
exports.getTemperature = (req, res, next) => {
    // Lấy ngày giờ hiện tại
    const today = new Date();
    const formatDateTime = moment(today).format('DD/MM/YYYY - HH:mm:ss')
    User.findOne()
    .then(user => {
        res.render('covid/temperature', {
            user: user,
            date: formatDateTime,
            pageTitle: 'Covid Temperature',
            path: '/covid/temperature'
        });
    })
    .catch(err => console.log(err));
};

// get data page báo nhiễm
exports.getPositive = (req, res, next) => {
    User.findOne()
    .then(user => {
        res.render('covid/positive', {
        user: user,
        pageTitle: 'Covid Positive',
        path: '/covid/positive'
        });
    })
    .catch(err => console.log(err));
};

// post data page Thân nhiệt và page Báo nhiễm
exports.postPositive = (req, res, next) => {
    // Lấy ngày giờ hiện tại
    const today = new Date();
    const formatDate = moment(today).format('DD/MM/YYYY');
    const formatTime = moment(today).format('HH:mm:ss');
    //action page Thân nhiệt
    if (req.body.temperature) {
        let temperature = req.body.temperature;
        let temperatureDate = formatDate;
        let temperatureTime = formatTime;
        Promise.all([Covid.find({ date: temperatureDate }), User.findOne()])
            .then(result => {
                const [covid, user] = result;
                if (covid.length === 0) {
                    const covid = new Covid({
                        date: temperatureDate,
                        time: temperatureTime,
                        temperature: temperature,
                        positive: false,
                        positiveDay: '',
                        userId: req.user,
                    })
                    covid.save()
                }
                if (covid.length > 0) {
                    covid.map(covid => {
                        covid.temperature = temperature;
                        return covid.save()
                    })
                }
                res.render('covid/positive', {
                    user: user,
                    pageTitle: 'Covid Positive',
                    path: '/covid/positive'
                })
            })
            .catch(err => console.log(err));
    }
    //action page Báo nhiễm
    if (req.body.statusCovid) {
        let statusCovid = req.body.statusCovid;
        let date = "";
        if (req.body.date) {
            date = moment(req.body.date).format('DD/MM/YYYY');
        } else {
            date = formatDate;
        }
        Promise.all([Covid.find({ date: formatDate }), User.findOne()])
            .then(result => {
                const [covid, user] = result;
                user.statusCovid = statusCovid;
                user.save();
                if (covid.length === 0) {
                    const covid = new Covid({
                        date: formatDate,
                        temperature: 0,
                        positive: statusCovid,
                        positiveDay: date,
                        userId: req.user,
                    })
                    covid.save()
                }
                if (covid.length > 0) {
                    covid.map(covid => {
                        covid.positiveDay = date;
                        covid.positive = statusCovid;
                        return covid.save();
                    })
                }
                res.render('covid/positive', {
                    user: user,
                    pageTitle: 'Covid Positive',
                    path: '/covid/positive'
                })
            })
            .catch(err => console.log(err));
    }
};

exports.getVacxin = (req, res, next) => {
    User.find()
    .then(user => {
        res.render('covid/vacxin', {
            user: user,
            pageTitle: 'Covid Vacxin',
            path: '/covid/vacxin'
        });
    })
    .catch(err => console.log(err));
};

exports.postVacxin = (req, res, next) => {
    // Lấy ngày giờ hiện tại
    const today = new Date();
    const formatDate = moment(today).format('DD/MM/YYYY')
    const vacxin = (numberVacxin) => {
        switch (numberVacxin) {
            case '2':
                return 'Pfizer';
                break;
            case '3':
                return 'Moderna';
                break;

            case '4':
                return 'AstraZeneca';
                break;
            
            default:
                return 'Sinopharm';
                break;
        }
    }
    let addressVacxin1 = vacxin(req.body.addressVacxin1);
    let timeVacxin1 = req.body.timeVacxin1 ? moment(req.body.timeVacxin1).format('DD/MM/YYYY') : formatDate;
    let addressVacxin2 = vacxin(req.body.addressVacxin2);
    let timeVacxin2 = req.body.timeVacxin2 ? moment(req.body.timeVacxin2).format('DD/MM/YYYY') : formatDate;
    User.findOne()
        .then(user => {
            user.vacxin1 = addressVacxin1;
            user.dateV1 = timeVacxin1;
            user.vacxin2 = addressVacxin2;
            user.dateV2 = timeVacxin2;
            user.save()
        res.render('covid/vacxin', {
            user: user,
            pageTitle: 'Covid Vacxin',
            path: '/covid/vacxin'
        });
    })
    .catch(err => console.log(err));
};