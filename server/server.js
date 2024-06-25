const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose
  .connect("your_mongodb_atlas_connection_string", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Define a Product schema and model
const productSchema = new mongoose.Schema({
  name: String,
  categories: [String],
  priceTaxIncl: Number,
  quantity: Number,
  active: Boolean,
  featuredImageId: String,
  images: [{ id: String, url: String }],
  handle: String,
});

const Product = mongoose.model("Product", productSchema);

// Define API endpoints
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
