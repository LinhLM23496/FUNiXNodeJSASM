const express = require("express");
const { check, body } = require("express-validator/check");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Hãy nhập đúng Email.")
      .normalizeEmail(),
    body("password", "Hãy nhập đúng password.")
      .isLength({ min: 2 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.post("/signup", authController.postSignup);

router.post("/logout", authController.postLogout);

module.exports = router;
