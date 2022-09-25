const User = require("../models/user");

exports.getUser = (req, res, next) => {
  req.user
    .populate("_id")
    .then((user) => {
      res.render("work/user", {
        user: user,
        pageTitle: "All Products",
        path: "/user",
      });
    })
    .catch((err) => console.log(err));
};
exports.postUser = (req, res, next) => {
  const imageUrl = req.body.imageUrl;
  const userId = req.body.userId;

  User.findById(userId)
    .then((user) => {
      if (imageUrl) {
        user.imageUrl = imageUrl;
      }
      user.save();
      res.render("work/user", {
        user: user,
        pageTitle: "All Products",
        path: "/user",
      });
    })
    .catch((err) => console.log(err));
};
