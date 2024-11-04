import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Alert, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SavedAddressesScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    loadSavedAddresses(); // Load addresses on component mount
  }, []);

  const loadSavedAddresses = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      console.log("Loaded User ID:", userId); // Debugging User ID

      if (!userId) {
        Alert.alert("Error", "User ID not found.");
        return;
      }

      const response = await axios.get(
        `https://wallmasters-backend-2a28e4a6d156.herokuapp.com/addresses/${userId}`
      );

      console.log("Address Response:", response.data); // Debugging Response

      if (response.data.length > 0) {
        setAddresses(response.data); // Set the response to state
      } else {
        setAddresses([]); // Clear state if no addresses found
      }
    } catch (error) {
      console.error("Error loading address:", error);
      Alert.alert("Error", "Failed to load addresses.");
    }
  };

  const deleteAddress = async (id) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      await axios.delete(
        `https://wallmasters-backend-2a28e4a6d156.herokuapp.com/addresses/${userId}`
      );

      // Update state after deletion
      setAddresses((prevAddresses) =>
        prevAddresses.filter((address) => address._id !== id)
      );

      Alert.alert("Success", "Address deleted.");
    } catch (error) {
      console.error("Error deleting address:", error);
      Alert.alert("Error", "Failed to delete address.");
    }
  };

  const renderAddress = (address) => (
    <View key={address._id} style={styles.addressContainer}>
      <Text style={styles.addressText}>Name: {address.name}</Text>
      <Text style={styles.addressText}>
        Email: {address.email || "N/A"}
      </Text>{" "}
      {/* Add email field */}
      <Text style={styles.addressText}>Mobile: {address.mobileNo}</Text>
      <Text style={styles.addressText}>Address 1: {address.houseNo}</Text>
      <Text style={styles.addressText}>Address 2: {address.street}</Text>
      <Text style={styles.addressText}>City: {address.city}</Text>
      <Text style={styles.addressText}>Postal Code: {address.postalCode}</Text>
      <Pressable
        onPress={() => deleteAddress(address._id)}
        style={styles.deleteButton}
      >
        <Text style={styles.buttonText}>Delete Address</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Addresses</Text>
      {addresses.length > 0 ? (
        addresses.map((address) => renderAddress(address))
      ) : (
        <Text style={styles.emptyText}>No saved addresses found.</Text>
      )}
    </View>
  );
};

export default SavedAddressesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  addressContainer: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 10,
  },
  addressText: { fontSize: 16, marginBottom: 5 },
  deleteButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  emptyText: {
    fontSize: 18,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
});
