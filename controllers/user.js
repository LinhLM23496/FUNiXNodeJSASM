const User = require('../models/user');

exports.getUser = (req, res, next) => {
    User.findOne()
      .then(user => {
        res.render('work/user', {
          user: user,
          pageTitle: 'All Products',
          path: '/user'
        });
      })
      .catch(err => console.log(err));
  };
exports.postUser = (req, res, next) => {
  let imageUrl = req.body.imageUrl
  User.findOne()
        .then(user => {
          if(imageUrl) {
            user.imageUrl = imageUrl;
          }
          user.save()
          res.render('work/user', {
            user: user,
            pageTitle: 'All Products',
            path: '/user'
          });
        })
        .catch(err => console.log(err));
    };