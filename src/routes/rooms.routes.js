const express = require("express");
const room = require("../controller/room.controller");

const router = express.Router();

router.get("/allUsers", room.getAllUser);

router.get("/conversions", room.getRecentConversation);

router.get("/conversions/:roomId", room.getConversationByRoomId);

module.exports = router;
