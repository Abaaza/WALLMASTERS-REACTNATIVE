import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductCard from "../components/ProductCard";
import WMProducts from "../assets/WMProducts"; // Import product array

const SavedItemsScreen = () => {
  const [savedItems, setSavedItems] = useState([]);

  const loadSavedItems = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("authToken");

      const response = await axios.get(
        `http://192.168.1.100:3000/saved-items/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const enrichedItems = response.data.map((savedItem) => {
        const product = WMProducts.find(
          (prod) => prod.id === savedItem.productId
        );
        return product ? { ...product, ...savedItem } : savedItem;
      });

      setSavedItems(enrichedItems);
    } catch (error) {
      Alert.alert("Error", "Failed to load saved items.");
    }
  };

  useEffect(() => {
    loadSavedItems();
  }, []);

  const handleRemove = (removedItemId) => {
    setSavedItems((prevItems) =>
      prevItems.filter((item) => item.productId !== removedItemId)
    );
  };

  const renderItem = ({ item }) => (
    <ProductCard item={item} onRemove={() => handleRemove(item.productId)} />
  );

  return (
    <View>
      <FlatList
        data={savedItems}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={renderItem}
        numColumns={2}
      />
    </View>
  );
};

export default SavedItemsScreen;
