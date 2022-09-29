const path = require("path");

const express = require("express");

const userController = require("../controllers/user");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/user", isAuth, userController.getUser);

router.post("/user", isAuth, userController.postUser);

module.exports = router;
