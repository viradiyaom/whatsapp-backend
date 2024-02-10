/**
 * usersModel.js
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
    name: { type: String },

    email: {
      type: String,
      unique: true,
      validate: {
        validator() {
          return /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(
            this.email?.toString().toLowerCase().trim()
          );
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },

    password: { type: String },

    phone: { type: String },

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

schema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

schema.pre("save", async function (next) {
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  this.email = this.email.toString().trim().toLowerCase();
  next();
});

schema.pre("insertMany", async (next, docs) => {
  if (docs && docs.length) {
    for (let index = 0; index < docs.length; index++) {
      const element = docs[index];
      if (element.password) {
        element.password = await bcrypt.hash(element.password, 8);
      }
      element.email = element.email.toString().trim().toLowerCase();
    }
  }
  next();
});

schema.method("toJSON", function () {
  const { _id, __v, password, ...object } = this.toObject({ virtuals: true });
  return object;
});

schema.plugin(mongoosePaginate);

const UserModel = mongoose.model("user", schema);

module.exports = UserModel;
