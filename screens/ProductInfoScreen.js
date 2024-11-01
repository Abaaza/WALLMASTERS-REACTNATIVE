import React, { useRef, useState, useEffect } from "react";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/CartReducer";
import DropDownPicker from "react-native-dropdown-picker";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const ProductInfoScreen = () => {
  const [products, setProducts] = useState([]);
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "https://wallmasters-backend-2a28e4a6d156.herokuapp.com/products"
      );
      const data = await response.json();
      setProducts(data);
      setRandomDeals(getRandomDeals(data));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRandomDeals = (products) => {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Safely access route params
  const {
    item = {},
    id = item.id || null,
    title = item.title || "",
    images = item.images || [],
    size = item.size || "N/A",
    price = item.price || 0,
    carouselImages = item.carouselImages || null, // Leave as null if not provided
  } = route.params || {};
  console.log("ProductInfoScreen loaded with item:", item); // Debugging

  const [isSaved, setIsSaved] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(
    item.variants?.[0] || {}
  );
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const { width } = Dimensions.get("window");
  const height = (width * 100) / 100;

  const scrollViewRef = useRef(null);
  const imageScrollRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      title: item.name || "Product Info", // Fallback title
    });
  }, [navigation, item.name]);

  useEffect(() => {
    if (item.id) {
      checkIfSaved(item.id); // Ensure productId is passed
    }
  }, [item]);

  const checkIfSaved = async (productId) => {
    try {
      console.log("Checking if product is saved:", productId); // Debugging

      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("authToken");

      if (!userId || !token) {
        return;
      }

      const response = await axios.get(
        `https://wallmasters-backend-2a28e4a6d156.herokuapp.com/saved-items/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Saved items response:", response.data); // Debugging

      const isProductSaved = response.data.some(
        (savedItem) => savedItem.productId === productId
      );

      setIsSaved(isProductSaved);
    } catch (error) {
      console.error("Error checking if product is saved:", error);
    }
  };

  const saveForLater = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("authToken");

      if (!userId || !token) {
        Alert.alert("You must be signed in to use this feature.");
        return;
      }

      const productToSave = {
        productId: item.id,
        name: item.name,
        size: selectedVariant.size || "N/A",
        price: selectedVariant.price || 0,
        image: item.images?.[0] || "",
      };

      console.log("Saving product:", productToSave); // Debugging

      const response = await axios.post(
        `https://wallmasters-backend-2a28e4a6d156.herokuapp.com/save-for-later/${userId}`,
        { product: productToSave },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Save response:", response.data); // Debugging

      setIsSaved(true);
    } catch (error) {
      console.error("Error saving product for later:", error);
      Alert.alert("Error", "Failed to save product for later.");
    }
  };

  const addItemToCart = () => {
    const productToAdd = {
      ...item,
      size: selectedVariant.size,
      price: selectedVariant.price,
      quantity: 1,
    };

    console.log("Adding product to cart:", productToAdd); // Debugging

    setAddedToCart(true);
    dispatch(addToCart(productToAdd));
    setTimeout(() => setAddedToCart(false), 60000);
  };
  const scrollToImage = (index) => {
    imageScrollRef.current?.scrollTo({
      x: index * width,
      animated: true, // Ensure smooth animation
    });
    setActiveIndex(index); // Update active index after scroll
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap
    }
    return array;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        ref={scrollViewRef}
      >
        <ScrollView
          ref={imageScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setActiveIndex(newIndex);
          }}
          scrollEventThrottle={16}
        >
          {carouselImages.map((image, index) => (
            <View key={index} style={{ width, height, position: "relative" }}>
              {/* Image */}
              <ImageBackground
                source={{ uri: image }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              >
                {/* Save for Later Button */}
                <Pressable
                  onPress={() => saveForLater(item)}
                  style={[styles.saveButton, isSaved && styles.savedButton]}
                  disabled={isSaved}
                >
                  <Text style={styles.saveButtonText}>
                    {isSaved ? "Saved" : "Save for later"}
                  </Text>
                </Pressable>
              </ImageBackground>
            </View>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailScrollContent}
        >
          {route.params.carouselImages.map((image, index) => (
            <Pressable key={index} onPress={() => scrollToImage(index)}>
              <Image
                source={{ uri: image }}
                style={[
                  styles.thumbnailImage,
                  activeIndex === index && styles.activeThumbnail,
                ]}
              />
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Select Size:</Text>
          <DropDownPicker
            open={open}
            value={selectedVariant.size}
            placeholder={`${selectedVariant.size} - ${selectedVariant.price} EGP`}
            items={route.params.item.variants.map((variant) => ({
              label: `${variant.size} - ${variant.price} EGP`,
              value: variant,
            }))}
            setOpen={setOpen}
            setValue={(callback) => {
              const selectedValue = callback();
              setSelectedVariant(selectedValue);
            }}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
          />
        </View>

        <View style={styles.deliveryInfo}>
          <Text style={styles.totalText}>
            Price: {selectedVariant.price} EGP
          </Text>
          <Text style={styles.totalText}>
            Selected Size: {selectedVariant.size} EGP
          </Text>
          <Text style={styles.totalText}>Material: Canvas</Text>
          <Text style={styles.deliveryText}>
            FREE Delivery for orders over 2000 EGP
          </Text>
          <Text style={styles.stockText}>In Stock</Text>

          <View style={styles.productDetails}>
            <Text style={styles.productDescriptionTitle}>
              Product Description
            </Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>
                High definition picture printed on canvas with waterproof,
                fade-resistant, environmentally-friendly inks.
              </Text>
              <Text style={styles.bulletPoint}>
                This artwork is for living room, bedroom, bathroom, kitchen.
              </Text>
              <Text style={styles.bulletPoint}>
                Stretched and stapled by professionals on solid wood frame.
              </Text>
              <Text style={styles.bulletPoint}>
                The best quality canvas for texture and finish, premium inks for
                vivid color, hand-stretched, great for wall decor.
              </Text>
              <Text style={styles.bulletPoint}>
                All our frames come in a 2.8cm thickness, providing a rich
                appearance on your wall.
              </Text>
              <Text style={styles.bulletPoint}>
                Your paintings will be carefully packaged to ensure they reach
                you in perfect condition, ready to decorate your home.
              </Text>
              <Text style={styles.productDescriptionTitle}>Warm Attention</Text>
              <Text style={styles.bulletPoint}>
                The actual color may be slightly different from the picture.
              </Text>
              <Text style={styles.bulletPoint}>
                We recommend measuring your wall before purchase.
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today's Offers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {shuffleArray(
            products
              .filter((item) => item.featured === true) // Filter for featured products
              .slice(0, 10) // Limit to 10 items
          ).map((item, index) => (
            <Pressable
              key={`${item.id}-${index}`}
              style={styles.productItem}
              onPress={() => {
                navigation.navigate("ProductInfo", {
                  id: item.id,
                  title: item.name,
                  priceRange: {
                    min: item.variants[0].price,
                    max: item.variants[item.variants.length - 1].price,
                  },
                  carouselImages: item.images,
                  color: item.color,
                  size: item.variants[0].size,
                  item, // Pass the entire item object
                });
                setTimeout(scrollToTop, 100); // Optional: Scroll to top after navigation
              }}
            >
              <Image
                source={{ uri: item.images[0] }}
                style={styles.productImage}
              />
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPriceRange}>
                {item.variants[0].price} -{" "}
                {item.variants[item.variants.length - 1].price} EGP
              </Text>
              <Text style={styles.productColor}>
                {item.variants?.length === 1
                  ? "1 Size Available"
                  : `${item.variants.length} Sizes Available`}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <Pressable
          onPress={() => addItemToCart(route.params.item)}
          style={styles.addButton}
        >
          <Text style={styles.buttonText}>
            {addedToCart ? "Added to Cart" : "Add to Cart"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ProductInfoScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 80 },

  thumbnailScrollContent: {
    flexDirection: "row", // Align thumbnails horizontally
    alignItems: "center", // Center the thumbnails vertically
    padding: 5,
  },
  thumbnailImage: {
    width: 70,
    height: 70,
    marginRight: 10,
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    transform: [{ scale: 1 }], // Default scale
  },
  activeThumbnail: {
    borderColor: "blue",
    borderWidth: 2,
    transform: [{ scale: 1.1 }], // Scale effect for active thumbnail
  },
  productDetails: {
    padding: 10,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  productDescription: {
    marginTop: 5,
    fontSize: 16,
    color: "#555",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 6,
  },
  dropdownContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dropdown: {
    height: 50,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 18, // Larger text in the dropdown menu
    fontWeight: "600",
  },
  deliveryInfo: {
    padding: 10,
  },
  totalText: {
    fontSize: 17,
    fontWeight: "600",
    marginVertical: 2,
  },
  deliveryText: {
    color: "#ff6347",
    fontSize: 17,
    marginVertical: 1,
    fontWeight: "600",
  },
  stockText: {
    color: "green",

    fontWeight: "600",
    marginLeft: 1,
    marginVertical: 1,
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#D0D0D0",
  },
  addButton: {
    backgroundColor: "#ff6347",
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "#fff",
  },
  offerItem: {
    margin: 10,
    alignItems: "center",
  },
  offerImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "contain",
  },
  offerText: {
    color: "#E31837",
    fontWeight: "bold",
  },
  offerText2: {
    color: "black",
    fontWeight: "600",
  },
  productDetails: {
    padding: 10,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  productDescriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
    marginBottom: 4,
  },
  bulletContainer: {
    marginTop: 5,
  },
  bulletPoint: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 4,
    lineHeight: 22,
    textAlign: "center",
    padding: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  productsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  productImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "contain",
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  productPriceRange: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ff6347",
    marginVertical: 4,
  },
  productColor: {
    fontSize: 12,
    color: "#555",
  },
  productItem: {
    margin: 10,
    width: 160,
    backgroundColor: "#FFF",
    borderRadius: 10,
    elevation: 3,
    padding: 0,
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "contain",
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  productPriceRange: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ff6347",
    marginVertical: 4,
  },
  productColor: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },

  fixedButtonContainer2: {
    alignItems: "flex-end", // Align to the right side of the parent
  },

  saveButton: {
    position: "absolute",
    bottom: 10, // Adjust as needed
    right: 10, // Align to the right corner
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  savedButton: {
    backgroundColor: "rgba(255, 99, 71, 0.8)", // Red background when saved
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
