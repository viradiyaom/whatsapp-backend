const express = require("express");
const router = express.Router();

const authRouter = require("./auth.routes");
const roomRouter = require("./rooms.routes");
const chatRouter = require("./chat.routes");
const { decode } = require("../utils");

router.use("/users", authRouter);

router.use("/rooms", decode, roomRouter);

router.use("/chats", decode, chatRouter);

module.exports = router;
