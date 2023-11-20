const userdb = require("../models/user.model");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/sendToken");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const {name,email,password} = req.body;
    const user = await userdb.create({
      name,email,password
    });
    sendToken(user, 201, res);
  });