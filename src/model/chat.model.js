/**
 * chatModel.js
 * @description :: model of a database collection of usersModel
 */

const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const bcrypt = require("bcrypt");
const { paginatorCustomLabels } = require("../db/config");

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };

const { Schema } = mongoose;

const readByRecipientSchema = new Schema(
  {
    _id: false,
    readByUserId: { type: mongoose.Types.ObjectId },
    readAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: false,
  }
);

const schema = new Schema(
  {
    chatRoomId: { type: mongoose.Types.ObjectId },

    type: {
      type: String,
      default: () => MESSAGE_TYPES.TYPE_TEXT,
    },

    message: mongoose.Schema.Types.Mixed,

    createdAt: { type: Date },

    updatedAt: { type: Date },

    postedByUser: { type: mongoose.Types.ObjectId },

    readByRecipients: [readByRecipientSchema],
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

/**
 * @param {Array} chatRoomIds - chat room ids
 * @param {{ page, limit }} options - pagination options
 * @param {String} currentUserOnlineId - user id
 */
schema.statics.getRecentConversation = async function (
  chatRoomIds,
  options,
  currentUserOnlineId
) {
  try {
    return this.aggregate([
      { $match: { chatRoomId: { $in: chatRoomIds } } },
      {
        $group: {
          _id: "$chatRoomId",
          // messageId: { $last: "$_id" },
          chatRoomId: { $last: "$chatRoomId" },
          message: { $last: "$message" },
          type: { $last: "$type" },
          postedByUser: { $last: "$postedByUser" },
          createdAt: { $last: "$createdAt" },
          // readByRecipients: { $last: "$readByRecipients" },
        },
      },
      { $sort: { createdAt: -1 } },
      // do a join on another table called users, and
      // // get me a user whose _id = postedByUser
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "postedByUser",
      //     foreignField: "_id",
      //     as: "postedByUser",
      //   },
      // },
      // { $unwind: "$postedByUser" },
      // {
      //   $project: {
      //     _id: 1,
      //     chatRoomId: 1,
      //     message: 1,
      //     createdAt: 1,
      //     "postedByUser._id": 1,
      //     "postedByUser.name": 1,
      //     "postedByUser.phone": 1,
      //   },
      // },
      // // do a join on another table called chatrooms, and
      // // get me room details
      {
        $lookup: {
          from: "chatrooms",
          localField: "chatRoomId",
          foreignField: "_id",
          as: "roomInfo",
        },
      },
      { $unwind: "$roomInfo" },
      {
        $addFields: {
          "roomInfo.userIds": {
            $filter: {
              input: "$roomInfo.userIds",
              as: "userId",
              cond: {
                $ne: ["$$userId", mongoose.Types.ObjectId(currentUserOnlineId)],
              },
            },
          },
        },
      },
      { $unwind: "$roomInfo.userIds" },
      // // // do a join on another table called users
      {
        $lookup: {
          from: "users",
          localField: "roomInfo.userIds",
          foreignField: "_id",
          as: "roomInfo.userProfile",
        },
      },
      { $unwind: "$roomInfo.userProfile" },
      // {
      //   $project: {
      //     _id: 1,
      //     chatRoomId: 1,
      //     message: 1,
      //     createdAt: 1,
      //     readByRecipients: 1,
      //     userProfile: "$roomInfo.userProfile",
      //   },
      // },
      {
        $set: {
          "user.id": "$roomInfo.userProfile._id",
          "user.name": "$roomInfo.userProfile.name",
          "user.email": "$roomInfo.userProfile.email",
          "user.phone": "$roomInfo.userProfile.phone",
        },
      },
      { $unset: "roomInfo" },
      // // do a join on another table called users

      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "readByRecipients.readByUserId",
      //     foreignField: "_id",
      //     as: "readByRecipients.readByUser",
      //   },
      // },

      // {
      //   $group: {
      //     _id: "$roomInfo._id",
      //     messageId: { $last: "$messageId" },
      //     chatRoomId: { $last: "$chatRoomId" },
      //     message: { $last: "$message" },
      //     type: { $last: "$type" },
      //     postedByUser: { $last: "$postedByUser" },
      //     readByRecipients: { $addToSet: "$readByRecipients" },
      //     roomInfo: { $addToSet: "$roomInfo.userProfile" },
      //     createdAt: { $last: "$createdAt" },
      //   },
      // },
      // // apply pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
    ]);
  } catch (error) {
    throw error;
  }
};

schema.plugin(mongoosePaginate);

const ChatModel = mongoose.model("chat", schema);

module.exports = ChatModel;
