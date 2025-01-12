const mongoose = require("mongoose");
const mong = 'mongodb+srv://roy_mek:RoyMekonen@products.x4m2nqm.mongodb.net/Diamonds?retryWrites=true&w=majority&appName=Products'
const connectDB = async () => {
  try {
    await mongoose.connect(mong);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
