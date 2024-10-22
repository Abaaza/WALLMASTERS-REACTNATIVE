import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { useDispatch, useSelector } from "react-redux";
import { cleanCart } from "../redux/CartReducer"; // Clean cart action

const OrderScreen = () => {
  const navigation = useNavigation();
  const [orderNumber, setOrderNumber] = useState("");
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();

  const total = cart
    ?.map((item) => item.price * item.quantity)
    .reduce((curr, prev) => curr + prev, 0);

  useEffect(() => {
    const generateOrderNumber = () => {
      const randomNumber = Math.floor(Math.random() * 1000000) + 100000;
      setOrderNumber(`ORD-${randomNumber}`);
    };
    generateOrderNumber();
  }, []);

  const handleClose = () => {
    dispatch(cleanCart()); // Clear the cart on close
    navigation.replace("Main"); // Navigate back to Main
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Animation */}
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

        {/* Order Details Section */}
        <View style={styles.orderDetailsContainer}>
          <Text style={styles.orderNumberText}>
            Order Number: {orderNumber}
          </Text>
          <Text style={styles.totalText}>Total: {total} EGP</Text>
          <Text style={styles.itemCountText}>Items: {cart.length}</Text>
        </View>

        {/* Display Ordered Items */}
        <View style={styles.itemsContainer}>
          {cart.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.item}>
              <Image
                source={{ uri: item.images[0] }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemVariant}>Size: {item.size}</Text>
                <Text style={styles.itemPrice}>Price: {item.price} EGP</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sparkle Animation */}
        <LottieView
          source={require("../assets/sparkle.json")}
          style={styles.sparkleAnimation}
          autoPlay
          loop={false}
          speed={0.7}
        />
      </ScrollView>

      {/* Fixed Close Button */}
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
    paddingBottom: 80, // Ensure space for the fixed button
  },
  thumbsAnimation: {
    height: 250,
    width: 300,
    alignSelf: "center",
    marginTop: 30,
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
    color: "#FF6F00",
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
  itemVariant: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6F00",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#333",
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
    backgroundColor: "#FFC72C",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});
