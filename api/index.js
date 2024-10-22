const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000; // Use PORT from .env

// Enable CORS
app.use(cors());

// Parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB connection using Mongoose
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import models
const Order = require("./models/order");

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Place an order (Public endpoint)
app.post("/orders", async (req, res) => {
  console.log("Order request:", req.body); // Log request

  try {
    const { cartItems, totalPrice, shippingAddress, paymentMethod } = req.body;

    const products = cartItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    }));

    const order = new Order({
      products,
      totalPrice,
      shippingAddress,
      paymentMethod,
    });

    await order.save();
    console.log("Order placed successfully:", order); // Log success

    res.status(200).json({ message: "Order placed successfully" });
  } catch (error) {
    console.error("Order placement error:", error); // Log error
    res.status(500).json({ message: "Order placement failed", error });
  }
});
