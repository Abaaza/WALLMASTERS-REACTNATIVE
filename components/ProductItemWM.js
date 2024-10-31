import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { useDispatch } from "react-redux";

const { width } = Dimensions.get("window"); // Get the device's screen width

const ProductItemWM = ({ item, onPress }) => {
  const dispatch = useDispatch();

  return (
    <Pressable style={[styles.container]} onPress={onPress}>
      {/* Render the First Image Only */}
      {item.images.length > 0 && (
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      )}

      {/* Product Name */}
      <Text style={styles.title} numberOfLines={1}>
        {item.name}
      </Text>

      {/* Product Price and Sizes */}
      <View style={styles.detailsContainer}>
        <Text style={styles.priceRange}>
          {item.variants[0].price} -{" "}
          {item.variants[item.variants.length - 1].price} EGP
        </Text>
        <Text style={styles.sizeCount}>
          {item.variants.length} Sizes Available
        </Text>
      </View>
    </Pressable>
  );
};

export default ProductItemWM;

const styles = StyleSheet.create({
  container: {
    width: width / 2 - 17, // Set container width dynamically (half screen width minus 30)
    marginBottom: 15, // Spacing between rows
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
  },
  image: {
    width: "100%", // Make the image fill the card width
    aspectRatio: 1, // Maintain aspect ratio
    resizeMode: "contain",
  },
  title: {
    width: "100%",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "500",
    fontSize: 16, // Slightly larger font size
  },
  detailsContainer: {
    marginTop: 5,
    alignItems: "center",
  },
  priceRange: {
    fontSize: 15,
    fontWeight: "bold",
  },
  sizeCount: {
    fontSize: 13,
    color: "#555",
    marginTop: 3,
    fontWeight: "bold",
    paddingBottom: 7,
  },
});
