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
        `https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/addresses/${userId}`
      );

      // Ensure one address is default if only one exists
      const data = response.data;
      if (data.length === 1 && !data[0].isDefault) {
        await setDefaultAddressOnBackend(data[0]._id, userId);
        data[0].isDefault = true;
      }

      const sortedAddresses = data.sort((a, b) =>
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
        `https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/addresses/${userId}/${addressId}`
      );

      let updatedAddresses = addresses.filter(
        (address) => address._id !== addressId
      );

      // Automatically set the only remaining address as default
      if (updatedAddresses.length === 1 && !updatedAddresses[0].isDefault) {
        await setDefaultAddressOnBackend(updatedAddresses[0]._id, userId);
        updatedAddresses[0].isDefault = true;
      }

      updatedAddresses = updatedAddresses.sort((a, b) =>
        a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
      );
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const setDefaultAddressOnBackend = async (addressId, userId) => {
    await axios.put(
      `https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/addresses/${userId}/default/${addressId}`
    );
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      await setDefaultAddressOnBackend(addressId, userId);

      const updatedAddresses = addresses
        .map((address) =>
          address._id === addressId
            ? { ...address, isDefault: true }
            : { ...address, isDefault: false }
        )
        .sort((a, b) =>
          a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
        );

      setAddresses(updatedAddresses);
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
