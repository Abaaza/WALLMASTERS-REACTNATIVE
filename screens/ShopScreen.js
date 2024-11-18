import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Image } from "expo-image"; // Import from expo-image
import ModalSelector from "react-native-modal-selector";
import { useNavigation } from "@react-navigation/native";
import ProductItemWM from "../components/ProductItemWM";

const ShopScreen = ({ route }) => {
  const navigation = useNavigation();
  const initialTheme = route?.params?.theme || "";

  const scrollViewRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleProducts, setVisibleProducts] = useState(14);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [selectedThreePiece, setSelectedThreePiece] = useState(null);

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

  const uniqueThemes = useMemo(() => {
    const themes = products.map((product) => product.theme);
    return Array.from(new Set(themes));
  }, [products]);

  const uniqueColors = useMemo(() => {
    const colors = products.flatMap((product) => product.color);
    return Array.from(new Set(colors));
  }, [products]);

  const resetFilters = () => {
    setSelectedColor("");
    setSelectedTheme("");
    setSelectedThreePiece(null);
    setFilteredProducts(products);
  };

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
          item,
        })
      }
      renderImage={() => (
        <Image
          style={styles.productImage}
          source={item.imageUrl}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      )}
    />
  );

  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} ref={scrollViewRef}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require("../assets/13.jpg")}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      </View>

      {/* Filter Selectors and Buttons */}
      <View style={styles.headerContainer}>
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

        <TouchableOpacity onPress={resetFilters} style={styles.fullWidthButton}>
          <Text style={styles.buttonText}>Reset Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts.slice(0, visibleProducts)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />

      {/* Load More Button */}
      {visibleProducts < filteredProducts.length && (
        <TouchableOpacity
          onPress={() => setVisibleProducts((prev) => prev + 14)}
          style={styles.fullWidthButton2} // Use fullWidthButton styling
        >
          <Text style={styles.buttonText}>Load More</Text>
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
  headerContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
  },
  modalSelector: {
    marginVertical: 5,
    backgroundColor: "#DCDCDC",
    borderRadius: 8,
    padding: 10,
    width: "100%", // Full-width for consistency
  },
  selectorText: {
    fontSize: 16,
    color: "#000",
  },
  fullWidthButton: {
    backgroundColor: "#ff6347",
    padding: 7,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
    width: "100%", // Full-width
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 5,
  },
  logo: {
    width: "100%",
    height: undefined,
    aspectRatio: 10,
  },
  listContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingBottom: 5,
  },
  productImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  fullWidthButton2: {
    backgroundColor: "#ff6347",
    padding: 7,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
    width: "95%", // Full-width
    alignSelf: "center",
    marginBottom: 10,
  },
});

export default ShopScreen;
