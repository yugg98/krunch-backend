const mongoose = require("mongoose");

const product = new mongoose.Schema({
  name:{
    type:String,
  },
  image:{
    type:String,
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
  }
  
});

module.exports = mongoose.model("product", product);