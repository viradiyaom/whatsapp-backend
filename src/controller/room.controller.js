const ChatRoomModel = require("../model/room.model");
const ChatMessageModel = require("../model/chat.model");
const { default: mongoose } = require("mongoose");
const UserModel = require("../model/use.model");

exports.onGetAllUsers = async (req, res) => {
  try {
    const currentUser = req.userId;
    const users = await UserModel.find({ _id: { $ne: currentUser } });
    return res
      .status(200)
      .json({ status: 200, data: users, message: "fetch users successfully" });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error });
  }
};

exports.getConversationByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoomModel.findOne({ _id: roomId });
    if (!room) {
      return res.status(400).json({
        status: 400,
        message: "No room exists for this id",
      });
    }
    const options = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 50,
    };

    const conversation = await ChatMessageModel.aggregate([
      { $match: { chatRoomId: new mongoose.Types.ObjectId(roomId) } },
      { $sort: { createdAt: -1 } },
      {
        $set: {
          user: { _id: "$postedByUser" },
        },
      },

      // do a join on another table called users, and
      // get me a user whose _id = postedByUser
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "postedByUser",
      //     foreignField: "_id",
      //     as: "postedByUser",
      //   },
      // },
      // { $unwind: "$postedByUser" },
      // // apply pagination
      // { $skip: options.page * options.limit },
      // { $limit: options.limit },
      // { $sort: { createdAt: 1 } },
    ]);

    return res.status(200).json({
      status: 200,
      data: conversation,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error });
  }
};

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

exports.getRecentConversation = async (req, res) => {
  try {
    const currentLoggedUser = req.userId;
    const rooms = await ChatRoomModel.find({
      userIds: { $all: [currentLoggedUser] },
    });
    const options = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 100,
    };
    const roomIds = rooms.map((room) => room._id);
    const recentConversation = await ChatMessageModel.getRecentConversation(
      roomIds,
      options,
      currentLoggedUser
    );
    return res.status(200).json({
      success: true,
      data: recentConversation,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const message = req.body.messageText;
    const currentLoggedUser = req.userId;

    let post = await ChatMessageModel.create({
      chatRoomId,
      type: "TEXT",
      message,
      postedByUser: currentLoggedUser,
      readByRecipients: { readByUserId: currentLoggedUser },
    });
    global.io.sockets.in(chatRoomId).emit("newMessage", post);
    return res.status(200).json({
      status: 200,
      data: post,
      message: "chat message send successfully",
    });
  } catch (error) {
    console.log("🚀 - exports.postMessage= - error:", error);
    return res.status(500).json({ status: 500, message: error });
  }
};
