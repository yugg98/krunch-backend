const { Resend } = require("resend");
const resend = new Resend("re_LjPX68Ay_6UbwYjZZiH8FwRtckzCHsYKy");
const userdb = require("../models/user.model");
const ErrorHandler = require("./errorHander");

const generateOTP = (length = 4) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // Generate a single digit and append it to the OTP
  }
  return otp;
};
exports.handleOtpProcess = async (email,res) => {
  const user = await userdb.findOne({ email });

  // Calculate the next valid request time dynamically
  let nextValidRequestTime = user && user.otpExpiry ? new Date(user.otpExpiry.getTime() + 2 * 60000) : null;

  // Check if the current time is less than 2 minutes after the otpExpiry
  if (nextValidRequestTime && new Date() < nextValidRequestTime) {
     res.status(400)
  }

  const otp = await generateOTP();
  const otpExpiry = new Date(Date.now() + 30 * 60000); // 30 minutes expiry

  console.log(otp,email);

  const response = await resend.emails.send({
    from: "Acme <support@krunchtheapp.com>",
    to: [email],
    subject: "Your One-Time Password",
    html: `<strong>Hello! Your OTP is: ${otp}</strong>`,
  });
  console.log(response)
  // Update the user record with the new otp and otpExpiry
  await userdb.updateOne({ email }, { otp, otpExpiry });
};
