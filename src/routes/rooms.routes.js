const express = require("express");

const router = express.Router();
const chatRoom = require("../controller/room.controller");

router.get("/", chatRoom.getRecentConversation);

router.get("/allUsers", chatRoom.onGetAllUsers);

router.get("/:roomId", chatRoom.getConversationByRoomId);

router.post("/initiate", chatRoom.initiate);

router.post("/:chatRoomId/message", chatRoom.postMessage);

// router.put("/:roomId/mark-read", chatRoom.markConversationReadByRoomId);

module.exports = router;
