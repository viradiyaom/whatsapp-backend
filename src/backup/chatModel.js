// {
//   _id: user.id,
//   text: 'works fine!!',
//   createdAt: new Date(),
//   user: {
//     _id: user.id,
//   },
// }

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

const schema = new Schema(
  {
    roomId: mongoose.Types.ObjectId,

    type: { type: "TEXT" | "IMAGE" | "VIDEO" },

    content: { type: String },

    user: {
      _id: { type: mongoose.Types.ObjectId },

      name: { type: String },
    },

    createdAt: { type: Date },

    updatedAt: { type: Date },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

schema.plugin(mongoosePaginate);

const ChatModel = mongoose.model("chat", schema);

module.exports = ChatModel;
