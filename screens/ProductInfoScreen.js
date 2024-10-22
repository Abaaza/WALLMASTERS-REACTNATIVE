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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/CartReducer";
import DropDownPicker from "react-native-dropdown-picker";
import WMProducts from "../assets/WMProducts";

const ProductInfoScreen = () => {
  const route = useRoute();
  const { width } = Dimensions.get("window");
  const height = (width * 100) / 100;
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(
    route.params.item.variants[0]
  );
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // Track active thumbnail

  const scrollViewRef = useRef(null);
  const imageScrollRef = useRef(null);

  // Update the header title dynamically with the product name
  useEffect(() => {
    navigation.setOptions({
      title: route.params.item.name, // Set the product name in the header
    });
  }, [navigation, route.params.item.name]);

  const addItemToCart = (item) => {
    const productToAdd = {
      ...item,
      size: selectedVariant.size,
      price: selectedVariant.price,
      quantity: 1,
    };
    setAddedToCart(true);
    dispatch(addToCart(productToAdd));
    setTimeout(() => setAddedToCart(false), 60000);
  };

  const scrollToImage = (index) => {
    setActiveIndex(index);
    imageScrollRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
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
              style={{ width, height, marginTop: 25 }}
              resizeMode="contain"
            />
          ))}
        </ScrollView>

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
                • High definition picture printed on canvas with waterproof,
                fade-resistant, environmentally-friendly inks.
              </Text>
              <Text style={styles.bulletPoint}>
                • Suitable for living room, bedroom, bathroom, kitchen.
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
                // Navigate directly to ProductInfo
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
                  item,
                });
                setTimeout(scrollToTop, 100); // Optional: Scroll to the top
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
  thumbnailContainer: { flexDirection: "row", marginVertical: 10 },
  thumbnailImage: { width: 80, height: 80, marginRight: 10 },
  activeThumbnail: { borderColor: "blue", borderWidth: 2 },

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 80,
  },
  thumbnailContainer: {
    flexDirection: "row",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
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
  },
  deliveryInfo: {
    padding: 10,
  },
  totalText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  deliveryText: {
    color: "#00CED1",
    fontSize: 18,
  },
  stockText: {
    color: "green",
    marginHorizontal: 10,
    fontWeight: "500",
    marginLeft: 1,
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
    backgroundColor: "#FFC72C",
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
  },
  bulletContainer: {
    marginTop: 5,
    paddingLeft: 15,
  },
  bulletPoint: {
    fontSize: 16,
    marginBottom: 5,
    lineHeight: 22,
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
    color: "#FF6F00",
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
    color: "#FF6F00",
    marginVertical: 4,
  },
  productColor: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },
});
