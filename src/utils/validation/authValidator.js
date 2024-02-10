const joi = require("joi");

/** validation keys and properties of user */
exports.creationUser = joi
  .object({
    name: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
    phone: joi.string().required(),
  })
  .unknown(true);
