const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
console.log("CONNECTION_STRING:", process.env.CONNECTION_STRING);
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const User = require("./models/user");
const Order = require("./models/order");

const app = express();
const PORT = process.env.PORT || 3000; // Use the Heroku port or fallback to 3000

// Middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database connection
const mongoURI = process.env.CONNECTION_STRING;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

// ------------------ UTILITIES ------------------
const generateOrderId = () => {
  const datePart = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${randomPart}`;
};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },
  debug: true, // Enable debug output
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});

// Define Product schema and model
const productSchema = new mongoose.Schema({}, { collection: "products" });
const Product = mongoose.model("Product", productSchema);
console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass:", process.env.EMAIL_PASS);

// ------------------ ROUTES ------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists and the password matches
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
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

app.get("/", (req, res) => {
  res.send("Hello from Wallmasters Backend!");
});

// Sample API: Fetch all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).send("Error fetching products.");
  }
});

// ------------------ SERVER ------------------

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

// Change Password Route
app.post("/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Log the received email and passwords for validation
    console.log("Received email:", email);
    console.log("Received old password:", oldPassword);
    console.log("Received new password:", newPassword);

    if (!email || !oldPassword || !newPassword) {
      console.error("Validation error: Missing fields in the request body.");
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.error("User not found for email:", email);
      return res.status(400).json({ message: "User not found" });
    }

    console.log("Stored password for user:", user.password);

    // Check if the provided old password matches the stored password
    if (user.password !== oldPassword) {
      console.error("Incorrect old password provided.");
      return res.status(400).json({ message: "Incorrect old password" });
    }

    // Update the password
    user.password = newPassword;
    await user.save();

    console.log("Password updated successfully for user:", email);
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

    // Create a new order instance
    const newOrder = new Order({
      orderId: generateOrderId(),
      user: userId || "guest",
      products,
      totalPrice,
      shippingAddress,
    });

    // Save the order to the database
    await newOrder.save();

    // Email options for the customer
    const customerMailOptions = {
      from: `"Wall Masters" <${process.env.EMAIL_USER}>`, // Custom sender name
      to: shippingAddress.email, // Customer's email address
      subject: "Wall Masters Order Confirmation",
      text: `Hello ${
        shippingAddress.name
      },\n\nThank you for your order! Your order ID is ${
        newOrder.orderId
      }. We will process your order soon.\n\nOrder Details:\n- Total Price: ${totalPrice} EGP\n- Items: ${products
        .map((item) => `${item.name} (x${item.quantity})`)
        .join(", ")}\n\nRegards,\nWall Masters Team`,
    };

    // Email options for yourself (admin)
    const adminMailOptions = {
      from: `"Wall Masters" <${process.env.EMAIL_USER}>`, // Custom sender name
      to: "info@wall-masters.com", // Your admin email address
      subject: "New Order Received - Wall Masters",
      text: `New Order Received:\n\nOrder ID: ${
        newOrder.orderId
      }\nCustomer Name: ${shippingAddress.name}\nCustomer Email: ${
        shippingAddress.email
      }\nTotal Price: ${totalPrice} EGP\n\nOrder Details:\n- Items: ${products
        .map((item) => `${item.name} (x${item.quantity})`)
        .join(", ")}\n\nPlease process this order as soon as possible.`,
    };

    // Send both emails asynchronously
    await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    console.log("Confirmation email sent to user and admin.");

    // Respond with success message and order details
    res.status(201).json({
      message: "Order placed successfully, emails sent.",
      order: newOrder,
    });
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

app.post("/addresses/:userId", async (req, res) => {
  try {
    const { address } = req.body;
    if (!address || typeof address !== "object") {
      return res.status(400).json({ message: "Invalid address format." });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Initialize savedAddresses if undefined
    user.savedAddresses = user.savedAddresses || [];

    // Check if the address is already saved by comparing key fields
    const isDuplicate = user.savedAddresses.some(
      (savedAddress) =>
        savedAddress.houseNo === address.houseNo &&
        savedAddress.street === address.street &&
        savedAddress.city === address.city &&
        savedAddress.postalCode === address.postalCode
    );

    if (isDuplicate) {
      // Use a 409 Conflict status code for duplicate addresses
      return res.status(409).json({ message: "Duplicate address found" });
    }

    // Add the address if it’s not a duplicate
    user.savedAddresses.push(address);
    await user.save();

    res.status(201).json({
      message: "Address saved successfully",
      savedAddresses: user.savedAddresses,
    });
  } catch (error) {
    console.error("Error saving address:", error);
    res.status(500).json({ message: "Failed to save address", error });
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
app.delete("/addresses/:userId/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    console.log(
      "Attempting to delete address with ID:",
      addressId,
      "for user:",
      userId
    );

    // Use $pull to remove the address from the savedAddresses array based on addressId
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { savedAddresses: { _id: addressId } } },
      { new: true }
    );

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Address deleted successfully:", addressId);
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Failed to delete address", error });
  }
});

// POST /addresses/:userId/default - Set Default Address
app.post("/addresses/:userId/default", async (req, res) => {
  try {
    const { userId } = req.params;
    const { addressId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.savedAddresses.find(
      (address) => address._id.toString() === addressId
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.defaultAddress = addressId; // Set the default address ID
    await user.save();

    res.status(200).json({ message: "Default address set successfully" });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({ message: "Failed to set default address", error });
  }
});
// PUT /addresses/:userId/default/:addressId - Set Default Address
// PUT /addresses/:userId/default/:addressId - Set Default Address
app.put("/addresses/:userId/default/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the default address
    user.savedAddresses.forEach((address) => {
      address.isDefault = address._id.toString() === addressId;
    });

    await user.save();
    res.status(200).json({ message: "Default address updated successfully" });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({ message: "Failed to set default address", error });
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

app.post("/send-email", (req, res) => {
  const { name, email, comment } = req.body;

  const mailOptions = {
    from: `"Wall Masters" <${process.env.EMAIL_USER}>`, // Use verified sender email
    to: process.env.EMAIL_USER,
    subject: `New Contact Form Submission from ${name}`,
    text: `You have a new message from your contact form:
    
  Name: ${name}
  Email: ${email}
  Comment: ${comment}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({
        message: "Email sending failed",
        error: error.toString(), // Return error details
      });
    }
    console.log("Email sent:", info.response);
    res.status(200).json({ message: "Email sent successfully!" });
  });
});

