const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    savedAddresses: [
      {
        name: { type: String },
        mobileNo: { type: String },
        houseNo: { type: String },
        street: { type: String },
        city: { type: String },
        postalCode: { type: String },
      },
    ],
    savedItems: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Comment out or remove the pre-save middleware to stop hashing the password
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

module.exports = mongoose.model("User", userSchema);
