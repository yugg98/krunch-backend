const userdb = require("../models/user.model");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/sendToken");

const {handleOtpProcess} = require('../utils/generateRoute');
const { OAuth2Client } = require("google-auth-library");

// Register User
exports.registerUser = catchAsyncErrors(async (req, res) => {
  const { email } = req.body;
  const user = await userdb.findOne({ email });

  if (user) {
    try {
      await handleOtpProcess(email,res);
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

exports.addName = catchAsyncErrors(async (req, res) => {
  const { name } = req.body;
  const user = await userdb.findByIdAndUpdate(req.user_id,{
    name
  });

  res.status(200).json({
    message:"Name added successfully",
    user
  })
});

const client = new OAuth2Client("668217070920-5sl8ehi20uqruvqgbf797r2big80c30k.apps.googleusercontent.com");


exports.registerUserGoogle = catchAsyncErrors(async (req, res) => {
  const { token } = req.body; // Token received from the client (front-end)

  // Verify the Google token
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience:"668217070920-5sl8ehi20uqruvqgbf797r2big80c30k.apps.googleusercontent.com",
  });

  const { name, email } = ticket.getPayload();

  // Check if the user already exists in your database
  let user = await User.findOne({ email });

  if (!user) {
    // If user does not exist, create a new user
    user = new userdb({
      name,
      email,
    });
    await user.save();
  }

  // Here, implement the logic to create a JWT token or any other token for the user
  // You can use the user's id to generate the token
  // ...

  // Return response
 sendToken(user,201,res)
});
// Resend OTP
exports.resendOTP = catchAsyncErrors(async (req, res) => {
  const { email } = req.body;
  const user = await userdb.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    await handleOtpProcess(email,res);
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