// Backend route to get user details
app.get("/user/details", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return essential user details
    res.json({ userId: user._id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve user details" });
  }
});

app.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;
  console.log("Received password reset request for email:", email);

  try {
    // Step 1: Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ message: "User not found." });
    }
    console.log("User found for email:", email);

    // Step 2: Generate reset token and expiration
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
    console.log("Generated reset token:", resetToken);
    console.log(
      "Token expiration set to:",
      new Date(user.resetTokenExpiration).toLocaleString()
    );

    // Save the token and expiration to the user's document in the database
    await user.save();
    console.log("Reset token and expiration saved to user profile for:", email);

    // Step 3: Construct reset link
    const resetLink = `https://www.wall-masters.com/reset-password/${resetToken}`;
    console.log("Reset link generated:", resetLink);
    console.log;
    // Step 4: Send reset email
    console.log("Attempting to send password reset email to:", email);
    await transporter.sendMail({
      from: `"Wall Masters" <info@wall-masters.com>`,
      to: email,
      subject: "Password Reset",
      text: `Please use the following link to reset your password: ${resetLink}`,
      html: `<p>Please use the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });
    console.log("Password reset email sent successfully to:", email);

    // Step 5: Respond to the client
    res
      .status(200)
      .json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Failed to send password reset email." });
  }
});

app.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update the user's password and clear the reset token fields
    user.password = password; // Hash this password in production!
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// GET /users/:userId - Retrieve User by ID
app.get("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Server error retrieving user", error });
  }
});

// Verify session endpoint
app.get("/auth/verify-session", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    // If verification is successful, return success status
    res.status(200).json({ message: "Token is valid" });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
