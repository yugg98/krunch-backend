const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect('mongodb+srv://yug:9826112003@cluster0.1lluo.mongodb.net/krunch', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    });
};

module.exports = connectDatabase;