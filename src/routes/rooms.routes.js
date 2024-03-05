const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const chatRoom = require("../controller/room.controller");

// Set up multer for parsing multipart/form-data
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.query.type.toLowerCase();
    cb(null, path.join(__dirname, `../../uploads/chats/${type}s`));
  },
  filename: function (req, file, cb) {
    const { chatRoomId } = req.params;

    const fileName =
      chatRoomId + "-" + +new Date() + path.extname(file.originalname);
    req.filename = fileName;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

router.get("/", chatRoom.getRecentConversation);

router.get("/allUsers", chatRoom.onGetAllUsers);

router.get("/:roomId", chatRoom.getConversationByRoomId);

router.post("/initiate", chatRoom.initiate);

router.post(
  "/:chatRoomId/message",
  upload.single("content"),
  chatRoom.postMessage
);

// router.put("/:roomId/mark-read", chatRoom.markConversationReadByRoomId);

module.exports = router;
