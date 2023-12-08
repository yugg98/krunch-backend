const express = require("express");
const { 
  registerUser, 
  resendOTP, 
  verifyOTP,
  registerUserGoogle,
  addName,
  verifyUser
} = require("../controllers/user.controller");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// User registration route
router.post('/user/register', registerUser);
router.post('/user/registerGoogle', registerUserGoogle);

router.post('/user/addname',isAuthenticated ,addName);
router.post('/user/verifyUser',isAuthenticated ,verifyUser);


// Route to resend OTP
router.post('/user/resend-otp', resendOTP);

// Route to verify OTP
router.post('/user/verify-otp', verifyOTP);

// You can add other user-related routes here
// router.post('/user/some-action', someControllerFunction);

module.exports = router;
