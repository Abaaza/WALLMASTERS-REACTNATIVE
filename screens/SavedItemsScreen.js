import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductCard from "../components/ProductCard";

const { width } = Dimensions.get("window"); // Get screen width

const SavedItemsScreen = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products from the API
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "https://wallmasters-backend-2a28e4a6d156.herokuapp.com/products"
      );
      setAllProducts(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load products.");
      console.error(error);
    }
  };

  // Load saved items for the user
  // Load saved items for the user
  const loadSavedItems = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("authToken");
      console.log("User ID:", userId); // Verify userId
      console.log("Token:", token); // Verify token

      const response = await axios.get(
        `https://wallmasters-backend-2a28e4a6d156.herokuapp.com/saved-items/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const enrichedItems = response.data
        .map((savedItem) => {
          const product = allProducts.find(
            (prod) => prod.id === savedItem.productId
          );
          return product ? { ...product, ...savedItem } : null;
        })
        .filter(Boolean); // Remove any null items

      setSavedItems(enrichedItems);
    } catch (error) {
      console.error("Error loading saved items:", error);
      Alert.alert("Error", "Failed to load saved items.");
    } finally {
      setLoading(false); // Stop loading indicator here
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchProducts(); // Fetch all products on component mount
    };
    initialize();
  }, []);

  useEffect(() => {
    if (allProducts.length > 0) {
      loadSavedItems(); // Load saved items after fetching products
    }
  }, [allProducts]);

  const handleRemove = (removedItemId) => {
    setSavedItems((prevItems) =>
      prevItems.filter((item) => item.productId !== removedItemId)
    );
  };

  const renderItem = ({ item }) => (
    <ProductCard item={item} onRemove={() => handleRemove(item.productId)} />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading saved items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {savedItems.length === 0 ? (
        <Text style={styles.emptyMessage}>No saved items found.</Text>
      ) : (
        <FlatList
          data={savedItems}
          keyExtractor={(item) => item.productId.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default SavedItemsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  listContent: {
    justifyContent: "center",
    alignItems: "center", // Align items to the center of the screen
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    color: "#555",
  },
});
