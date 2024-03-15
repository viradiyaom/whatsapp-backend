const ChatRoomModel = require("../model/room.model");
const ChatMessageModel = require("../model/chat.model");

exports.initiate = async (req, res) => {
  try {
    const { userIds } = req.body;
    const chatRoom = await ChatRoomModel.initiateChat(userIds);

    return res.status(200).json({
      status: 200,
      data: chatRoom,
      message: "chatroom initiated successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { chatRoomId } = req.params;

    const type = req.body.type;
    const message = req.body.content;
    const currentLoggedUser = req.userId;

    let post;
    const params = {
      chatRoomId,
      type,
      message,
      postedByUser: currentLoggedUser,
      readByRecipients: { readByUserId: currentLoggedUser },
    };
    if (type === "TEXT") {
      post = await ChatMessageModel.create(params);
    } else if (type === "IMAGE") {
      post = await ChatMessageModel.create({
        ...params,
        message: req.filename,
      });
    } else if (type === "VIDEO") {
      post = await ChatMessageModel.create({
        ...params,
        message: req.filename,
      });
    }
    global.io.sockets.in(chatRoomId).emit("newMessage", post);
    return res.status(200).json({
      status: 200,
      data: post,
      message: "chat message send successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error });
  }
};

// exports.callUser = async (req, res) => {
//   try {
//     const { chatRoomId, type } = req.params;

//     const currentLoggedUser = req.userId;

//     if (type === "VIDEO") {
//       global.io.sockets.in(chatRoomId).emit("videoCall", {
//         callerId: currentLoggedUser,
//         details: users,
//       });
//     }
//     return res.status(200).json({
//       status: 200,
//       data: post,
//       message: "chat message send successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({ status: 500, message: error });
//   }
// };
