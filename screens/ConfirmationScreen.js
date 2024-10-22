import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";

const ConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const address = route.params?.address || {};

  const cart = useSelector((state) => state.cart.cart);

  const total = cart
    ?.map((item) => item.price * item.quantity)
    .reduce((curr, prev) => curr + prev, 0);

  const handlePlaceOrderAndNavigate = () => {
    navigation.navigate("Order");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Order Summary</Text>

      {/* Shipping Address Section */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>Shipping Address:</Text>
        <Text>{address.name || "N/A"}</Text>
        <Text>{`${address.houseNo}, ${address.street}`}</Text>
        <Text>{address.landmark}</Text>
        <Text>Mobile: {address.mobileNo}</Text>
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
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total Price: {total} EGP</Text>
      </View>

      {/* Place Order Button */}
      <Pressable
        onPress={handlePlaceOrderAndNavigate}
        style={styles.orderButton}
      >
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
    color: "#FF6F00",
    marginTop: 4,
  },
  totalContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6F00",
  },
  orderButton: {
    backgroundColor: "#FFC72C",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#fff",
  },
});
