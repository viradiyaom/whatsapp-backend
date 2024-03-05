const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;

exports.decode = (req, res, next) => {
  const accessToken = req.headers["x-access-token"];
  if (!accessToken) {
    return res
      .status(400)
      .json({ success: false, message: "No access token provided" });
  }
  try {
    const decoded = jwt.verify(accessToken, secretKey);
    req.userId = decoded.userId;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};
