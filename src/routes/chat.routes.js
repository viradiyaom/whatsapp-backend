const multer = require("multer");
const express = require("express");
const path = require("path");
const chat = require("../controller/chat.controller");

const router = express.Router();

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

// router.post("/callUser", chatRoom.callUser);

router.post("/initiateChatRoom", chat.initiate);

router.post("/:chatRoomId/message", upload.single("content"), chat.postMessage);

// router.put("/:roomId/mark-read", chatRoom.markConversationReadByRoomId);

module.exports = router;
