const { Resend } = require("resend");
const resend = new Resend("re_Ht2Qj2iJ_12uwe5DTdXXv8gJvDgbMoX4b");
const userdb = require("../models/user.model");

const generateOTP = (length = 4) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // Generate a single digit and append it to the OTP
  }
  return otp;
};
exports.handleOtpProcess = async (email) => {
  const user = await userdb.findOne({ email });

  // Calculate the next valid request time dynamically
  let nextValidRequestTime = user && user.otpExpiry ? new Date(user.otpExpiry.getTime() + 2 * 60000) : null;

  // Check if the current time is less than 2 minutes after the otpExpiry
  if (nextValidRequestTime && new Date() < nextValidRequestTime) {
    throw new Error('Cannot send OTP yet. Please wait.');
  }

  const otp = await generateOTP();
  const otpExpiry = new Date(Date.now() + 30 * 60000); // 30 minutes expiry

  console.log(otp);

  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [email],
    subject: "Your One-Time Password",
    html: `<strong>Hello! Your OTP is: ${otp}</strong>`,
  });
  console.log(otp);

  // Update the user record with the new otp and otpExpiry
  await userdb.updateOne({ email }, { otp, otpExpiry });
};
