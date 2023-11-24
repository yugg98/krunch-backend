const express = require("express");
const app = express();
const path = require("path");
var cors = require('cors')

const errorMiddleware = require("./middleware/error.js");
app.use(cors())

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "backend/config/config.env" });
}

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
// Route Imports
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");

app.use("/api/v1", userRoute);
app.use("/api/v1", productRoute);


app.use(express.static(path.join(__dirname, "../client/out")));

app.get('*',(req,res)=>{
  res.status(200).json({
    message:"Hello Guys"
  })
})

app.use(express.static(path.join(__dirname, "../frontend/build")));

// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;