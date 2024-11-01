import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";

import ModalSelector from "react-native-modal-selector";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import ProductItemWM from "../components/ProductItemWM";
import { SliderBox } from "react-native-image-slider-box";
import Carousel from "react-native-snap-carousel";

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [randomDeals, setRandomDeals] = useState([]);
  const [theme, setTheme] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);

  const screenWidth = Dimensions.get("window").width;
  const { width } = Dimensions.get("window");
  const scrollViewRef = useRef(null);
  const cart = useSelector((state) => state.cart.cart);
  const navigation = useNavigation();

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "https://wallmasters-backend-2a28e4a6d156.herokuapp.com/products"
      );
      const data = await response.json();
      setProducts(data);

      // Filter best-seller products for `randomDeals`
      setRandomDeals(
        getRandomDeals(data.filter((product) => product.bestSeller === true))
      );
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

  useEffect(() => {
    if (theme) {
      setFilteredProducts(
        products.filter((product) => product.theme === theme)
      );
    } else {
      setFilteredProducts(products);
    }
  }, [theme, products]);

  const uniqueThemes = useMemo(
    () => [...new Set(products.map((product) => product.theme))],
    [products]
  );

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

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!randomDeals.length) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }
  const renderSliderItem = ({ item }) => (
    <Image source={item} style={styles.sliderImage} />
  );
  const renderProductItem = ({ item }) => (
    <ProductItemWM
      key={item.id}
      item={item}
      onPress={() =>
        navigation.navigate("ProductInfo", {
          id: item.id,
          title: item.name,
          price: item.variants[0]?.price, // Include optional chaining for safety
          carouselImages: item.images,
          color: item.color,
          size: item.variants[0]?.size,
          item, // Pass the entire item object
        })
      }
    />
  );

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap
    }
    return array;
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  const renderItem = ({ item }) => (
    <ProductItemWM
      key={item.id}
      item={item}
      onPress={() =>
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
        })
      }
    />
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require("../assets/13.jpg")}
          resizeMode="cover"
        ></Image>
      </View>

      <View style={styles.sliderContainer}>
        <Carousel
          data={sliderImages}
          renderItem={renderSliderItem}
          sliderWidth={width}
          itemWidth={width}
          autoplay={true}
          loop={true}
          autoplayInterval={3000}
          inactiveSlideScale={1}
          inactiveSlideOpacity={1}
          enableSnap={true}
        />
      </View>
      {/* Trending Deals */}
      <Text style={styles.sectionTitle}>Trending Frames</Text>
      <FlatList
        data={randomDeals}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />
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
      <FlatList
        data={filteredProducts.slice(0, 4)} // Limit to first 4 products
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
});
