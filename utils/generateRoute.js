const { Resend } = require("resend");
const resend = new Resend("re_EBJyktY3_7YQ1Acinm2njr12KbDqJySDQ");
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

  (async function () {
    const { data, error } = await resend.emails.send({
      from: "Krunch <support@chrysuscapital.in>",
      to: [user.email],
      subject: "Your One-Time Password",
      html: `<p>To verify your identity, please use the below one-time passcode</p><br/><h1><strong> ${otp}</strong></h1><p>Thank you for using Krunch</p>`,
    });
  
    if (error) {
      return console.error({ error });
    }
  
    console.log({ data });
  })();
  // Update the user record with the new otp and otpExpiry
  await userdb.updateOne({ email }, { otp, otpExpiry });
};
