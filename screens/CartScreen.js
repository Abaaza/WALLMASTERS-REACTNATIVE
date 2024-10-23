import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "../redux/CartReducer";
import { useNavigation } from "@react-navigation/native";

const CartScreen = () => {
  const navigation = useNavigation();
  const cart = useSelector((state) => state.cart.cart);

  const total = cart
    ?.map((item) => item.price * item.quantity)
    .reduce((curr, prev) => curr + prev, 0);

  const dispatch = useDispatch();

  const increaseQuantity = (item) => {
    dispatch(incrementQuantity(item));
  };

  const decreaseQuantity = (item) => {
    dispatch(decrementQuantity(item));
  };

  const deleteItem = (item) => {
    dispatch(removeFromCart(item));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require("../assets/13.jpg")}
          resizeMode="cover"
        ></Image>
      </View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Shopping Cart</Text>
      </View>

      <View style={styles.subtotalContainer}>
        <Text style={styles.subtotalText}>Subtotal:</Text>
        <Text style={styles.totalText}>{total} EGP</Text>
      </View>

      <Pressable
        onPress={() => navigation.navigate("Address")}
        style={styles.buyButton}
      >
        <Text style={styles.buyButtonText}>
          Proceed to Buy ({cart.length}) items
        </Text>
      </Pressable>

      <View style={styles.cartItemsContainer}>
        {cart.map((item, index) => (
          <View key={`${item.id}-${item.size}`} style={styles.cartItem}>
            <View style={styles.itemDetails}>
              <Image
                style={styles.itemImage}
                source={{ uri: item.images[0] }}
              />
              <View style={styles.itemInfo}>
                <Text numberOfLines={2} style={styles.itemTitle}>
                  {item.name}
                </Text>
                <Text style={styles.itemVariant}>Size: {item.size}</Text>
                <Text style={styles.itemPrice}>{item.price} EGP</Text>
              </View>
            </View>

            <View style={styles.quantityControls}>
              <Pressable
                onPress={() =>
                  item.quantity > 1 ? decreaseQuantity(item) : deleteItem(item)
                }
                style={styles.quantityButton}
              >
                <AntDesign
                  name={item.quantity > 1 ? "minus" : "delete"}
                  size={20}
                  color="#fff"
                />
              </Pressable>

              <Text style={styles.quantityText}>{item.quantity}</Text>

              <Pressable
                onPress={() => increaseQuantity(item)}
                style={styles.quantityButton}
              >
                <Feather name="plus" size={20} color="#fff" />
              </Pressable>
            </View>

            <Pressable
              style={styles.deleteButton}
              onPress={() => deleteItem(item)}
            >
              <Text style={styles.deleteButtonText}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 0,
    marginTop: 15,

    alignItems: "center",
    paddingBottom: 5,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  subtotalContainer: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginVertical: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  subtotalText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff6347",
  },
  buyButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  cartItemsContainer: {
    marginHorizontal: 10,
  },
  cartItem: {
    backgroundColor: "#fff",
    marginVertical: 8,
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemDetails: {
    flexDirection: "row",
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  itemVariant: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff6347",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  quantityButton: {
    backgroundColor: "#ff6347",
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    marginTop: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontWeight: "bold",
  },
  logoContainer: {
    width: "100%", // Full width of the container
    alignItems: "center", // Centering the image
  },
  logo: {
    width: "100%", // Image takes 100% width
    height: undefined, // Allow height to adjust automatically
    aspectRatio: 10,
  },
});
