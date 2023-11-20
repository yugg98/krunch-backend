const express = require("express");
const app = express();

const errorMiddleware = require("./middleware/error.js");
app.use(express.json());

// Route Imports
// const userRoute = require("./routes/userRoute");

// app.use("/api/v1", userRoute);

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