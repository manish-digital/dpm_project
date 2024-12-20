/**
 * loginUser.js
 * @description :: middleware that verifies user's JWT token
 */

const jwt = require("jsonwebtoken");
const winston = require('winston');
/**
 * @description : middleware for authenticate user with JWT token
 * @param {obj} req : request of route.
 * @param {obj} res : response of route.
 * @param {callback} next : executes the next middleware succeeding the current middleware.
 */
const authenticateJWT = (req, res, next) => {
  const authToken = req.headers["x-access-token"];

  if (!authToken) {
    return res.unAuthorized();
  }

  jwt.verify(authToken, process.env.JWT_SECRET, (error, user) => {
    if (error) {
      return res.unAuthorized();
    }
    req._user = user;
    next();
  });
};
module.exports = authenticateJWT;
