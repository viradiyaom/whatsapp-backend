const express = require("express");

const router = express.Router();
const userRouter = require("./users.routes");
const roomRouter = require("./rooms.routes");
const { decode } = require("../utils");

router.use("/users", userRouter);

router.use("/rooms", decode, roomRouter);

module.exports = router;
