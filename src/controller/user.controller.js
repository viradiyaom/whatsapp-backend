const UserModel = require("../model/use.model");
const validation = require("../utils/validateRequest");
const authValidator = require("../utils/validation/authValidator");
const { generateToken, saveBase64Image } = require("../utils/common");
const bcrypt = require("bcrypt");

exports.onCreateUser = async (req, res) => {
  const { profilePhoto, ...rest } = req.body;
  try {
    const validateRequest = validation.validateParamsWithJoi(
      rest,
      authValidator.creationUser
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        status: 400,
        message: `Invalid Params : ${validateRequest.message}`,
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
      status: 200,
      data: { data: newStudent, refreshToken, token },
      message: "User created Successfully",
    });
  } catch (error) {
    console.log("🚀 - exports.onCreateUser= - error:", error);
    return res.status(500).json({ status: 500, message: error });
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
    console.log("🚀 - exports.loginUser= - error:", error);
    return res.failureResponse();
  }
};

exports.onGetUserById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res.badRequest({
        message: `Invalid User Id`,
      });

    const users = await UserModel.find({ _id: { $in: id } });
    return res
      .status(200)
      .json({ status: 200, data: users, message: "fetch users successfully" });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error });
  }
};

exports.onDeleteUserById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res.badRequest({
        message: `Invalid User Id`,
      });
    const users = await UserModel.remove({ _id: id });

    return res.status(200).json({
      status: 200,
      data: users,
      message: "deleted users successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error });
  }
};
