import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SavedAddressesScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        return;
      }

      const response = await axios.get(
        `https://wallmasters-backend-2a28e4a6d156.herokuapp.com/addresses/${userId}`
      );

      const sortedAddresses = response.data.sort((a, b) =>
        a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
      );
      setAddresses(sortedAddresses);
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      await axios.delete(
        `https://wallmasters-backend-2a28e4a6d156.herokuapp.com/addresses/${userId}/${addressId}`
      );

      setAddresses((prevAddresses) =>
        prevAddresses
          .filter((address) => address._id !== addressId)
          .sort((a, b) =>
            a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
          )
      );
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      await axios.put(
        `https://wallmasters-backend-2a28e4a6d156.herokuapp.com/addresses/${userId}/default/${addressId}`
      );

      setAddresses((prevAddresses) =>
        prevAddresses
          .map((address) =>
            address._id === addressId
              ? { ...address, isDefault: true }
              : { ...address, isDefault: false }
          )
          .sort((a, b) =>
            a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
          )
      );
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  const renderAddress = (address) => (
    <View key={address._id} style={styles.addressContainer}>
      <Text style={styles.addressText}>Name: {address.name}</Text>
      <Text style={styles.addressText}>Email: {address.email || "N/A"}</Text>
      <Text style={styles.addressText}>Mobile: {address.mobileNo}</Text>
      <Text style={styles.addressText}>Address 1: {address.houseNo}</Text>
      <Text style={styles.addressText}>Address 2: {address.street}</Text>
      <Text style={styles.addressText}>City: {address.city}</Text>
      <Text style={styles.addressText}>Postal Code: {address.postalCode}</Text>

      <Pressable
        onPress={() => setDefaultAddress(address._id)}
        style={[
          styles.defaultButton,
          address.isDefault && styles.defaultButtonActive,
        ]}
      >
        <Text style={styles.buttonText}>
          {address.isDefault ? "Default Address" : "Set as Default"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => deleteAddress(address._id)}
        style={styles.deleteButton}
      >
        <Text style={styles.buttonText}>Delete Address</Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Saved Addresses</Text>
      {addresses.length > 0 ? (
        addresses.map((address) => renderAddress(address))
      ) : (
        <Text style={styles.emptyText}>No saved addresses found.</Text>
      )}
    </ScrollView>
  );
};

export default SavedAddressesScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
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
  defaultButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  defaultButtonActive: {
    backgroundColor: "#4CAF50",
  },
  deleteButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  emptyText: {
    fontSize: 18,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
});
