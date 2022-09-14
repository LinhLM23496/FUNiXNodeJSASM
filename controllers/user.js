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
//   // const editMode = req.query.edit;
//   // if (!editMode) {
//   //   return res.redirect('/');
//   // }
//   const userId = req.params.userId;
//   User.findById(userId)
//     .then(user => {
//       if (!user) {
//         return res.redirect('/');
//       }
//       console.log("user", user);
//       // res.render('admin/edit-product', {
//       //   pageTitle: 'Edit Product',
//       //   path: '/admin/edit-product',
//       //   editing: editMode,
//       //   product: product
//       // });
//     })
//     .catch(err => console.log(err));
// };
//     // User
//     //     // .find({ 'user.userId': req.user._id })
//     //   .then(user => {
//     //     console.log('user', user);
//     //     // res.render('shop/orders', {
//     //     //   path: '/orders',
//     //     //   pageTitle: 'Your Orders',
//     //     //   orders: orders
//     //     // });
//     //   })
//     //   .catch(err => console.log(err));
// //   };