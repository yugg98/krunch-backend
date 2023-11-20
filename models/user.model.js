const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  resetPasswordToken:String,
  resetPasswordExpire:String
});
userSchema.pre("save", async function (next) {
  if (this.password) {
    if (!this.isModified("password")) {
      next();
    }

    this.password = await bcrypt.hash(this.password, 10);
  }
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  console.log(this)
  return jwt.sign({ id: this._id }, "hufihuihriuhuhr3iuhiurhiuher", {
});
};

// Compare Password

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("user", userSchema);
