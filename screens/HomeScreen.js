import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import ModalSelector from "react-native-modal-selector";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import WMProducts from "../assets/WMProducts";
import ProductItemWM from "./ProductItemWM";
import { SliderBox } from "react-native-image-slider-box";

const HomeScreen = () => {
  const uniqueThemes = useMemo(
    () => [...new Set(WMProducts.map((product) => product.theme))],
    []
  );

  const [randomDeals, setRandomDeals] = useState([]);
  const [theme, setTheme] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(WMProducts);

  const screenWidth = Dimensions.get("window").width;

  const scrollViewRef = useRef(null); // Create a reference for the ScrollView

  // Function to scroll to the top
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const sliderImages = [
    require("../assets/1.jpg"),
    require("../assets/2.jpg"),
    require("../assets/3.jpg"),
    require("../assets/4.jpg"),
    require("../assets/5.jpg"),
    require("../assets/6.jpg"),
    require("../assets/7.jpg"),
    require("../assets/8.jpg"),
    require("../assets/9.jpg"),
    require("../assets/10.jpg"),
    require("../assets/11.jpg"),
  ];

  const cart = useSelector((state) => state.cart.cart);
  const navigation = useNavigation();

  // Get random deals for display
  const getRandomDeals = () => {
    const shuffled = [...WMProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };

  useEffect(() => {
    const deals = getRandomDeals();
    setRandomDeals(deals);
  }, []);

  useEffect(() => {
    // Filter products by theme
    if (theme) {
      setFilteredProducts(
        WMProducts.filter((product) => product.theme === theme)
      );
    } else {
      setFilteredProducts(WMProducts);
    }
  }, [theme]);

  if (!randomDeals.length) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
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
        ></Image>
      </View>
      {/* Search Bar */}

      {/* Image Slider */}
      <View style={styles.sliderContainer}>
        <SliderBox
          images={sliderImages}
          autoPlay
          circleLoop
          dotColor="#000"
          inactiveDotColor="#fff"
          resizeMethod="resize"
          ImageComponentStyle={styles.sliderImage} // Apply aspect ratio
        />
      </View>

      {/* Trending Deals */}
      <Text style={styles.sectionTitle}>Trending Frames</Text>
      <View style={styles.productsContainer}>
        {randomDeals.map((item) => (
          <ProductItemWM
            key={item.id}
            item={item}
            onPress={() => {
              navigation.navigate("ShopStack", {
                screen: "ProductInfo", // Navigate to ProductInfo inside ShopStack
                params: {
                  id: item.id,
                  title: item.name,
                  price: item.variants[0].price,
                  carouselImages: item.images,
                  color: item.color,
                  size: item.variants[0].size,
                  item, // Pass the entire item object
                },
              });
            }}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Today's Offers</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {WMProducts.slice(0, 10).map((item, index) => (
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
              Colors: {item.color.join(", ")}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Theme Selector */}
      <Text style={styles.sectionTitle}>Select by theme</Text>

      <ModalSelector
        data={uniqueThemes.map((theme) => ({
          key: theme,
          label: theme,
        }))}
        initValue="Select Theme"
        onChange={(option) => setTheme(option.label)}
        style={styles.modalSelector}
        cancelText="Close"
      >
        <Text style={styles.selectorText}>{theme || "Choose a theme"}</Text>
      </ModalSelector>

      {/* Filtered Products Based on Theme */}
      <View style={styles.productsContainer}>
        {filteredProducts.slice(0, 4).map((item) => (
          <ProductItemWM
            key={item.id}
            item={item}
            onPress={() => {
              navigation.navigate("ProductInfo", {
                // Navigate directly to ProductInfo screen
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
            }}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ShopStack")}
          style={styles.resetButton}
        >
          <Text style={styles.resetButtonText}>EXPLORE MORE IN SHOP</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  productsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productItem: {
    margin: 3,
    width: 180,
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
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
    color: "#333",
  },
  modalSelector: {
    MarginTop: 10,
    marginBottom: 18,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    alignSelf: "center",
    width: "90%",
  },
  selectorText: {
    fontSize: 16,
    color: "#000",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    textAlign: "center",
    margin: 8,
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

  sliderContainer: {
    width: "100%",
    height: (Dimensions.get("window").width / 16) * 9, // Aspect ratio 16:9
    flex: 1,
  },
  sliderImage: {
    width: "100%",
    height: "100%",
  },
  resetButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonContainer: {
    paddingHorizontal: 9,
    marginBottom: 4,
  },

  logoContainer: {
    width: "100%", // Full width of the container
    alignItems: "center", // Centering the image
    flex: 1,
  },
  logo: {
    width: "100%", // Image takes 100% width
    height: undefined, // Allow height to adjust automatically
    aspectRatio: 10,
  },
});
