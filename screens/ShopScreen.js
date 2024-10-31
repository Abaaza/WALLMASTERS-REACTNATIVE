import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import ModalSelector from "react-native-modal-selector";
import { useNavigation } from "@react-navigation/native";
import ProductItemWM from "../components/ProductItemWM";

const ShopScreen = ({ route }) => {
  const navigation = useNavigation();
  const initialTheme = route?.params?.theme || "";

  // State and refs
  const scrollViewRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleProducts, setVisibleProducts] = useState(14);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [selectedThreePiece, setSelectedThreePiece] = useState(null);

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://wallmasters-backend-2a28e4a6d156.herokuapp.com/products"
        );
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    const applyFilters = () => {
      const filtered = products.filter(
        (product) =>
          (!selectedColor ||
            product.color.some((color) =>
              color.toLowerCase().includes(selectedColor.toLowerCase())
            )) &&
          (!selectedTheme ||
            product.theme.toLowerCase() === selectedTheme.toLowerCase()) &&
          (selectedThreePiece === null ||
            product.threePiece.toString().toLowerCase() === selectedThreePiece)
      );
      setFilteredProducts(filtered);
    };

    applyFilters();
  }, [selectedColor, selectedTheme, selectedThreePiece, products]);

  // useMemo for unique themes and colors
  const uniqueThemes = useMemo(() => {
    const themes = products.map((product) => product.theme);
    return Array.from(new Set(themes));
  }, [products]);

  const uniqueColors = useMemo(() => {
    const colors = products.flatMap((product) => product.color);
    return Array.from(new Set(colors));
  }, [products]);

  // Reset filters
  const resetFilters = () => {
    setSelectedColor("");
    setSelectedTheme("");
    setSelectedThreePiece(null);
    setFilteredProducts(products);
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Render empty state
  if (filteredProducts.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No products available.</Text>
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
            min: item.variants[0]?.price,
            max: item.variants[item.variants.length - 1]?.price,
          },
          carouselImages: item.images,
          color: item.color,
          size: item.variants[0]?.size,
          item, // Pass the entire item object for deeper navigation
        })
      }
    />
  );

  // Render content
  return (
    <ScrollView style={styles.container} ref={scrollViewRef}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require("../assets/13.jpg")}
          resizeMode="cover"
        />
      </View>

      {/* Theme Selector */}
      <ModalSelector
        data={uniqueThemes.map((theme) => ({ key: theme, label: theme }))}
        initValue="Select Theme"
        onChange={(option) => setSelectedTheme(option.label)}
        style={styles.modalSelector}
        cancelText="Close"
      >
        <Text style={styles.selectorText}>
          {selectedTheme || "Select Theme"}
        </Text>
      </ModalSelector>

      {/* Color Selector */}
      <ModalSelector
        data={uniqueColors.map((color) => ({ key: color, label: color }))}
        initValue="Select Color"
        onChange={(option) => setSelectedColor(option.label)}
        style={styles.modalSelector}
        cancelText="Close"
      >
        <Text style={styles.selectorText}>
          {selectedColor || "Select Color"}
        </Text>
      </ModalSelector>

      {/* Three-Piece Selector */}
      <ModalSelector
        data={[
          { key: "yes", label: "3 Pieces" },
          { key: "no", label: "One Piece" },
        ]}
        initValue="Select Option"
        onChange={(option) => setSelectedThreePiece(option.key)}
        style={styles.modalSelector}
        cancelText="Close"
      >
        <Text style={styles.selectorText}>
          {selectedThreePiece === null
            ? "Number of pieces"
            : selectedThreePiece === "yes"
            ? "3 Pieces"
            : "One Piece"}
        </Text>
      </ModalSelector>

      {/* Reset Filters Button */}
      <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Reset Filters</Text>
      </TouchableOpacity>

      {/* Products List */}
      <FlatList
        data={filteredProducts.slice(0, visibleProducts)} // Limit to visible products
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />

      {/* Load More Button */}
      {visibleProducts < filteredProducts.length && (
        <TouchableOpacity
          onPress={() => setVisibleProducts((prev) => prev + 14)}
          style={styles.loadMoreBtn}
        >
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
    color: "#333",
  },
  modalSelector: {
    marginVertical: 7,
    backgroundColor: "#DCDCDC",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
  },
  selectorText: {
    fontSize: 16,
    color: "#000",
  },
  resetButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 5,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  productsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productWrapper: {
    flexBasis: "50%",
    marginBottom: 10,
  },
  loadMoreBtn: {
    backgroundColor: "#ff6347",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  loadMoreText: {
    color: "#fff",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#000",
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 3,
    paddingHorizontal: 10,
    height: 35,
    alignItems: "center",
  },
  logoContainer: {
    width: "100%", // Full width of the container
    alignItems: "center", // Centering the image
    flex: 1,
    marginBottom: 10,
  },
  logo: {
    width: "100%", // Image takes 100% width
    height: undefined, // Allow height to adjust automatically
    aspectRatio: 10,
  },
  listContent: {
    justifyContent: "center", // Center the content horizontally
    alignItems: "center",
    paddingVertical: 10, // Add vertical padding
    paddingBottom: 20, // Add bottom padding
  },
});

export default ShopScreen;
