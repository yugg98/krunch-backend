const userdb = require("../models/user.model");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/sendToken");

const {handleOtpProcess} = require('../utils/generateRoute')

// Register User
exports.registerUser = catchAsyncErrors(async (req, res) => {
  const { email } = req.body;
  const user = await userdb.findOne({ email });

  if (user) {
    try {
      await handleOtpProcess(email);
      res.status(200).json({ userexist: true, user });
    } catch (error) {
      console.error("Registration Error: ", error);
      res.status(500).json({ message: "Error processing request" });
    }
  } else {
    try {
      const newUser = await userdb.create({ email });
      res.status(201).json({ userexist: false, user: newUser });
    } catch (error) {
      console.error("Registration Error: ", error);
      res.status(500).json({ message: "User registration failed" });
    }
  }
});

// Resend OTP
exports.resendOTP = catchAsyncErrors(async (req, res) => {
  const { email } = req.body;
  const user = await userdb.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    await handleOtpProcess(email);
    res.status(200).json({ message: "OTP has been resent" });
  } catch (error) {
    console.error("OTP Resend Error: ", error);
    res.status(500).json({ message: "Error resending OTP" });
  }
});

// Verify OTP
exports.verifyOTP = catchAsyncErrors(async (req, res) => {
  const { email, otp } = req.body;
  console.log(email,otp)
  const user = await userdb.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isOtpValid = user.otp === otp && user.otpExpiry > new Date();

  if (!isOtpValid) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  await userdb.updateOne({ email }, { otp: null, otpExpiry: null });
  sendToken(user, 200, res);
});
