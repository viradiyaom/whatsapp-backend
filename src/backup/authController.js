/**
 * authController.js
 * @description :: exports authentication methods
 */

const bcrypt = require("bcrypt");
const { generateToken, saveBase64Image } = require("../utils/common");
const UserModel = require("../model/use.model");
const validation = require("../utils/validateRequest");
const authValidator = require("../utils/validation/authValidator");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const secretKey = process.env.SECRET_KEY;
const decodeToken = (token) => {
  return jwt.verify(token, secretKey);
};

exports.fetchUserListing = async (req, res) => {
  try {
    const { userId } = decodeToken(req.headers["x-access-token"]);
    const users = await UserModel.find({
      _id: { $ne: new mongoose.Types.ObjectId(userId) },
    });

    return res.ok({
      data: users,
      message: "fetch User Successfully",
    });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await UserModel.findOne({ email });
    if (users) {
      const validPass = await bcrypt.compare(password, users.password);

      if (validPass) {
        const { token, refreshToken } = await generateToken(users._id);

        return res.ok({
          data: { data: users, refreshToken, token },
          message: "User login Successfully",
        });
      }
    }
    return await res.badRequest({
      message: "UserName or Password Not Matched Please Re Enter..!",
    });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.createUser = async (req, res) => {
  const { profilePhoto, ...rest } = req.body;
  try {
    const validateRequest = validation.validateParamsWithJoi(
      rest,
      authValidator.creationUser
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const student = await UserModel.findOne({
      email: validateRequest.value.email,
    });
    if (student) {
      return await res.badRequest({
        message: "User exists with same email!",
      });
    }

    const newStudent = new UserModel(validateRequest.value);
    await newStudent.save();
    await saveBase64Image(
      profilePhoto,
      "../../uploads/images/profilePhoto",
      newStudent._id
    );

    const { token, refreshToken } = await generateToken(newStudent._id);

    return res.ok({
      data: { data: newStudent, refreshToken, token },
      message: "User created Successfully",
    });
  } catch (error) {
    return res.failureResponse();
  }
};
