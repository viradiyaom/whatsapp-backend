const ChatRoomModel = require("../model/room.model");
const ChatMessageModel = require("../model/chat.model");
const { default: mongoose } = require("mongoose");
const UserModel = require("../model/use.model");

exports.getAllUser = async (req, res) => {
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
      {
        $lookup: {
          from: "users",
          localField: "postedByUser",
          foreignField: "_id",
          as: "postedByUser",
        },
      },
      { $unwind: "$postedByUser" },
    ]);

    return res.status(200).json({
      status: 200,
      data: conversation,
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
