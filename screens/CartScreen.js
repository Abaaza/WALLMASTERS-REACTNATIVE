import React, { useState, useEffect } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "../redux/CartReducer";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthCheckModal from "../components/AuthCheckModal"; // Import the modal

const CartScreen = () => {
  const navigation = useNavigation();
  const cart = useSelector((state) => state.cart.cart);
  const [isAuthModalVisible, setAuthModalVisible] = useState(false);
  const [isUserLoggedIn, setUserLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const total = cart
    ?.reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      setUserLoggedIn(!!token);
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToCheckout = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        navigation.navigate("Enter Address");
      } else {
        setAuthModalVisible(true);
      }
    } catch (error) {
      console.error("Error during authentication check:", error);
    }
  };

  const handleLogin = async () => {
    setAuthModalVisible(false);
    const guestCart = JSON.parse(await AsyncStorage.getItem("guestCart")) || [];
    await AsyncStorage.setItem("userCart", JSON.stringify(guestCart));
    await AsyncStorage.removeItem("guestCart");
    navigation.navigate("Login");
  };

  const handleContinueAsGuest = () => {
    setAuthModalVisible(false);
    navigation.navigate("Enter Address");
  };

  const increaseQuantity = (item) => dispatch(incrementQuantity(item));
  const decreaseQuantity = (item) =>
    item.quantity > 1 ? dispatch(decrementQuantity(item)) : deleteItem(item);
  const deleteItem = (item) => dispatch(removeFromCart(item));

  const navigateToProductInfo = (item) => {
    navigation.navigate("ProductInfo", {
      id: item.id,
      title: item.name,
      priceRange: {
        min: item.variants[0]?.price || item.price,
        max: item.variants[item.variants.length - 1]?.price || item.price,
      },
      carouselImages: item.images,
      color: item.color,
      size: item.size,
      item,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require("../assets/13.jpg")}
          resizeMode="cover"
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerText}>Shopping Cart</Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Your cart is empty.</Text>
        </View>
      ) : (
        <>
          <View style={styles.subtotalContainer}>
            <Text style={styles.subtotalText}>Subtotal:</Text>
            <Text style={styles.totalText}>{total} EGP</Text>
          </View>

          <Pressable onPress={handleProceedToCheckout} style={styles.buyButton}>
            <Text style={styles.buyButtonText}>
              Proceed to Buy ({cart.length}) items
            </Text>
          </Pressable>

          <View style={styles.cartItemsContainer}>
            {cart.map((item) => (
              <Pressable
                key={`${item.id}-${item.size}`}
                style={styles.cartItem}
                onPress={() => navigateToProductInfo(item)}
              >
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
                    onPress={() => decreaseQuantity(item)}
                    style={styles.quantityButton}
                  >
                    <AntDesign
                      name={item.quantity > 1 ? "minus" : "delete"}
                      size={14}
                      color="#fff"
                    />
                  </Pressable>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <Pressable
                    onPress={() => increaseQuantity(item)}
                    style={styles.quantityButton}
                  >
                    <Feather name="plus" size={14} color="#fff" />
                  </Pressable>
                </View>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => deleteItem(item)}
                >
                  <Text style={styles.deleteButtonText}>Remove</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <AuthCheckModal
        visible={isAuthModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onGuest={handleContinueAsGuest}
        onLogin={handleLogin}
      />
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
    fontSize: 15,
    color: "#666",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
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
    marginHorizontal: 4,
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
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: undefined,
    aspectRatio: 10,
  },
  emptyCartContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyCartText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
