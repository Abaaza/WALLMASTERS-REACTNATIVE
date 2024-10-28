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
import WMProducts from "../assets/WMProducts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const ProductInfoScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Safely access route params
  const {
    item = {},
    carouselImages = [],
    size = "N/A",
    price = 0,
    title = "",
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
        `http://192.168.1.100:3000/saved-items/${userId}`,
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
        `http://192.168.1.100:3000/save-for-later/${userId}`,
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
    setActiveIndex(index);
    imageScrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
          onScroll={(event) => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setActiveIndex(newIndex);
          }}
          scrollEventThrottle={16}
        >
          {route.params.carouselImages.map((image, index) => (
            <ImageBackground
              key={index}
              source={{ uri: image }}
              style={{ width, height }}
              resizeMode="contain"
            />
          ))}
        </ScrollView>
        <View style={styles.fixedButtonContainer2}>
          <View style={styles.container}>
            <Pressable
              onPress={() => saveForLater(item)}
              style={[styles.saveButton, isSaved && styles.savedButton]}
              disabled={isSaved} // Disable button when item is saved
            >
              <Text style={styles.saveButtonText}>
                {isSaved ? "Saved" : "Save for Later"}
              </Text>
            </Pressable>

            {/* Other UI elements */}
          </View>
        </View>

        <View style={styles.thumbnailContainer}>
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
        </View>

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
          {WMProducts.slice(0, 10).map((item, index) => (
            <Pressable
              key={`${item.id}-${index}`}
              style={styles.productItem}
              onPress={() => {
                navigation.navigate("ShopStack", {
                  screen: "ProductInfo", // Target ProductInfo inside ShopStack
                  params: {
                    id: item.id,
                    title: item.name,
                    priceRange: {
                      min: item.variants[0].price,
                      max: item.variants[item.variants.length - 1].price,
                    },
                    carouselImages: item.images,
                    color: item.color,
                    size: item.variants[0].size,
                    item,
                  },
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
                Colors: {item.color.join(", ")}
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

  activeThumbnail: { borderColor: "blue", borderWidth: 2 },

  thumbnailContainer: {
    flexDirection: "row",
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
    alignItems: "flex-start",
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
    fontWeight: "500",
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
    fontWeight: "500",
  },
  stockText: {
    color: "green",

    fontWeight: "500",
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
  productItem: {
    margin: 7,
    width: 160,
    backgroundColor: "#FFF",
    borderRadius: 10,
    elevation: 3,
    padding: 10,
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

  saveButton: {
    alignItems: "center",
    justifyContent: "center", // Center text inside the button
    marginTop: 5,
    marginRight: 7,

    borderRadius: 0, // Optional: Rounded corners
    borderWidth: 1, // Border width
    borderColor: "#000", // Border color
  },

  fixedButtonContainer2: {
    alignItems: "flex-end", // Align to the right side of the parent
  },

  saveButtonText: {
    color: "#000",
    fontSize: 13, // Adjusted font size to fit inside the small square
    fontWeight: "400",
    textAlign: "center", // Center the text
    padding: 2,
  },
  savedButton: {
    backgroundColor: "#ff6347", // Green when saved
  },
});
