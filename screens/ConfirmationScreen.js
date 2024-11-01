import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import axios from "axios"; // Import axios

const ConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const address = route.params?.address || {};
  const cart = useSelector((state) => state.cart.cart);
  console.log("CartCC:", cart);
  const userId = useSelector((state) => state.cart.userId); // Get userId from Redux
  console.log("User ID:", userId); // Debug: check if the userId is being logged correctly

  const subtotal =
    cart?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  const shippingCost = subtotal > 2000 ? 0 : 70; // Conditional shipping
  const total = subtotal + shippingCost; // Total including shipping

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        userId: userId || "guest", // Include userId in the payload
        products: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          image: item.images[0],
        })),
        totalPrice: total,
        shippingAddress: address,
      };

      console.log("Sending Order:", orderData);

      const response = await axios.post(
        "https://wallmasters-backend-2a28e4a6d156.herokuapp.com/orders",
        orderData
      );
      console.log("Order placed successfully:", response.data);

      navigation.navigate("Order", {
        orderId: response.data.order.orderId, // Pass the backend order ID
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total,
      });
    } catch (error) {
      console.error("Order placement failed:", error);
      Alert.alert("Error", "Failed to place the order. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Order Summary</Text>

      {/* Shipping Address Section */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>Shipping Address:</Text>
        <Text>Name: {address.name || "N/A"}</Text>
        <Text>Mobile: {address.mobileNo}</Text>
        <Text>Address 1: {address.houseNo || "N/A"}</Text>
        <Text>Address 2: {address.street}</Text>
        <Text>City: {address.city}</Text>
        <Text>Postal Code: {address.postalCode}</Text>
      </View>

      {/* Cart Items Section */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>Items in Your Order:</Text>
        {cart.map((item, index) => (
          <View key={`${item.id}-${index}`} style={styles.cartItem}>
            <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text>Size: {item.size}</Text>
              <Text>Quantity: {item.quantity}</Text>
              <Text style={styles.itemPrice}>Price: {item.price} EGP</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Total Price Section */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>Order Summary:</Text>
        <Text style={styles.summaryText}>Subtotal: {subtotal} EGP</Text>
        <Text style={styles.summaryText}>
          Shipping: {shippingCost === 0 ? "Free" : `${shippingCost} EGP`}
        </Text>
        <Text style={styles.totalText}>Total: {total} EGP</Text>
      </View>

      {/* Place Order Button */}
      <Pressable onPress={handlePlaceOrder} style={styles.orderButton}>
        <Text style={styles.buttonText}>Place Order</Text>
      </Pressable>
    </ScrollView>
  );
};

export default ConfirmationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#444",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ff6347",
    marginTop: 4,
  },
  summaryText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff6347",
    marginTop: 8,
  },
  orderButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 10,
    alignItems: "center",
    marginBottom: 10,
    marginTop: 15,
    marginBottom: 30,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
