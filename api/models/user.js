const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedAddresses: {
    type: [
      {
        name: String,
        email: String,
        mobileNo: String,
        houseNo: String,
        street: String,
        city: String,
        postalCode: { type: String, default: null },
        isDefault: { type: Boolean, default: false },
      },
    ],
    default: [], // Initialize as an empty array
  },
  savedItems: [
    {
      productId: String,
      name: String,
      price: Number,
      image: String,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
