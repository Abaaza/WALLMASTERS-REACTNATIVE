import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window"); // Get screen width

const ProductCard = ({ item = {}, onRemove }) => {
  const navigation = useNavigation();

  const handleRemove = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("authToken");

      if (!userId || !token) {
        return;
      }

      await axios.delete(
        `https://wallmasters-backend-2a28e4a6d156.herokuapp.com/saved-items/${userId}/${item.productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onRemove(); // Trigger the onRemove callback to update the state
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handlePress = () => {
    if (!item || !item.productId || !item.name) {
      return;
    }

    const size = item.variants?.[0]?.size || "N/A";
    const priceRange = {
      min: item.variants?.[0]?.price || item.price || "N/A",
      max:
        item.variants?.[item.variants.length - 1]?.price || item.price || "N/A",
    };

    navigation.navigate("ProductInfo", {
      id: item.productId,
      title: item.name,
      priceRange,
      carouselImages: item.image ? [item.image] : [],
      size,
      item, // Pass the entire item object
    });
  };

  const getPriceRange = () => {
    if (item.variants?.length === 1) {
      return `${item.variants[0].price} EGP`;
    }
    return `${item.variants[0].price} - ${
      item.variants[item.variants.length - 1].price
    } EGP`;
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {item.name}
      </Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.price}>{getPriceRange()}</Text>
        <Text style={styles.sizeCount}>
          {item.variants?.length === 1
            ? "1 Size Available"
            : `${item.variants.length} Sizes Available`}
        </Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </Pressable>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  container: {
    width: width / 2 - 17,
    marginBottom: 15,
    marginHorizontal: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
    marginTop: 5,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "contain",
  },
  title: {
    width: "100%",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "500",
    fontSize: 16,
  },
  detailsContainer: {
    marginTop: 5,
    alignItems: "center",
  },
  price: {
    fontSize: 13,
    fontWeight: "bold",
  },
  sizeCount: {
    fontSize: 13,
    color: "#555",
    marginTop: 3,
    fontWeight: "bold",
    paddingBottom: 7,
  },
  removeButton: {
    backgroundColor: "#ff6347",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 3,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
