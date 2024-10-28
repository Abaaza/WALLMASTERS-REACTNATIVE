const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const User = require("./models/user");
const Order = require("./models/order");

const app = express();
const port = process.env.PORT || 3000;

// ------------------ MIDDLEWARE ------------------
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ------------------ DATABASE CONNECTION ------------------
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ------------------ UTILITIES ------------------
const generateOrderId = () => {
  const datePart = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${randomPart}`;
};

// ------------------ ROUTES ------------------

// Register Route
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error("User registration error:", error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      user: { _id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error });
  }
});

// Change Password Route
app.post("/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.password !== oldPassword) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// ------------------ SERVER START ------------------

// 3. Place Order Route
app.post("/orders", async (req, res) => {
  try {
    const { products, totalPrice, shippingAddress, userId } = req.body;

    const newOrder = new Order({
      orderId: generateOrderId(),
      user: userId || "guest",
      products,
      totalPrice,
      shippingAddress,
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Order placement failed:", error);
    res.status(500).json({ message: "Order placement failed", error });
  }
});

// 4. Get User Orders
app.get("/orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
});

// 5. Change Password Route
app.post("/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// ------------------ SERVER START ------------------
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.post("/addresses/:userId", async (req, res) => {
  try {
    const { address } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Initialize savedAddresses if it is null or undefined
    user.savedAddresses = user.savedAddresses || [];
    user.savedAddresses.push(address);
    await user.save();

    res.status(200).json({ message: "Address saved successfully" });
  } catch (error) {
    console.error("Error saving address:", error);
    res.status(500).json({ message: "Failed to save address" });
  }
});

// GET /addresses/:userId - Retrieve Address
app.get("/addresses/:userId", async (req, res) => {
  try {
    console.log("Retrieving addresses for user:", req.params.userId);

    const user = await User.findById(req.params.userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Addresses retrieved:", user.savedAddresses);
    res.status(200).json(user.savedAddresses || []);
  } catch (error) {
    console.error("Error loading addresses:", error);
    res.status(500).json({ message: "Failed to load addresses", error });
  }
});

// DELETE /addresses/:userId - Delete Address
app.delete("/addresses/:userId", async (req, res) => {
  try {
    console.log("Deleting address for user:", req.params.userId);

    const user = await User.findById(req.params.userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    user.savedAddresses = null; // Clear addresses
    await user.save();

    console.log("Address deleted successfully for user:", req.params.userId);
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Failed to delete address", error });
  }
});
// POST /save-for-later/:userId - Save product for later
app.post("/save-for-later/:userId", async (req, res) => {
  try {
    const { product } = req.body; // Expect the product object
    const userId = req.params.userId;

    if (!product || !product.productId) {
      return res.status(400).json({ message: "Invalid Product Data" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Check if the product is already saved
    const isAlreadySaved = user.savedItems.some(
      (item) => item.productId === product.productId
    );

    if (isAlreadySaved) {
      return res.status(400).json({ message: "Product already saved." });
    }

    // Add the product to the saved items
    user.savedItems.push(product);

    await user.save();
    res.status(200).json({ message: "Product saved for later." });
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ message: "Failed to save product for later." });
  }
});

app.get("/saved-items/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const savedItems = user.savedItems || []; // Ensure it's always an array

    console.log("Saved Items:", savedItems); // Debugging log
    res.status(200).json(savedItems); // Return the saved items
  } catch (error) {
    console.error("Error fetching saved items:", error);
    res.status(500).json({ message: "Failed to fetch saved items." });
  }
});

app.delete("/saved-items/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const initialLength = user.savedItems.length;

    // Filter out the product to remove
    user.savedItems = user.savedItems.filter(
      (item) => item.productId !== productId
    );

    if (user.savedItems.length === initialLength) {
      return res
        .status(404)
        .json({ message: "Product not found in saved items." });
    }

    await user.save();

    res.status(200).json({ message: "Item removed from saved items." });
  } catch (error) {
    console.error("Error deleting saved item:", error);
    res.status(500).json({ message: "Failed to delete saved item." });
  }
});
