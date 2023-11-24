const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique:true
  },
 
  resetPasswordToken:String,
  resetPasswordExpire:String
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  console.log(this)
  return jwt.sign({ id: this._id }, "hufihuihriuhuhr3iuhiurhiuher", {
});
};



module.exports = mongoose.model("user", userSchema);
