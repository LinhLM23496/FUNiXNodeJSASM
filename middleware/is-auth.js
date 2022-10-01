module.exports = (req, res, next) => {
  req.session.back = req.originalUrl;
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};
