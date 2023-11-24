const app = require("./app");
const connectDatabase = require("./config/database.js");
const cloudinary = require('cloudinary')
          
cloudinary.config({ 
  cloud_name: 'yug', 
  api_key: '159366218959158', 
  api_secret: '_wzwti2vjFfXkEDQGLxGoKJVhfI' 
});
// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "backend/config/config.env" });
}

// Connecting to database
connectDatabase();

const server = app.listen(8000, () => {
  console.log(`Server is working on http://localhost:8000`);
});


// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});