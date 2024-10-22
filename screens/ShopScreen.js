import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  TextInput,
  Image,
  Pressable,
} from "react-native";
import ModalSelector from "react-native-modal-selector";
import { useNavigation } from "@react-navigation/native";
import ProductItemWM from "./ProductItemWM";
import WMProducts from "../assets/WMProducts";
import { AntDesign } from "@expo/vector-icons";

const ShopScreen = ({ route }) => {
  const navigation = useNavigation();
  const initialTheme = route?.params?.theme || "";

  const [products, setProducts] = useState(WMProducts);
  const [visibleProducts, setVisibleProducts] = useState(14);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [selectedThreePiece, setSelectedThreePiece] = useState(null);

  const uniqueThemes = useMemo(() => {
    const themes = WMProducts.map((product) => product.theme);
    return Array.from(new Set(themes));
  }, []);

  const uniqueColors = useMemo(() => {
    const colors = WMProducts.flatMap((product) => product.color);
    return Array.from(new Set(colors));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const filteredProducts = WMProducts.filter(
          (product) =>
            (!selectedColor ||
              product.color.some((color) =>
                color.toLowerCase().includes(selectedColor.toLowerCase())
              )) &&
            (!selectedTheme ||
              product.theme.toLowerCase() === selectedTheme.toLowerCase()) &&
            (selectedThreePiece === null ||
              product.threePiece.toLowerCase() === selectedThreePiece)
        );
        setProducts(filteredProducts);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedColor, selectedTheme, selectedThreePiece]);

  const resetFilters = () => {
    setSelectedColor("");
    setSelectedTheme("");
    setSelectedThreePiece(null);
    setProducts(WMProducts);
  };

  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No products available.</Text>
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
      <View style={styles.searchBar}>
        <Pressable style={styles.searchInput}>
          <AntDesign name="search1" size={22} color="black" />
          <TextInput placeholder="Search Products" style={{ flex: 1 }} />
        </Pressable>
      </View>

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
            ? "Yes"
            : "No"}
        </Text>
      </ModalSelector>

      <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Reset Filters</Text>
      </TouchableOpacity>

      <View style={styles.productsContainer}>
        {products.slice(0, visibleProducts).map((item) => (
          <ProductItemWM
            key={item.id}
            item={item}
            onPress={() =>
              navigation.navigate("ProductInfo", {
                // Directly navigate to ProductInfo
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
              })
            }
          />
        ))}
      </View>

      {visibleProducts < products.length && (
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

export default ShopScreen;

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
  },
  logo: {
    width: "100%", // Image takes 100% width
    height: undefined, // Allow height to adjust automatically
    aspectRatio: 10,
  },
});
