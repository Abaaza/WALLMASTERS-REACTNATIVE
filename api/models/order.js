// models/order.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String },
});

const shippingAddressSchema = new mongoose.Schema({
  houseNo: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  mobileNo: { type: String, required: true },
  name: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true }, // Add orderId
    user: { type: String, required: true }, // Store userId as a string
    products: [productSchema],
    totalPrice: { type: Number, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
