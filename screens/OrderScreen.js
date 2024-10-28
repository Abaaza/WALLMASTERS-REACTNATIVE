import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation, useRoute } from "@react-navigation/native"; // Import useRoute
import { useDispatch, useSelector } from "react-redux";
import { cleanCart } from "../redux/CartReducer";

const OrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Access route to get params
  const dispatch = useDispatch();

  const { orderId, shippingCost, total, subtotal } = route.params || {}; // Get order data from navigation params
  const cart = useSelector((state) => state.cart.cart);

  useEffect(() => {
    const timer = setTimeout(handleClose, 10000); // Close after 10 seconds
    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  const handleClose = () => {
    dispatch(cleanCart()); // Clear the cart
    navigation.replace("Main"); // Navigate back to the main screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LottieView
          source={require("../assets/thumbs.json")}
          style={styles.thumbsAnimation}
          autoPlay
          loop={false}
          speed={0.7}
        />
        <Text style={styles.orderReceivedText}>
          Your Order Has Been Received!
        </Text>

        <View style={styles.orderDetailsContainer}>
          <Text style={styles.orderNumberText}>Order Number: {orderId}</Text>
          <Text style={styles.totalText}>Subtotal: {subtotal} EGP</Text>
          <Text style={styles.totalText}>
            Shipping: {subtotal > 2000 ? "Free" : `${shippingCost} EGP`}
          </Text>
          <Text style={styles.totalText}>Total: {total} EGP</Text>
          <Text style={styles.itemCountText}>Items: {cart.length}</Text>
        </View>

        <View style={styles.itemsContainer}>
          {cart.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.item}>
              <Image
                source={{ uri: item.images[0] }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text>Size: {item.size}</Text>
                <Text>Quantity: {item.quantity}</Text>
                <Text style={styles.itemPrice}>Price: {item.price} EGP</Text>
              </View>
            </View>
          ))}
        </View>

        <LottieView
          source={require("../assets/sparkle.json")}
          style={styles.sparkleAnimation}
          autoPlay
          loop={false}
          speed={0.7}
        />
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  thumbsAnimation: {
    height: 150,
    width: 150,
    alignSelf: "center",
    marginTop: 10,
  },
  orderReceivedText: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 10,
    color: "#2E8B57",
  },
  orderDetailsContainer: {
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#FAF0E6",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    elevation: 3,
  },
  orderNumberText: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 5,
    color: "#ff6347",
  },
  itemCountText: {
    fontSize: 16,
    color: "#555",
  },
  itemsContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    marginVertical: 8,
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: "contain",
  },
  itemDetails: {
    marginLeft: 10,
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 3,
    color: "#333",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff6347",
    marginBottom: 2,
  },
  sparkleAnimation: {
    height: 200,
    width: 300,
    alignSelf: "center",
    marginVertical: 30,
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#D0D0D0",
    elevation: 5,
  },
  closeButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
