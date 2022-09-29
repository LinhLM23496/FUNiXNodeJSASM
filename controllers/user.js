const { validationResult } = require("express-validator/check");
const User = require("../models/user");

exports.getUser = (req, res, next) => {
  req.user.populate("_id").then((user) => {
    res.render("work/user", {
      user: user,
      pageTitle: "Thông tin cá nhân",
      path: "/user",
      errorMessage: null,
    });
  });
};
exports.postUser = (req, res, next) => {
  const image = req.file;
  const userId = req.body.userId;
  const errors = validationResult(req);

  User.findById(userId)
    .then((user) => {
      if (!image) {
        return res.status(422).render("work/user", {
          user: user,
          errorMessage: "File bạn chọn không phải là hình ảnh.",
          pageTitle: "Thông tin cá nhân",
          path: "/user",
        });
      } else {
        user.imageUrl = image.path;
      }
      user.save();
      res.render("work/user", {
        user: user,
        errorMessage: "",
        pageTitle: "Thông tin cá nhân",
        path: "/user",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
