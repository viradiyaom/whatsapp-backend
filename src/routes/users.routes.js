const express = require("express");

const router = express.Router();
const user = require("../controller/user.controller");

router.post("/login", user.loginUser);

router.post("/signUp", user.onCreateUser);

router.get("/:id", user.onGetUserById);

router.delete("/:id", user.onDeleteUserById);

module.exports = router;
