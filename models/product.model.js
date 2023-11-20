const mongoose = require("mongoose");

const product = new mongoose.Schema({
  name:{
    type:String,
  },
  image:{
    public_id:String,
    url:String
  },
  location:{
    type:String,
  },
  liked:{
    type:Boolean
  },
  category:{
    type:String,
    enum:["dish","product","mall"]
  },
  createdAt:{
    type:Date,
    default:Date.now()
  }
});

module.exports = mongoose.model("product", product);