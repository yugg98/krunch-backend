const { Resend } = require("resend");
const resend = new Resend("re_Ht2Qj2iJ_12uwe5DTdXXv8gJvDgbMoX4b");
const userdb = require("../models/user.model");

const generateOTP = (length = 4) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // Generate a single digit and append it to the OTP
  }
  return otp;
}

exports.handleOtpProcess = async (email) => {
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 30 * 60000); // 30 minutes expiry

  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [email],
    subject: "Your One-Time Password",
    html: `<strong>Your OTP is: ${otp}</strong>`,
  });

  await userdb.updateOne({ email }, { otp, otpExpiry });
}
