const userdb = require("../models/user.model");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/sendToken");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const {email} = req.body;
    const user = await userdb.create({
      email
    });
    sendToken(user, 201, res);
});

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const {email,password} = req.body;
  const user = await userdb.find({
    email,password
  });
  sendToken(user, 201, res);
});