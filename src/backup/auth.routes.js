const express = require("express");

const routes = express.Router();
const authController = require("../controller/authController");
const tokenValidator = require("../middleware/TokenValidator");

routes.get(
  "/fetchUserListing",
  tokenValidator,
  authController.fetchUserListing
);

routes.post("/loginUser", authController.loginUser);

routes.post("/createUser", authController.createUser);

module.exports = routes;
