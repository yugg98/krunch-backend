const express = require("express");
const { 
  registerUser, 
  resendOTP, 
  verifyOTP,
  registerUserGoogle
} = require("../controllers/user.controller");

const router = express.Router();

// User registration route
router.post('/user/register', registerUser);
router.post('/user/registerGoogle', registerUserGoogle);


// Route to resend OTP
router.post('/user/resend-otp', resendOTP);

// Route to verify OTP
router.post('/user/verify-otp', verifyOTP);

// You can add other user-related routes here
// router.post('/user/some-action', someControllerFunction);

module.exports = router;
