// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // Adjust the path as per your project structure

exports.isAuthenticated = async (req, res, next) => {
  const { token } = req.body; // Assuming JWT is stored in cookies

  if (!token) {
    return res.status(401).json({ success: false, message: "Please login to access this resource" });
  }
  console.log(token)
  const decodedData = jwt.verify(token, "hjfenjnefnjnefnjnefvkjnfevnknefvnkjevfk");
  req.user = await User.findById(decodedData.id);

  next();
};
