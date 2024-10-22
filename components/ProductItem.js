import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/CartReducer";

const ProductItem = ({ item, onPress }) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const dispatch = useDispatch();

  const addItemToCart = () => {
    setAddedToCart(true);
    dispatch(addToCart(item));

    // Reset "Added to Cart" status after 60 seconds
    setTimeout(() => setAddedToCart(false), 60000);
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image source={{ uri: item?.image }} style={styles.image} />
      <Text style={styles.title} numberOfLines={1}>
        {item?.title}
      </Text>

      <View style={styles.infoRow}>
        <Text style={styles.price}>{item?.price} EGP</Text>
        <Text style={styles.rating}>{item?.rating?.rate || "0"} ratings</Text>
      </View>
    </Pressable>
  );
};

export default ProductItem;

const styles = StyleSheet.create({
  container: {
    width: 200,
    margin: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
  },
  title: {
    width: "100%",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5,
  },
  price: {
    fontSize: 15,
    fontWeight: "bold",
  },
  rating: {
    color: "#FFC72C",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#FFC72C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "bold",
  },
});
