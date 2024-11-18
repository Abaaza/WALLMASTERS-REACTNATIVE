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
  postalCode: { type: String, required: false },
  mobileNo: { type: String, required: true },
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    user: { type: String, default: "guest" }, // Include user field to store userId or "guest"
    products: [productSchema],
    totalPrice: { type: Number, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    orderStatus: {
      type: String,
      enum: ["pending", "processed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "cash_on_delivery"],
      default: "cash_on_delivery",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
