import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Component to render product details within an order
const OrderItemDetails = ({ product }) => (
  <View style={styles.productItem}>
    <Image source={{ uri: product.image }} style={styles.productImage} />
    <View style={styles.productInfo}>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productSize}>Size: {product.size}</Text>
      <Text style={styles.productPrice}>Price: {product.price} EGP</Text>
      <Text style={styles.productQuantity}>Qty: {product.quantity}</Text>
    </View>
  </View>
);

// Component to render each order with a nested FlatList for products
const OrderItem = ({ order }) => (
  <View style={styles.orderItem}>
    <Text style={styles.orderId}>Order ID: {order.orderId}</Text>
    <Text style={styles.orderDate}>
      Date: {new Date(order.createdAt).toLocaleDateString()}
    </Text>
    <Text style={styles.orderTotal}>Total: {order.totalPrice} EGP</Text>

    {/* Display each product using a nested FlatList */}
    <FlatList
      data={order.products}
      keyExtractor={(item, index) => `${item.productId}-${index}`}
      renderItem={({ item }) => <OrderItemDetails product={item} />}
      contentContainerStyle={styles.productsList}
    />
  </View>
);

const YourOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      console.log("User ID:", userId); // Debugging log

      const response = await axios.get(
        `https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/orders/${userId}`
      );
      console.log("Loaded Orders:", response.data); // Debugging log
      setOrders(response.data);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No orders found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <OrderItem order={item} />}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default YourOrders;

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderItem: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  orderId: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: "#777",
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6F00",
    marginBottom: 10,
  },
  productsList: {
    marginTop: 10,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    elevation: 2,
    width: width - 80,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: "contain",
  },
  productInfo: {
    marginLeft: 10,
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 3,
  },
  productSize: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6347",
    marginBottom: 2,
  },
  productQuantity: {
    fontSize: 14,
    color: "#333",
  },
  emptyText: {
    fontSize: 18,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
});
