/* eslint-disable no-underscore-dangle */

const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;

const checkTokenValidity = async (token) =>
  new Promise((res, rej) => {
    (async () => {
      try {
        const decoded = jwt.verify(token, secretKey);

        if (decoded) {
          res(true);
        } else {
          rej("Your token is expired");
        }
      } catch (err) {
        rej("Your token is expired");
      }
    })();
  });

module.exports = async (req, res, next) => {
  const token = req.header("x-access-token");

  if (!token) {
    return res.unAuthorizedRequest({ message: "Token Not Found...." });
  }

  checkTokenValidity(token)
    .then(async (result) => {
      next();
    })
    .catch((err) => res.unAuthorizedRequest({ message: err }));

  return undefined;
};
