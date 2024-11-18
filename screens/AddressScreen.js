import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

// Address validation schema (Simple validation)
const validateAddress = (address) => {
  return Object.values(address).every((field) => field !== "");
};

const AddressScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isAddressLoaded, setIsAddressLoaded] = useState(false);

  const country = "Egypt"; // Non-editable country
  const paymentMethod = "Cash on Delivery"; // Non-editable payment method

  useEffect(() => {
    loadUserData(); // Load user name and email if signed in
    loadSavedAddress(); // Load saved address if available
  }, []);

  // Load user name and email if the user is signed in
  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.warn("No user ID found in AsyncStorage");
        return;
      }
      console.log("Retrieved user ID:", userId);

      const userData = await axios.get(
        `https://wallmasters-backend-2a28e4a6d156.herokuapp.com/users/${userId}`
      );

      if (userData.data) {
        setName(userData.data.name);
        setEmail(userData.data.email);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn("User not found on the server");
      } else {
        console.error("Error loading user data:", error);
      }
    }
  };

  // Load saved address if it exists for the user
  const loadSavedAddress = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const response = await axios.get(
        `https://wallmasters-backend-2a28e4a6d156.herokuapp.com/addresses/${userId}`
      );

      if (response.data && response.data.length > 0) {
        // Find the address with isDefault set to true
        const defaultAddress = response.data.find(
          (address) => address.isDefault
        );

        // If a default address is found, use it; otherwise, fall back to the first address
        const address = defaultAddress || response.data[0];

        setName(address.name || name);
        setEmail(address.email || email);
        setMobileNo(address.mobileNo);
        setHouseNo(address.houseNo);
        setStreet(address.street);
        setCity(address.city);
        setPostalCode(address.postalCode);
        setIsAddressLoaded(true);
      }
    } catch (error) {
      console.error("Error loading address:", error);
    }
  };

  const handleSaveAddress = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "User ID is missing.");
        return;
      }

      const address = {
        name,
        email,
        mobileNo,
        houseNo,
        street,
        city,
        postalCode,
        country,
      };

      if (!validateAddress(address)) {
        Alert.alert("Error", "Please fill all the required fields.");
        return;
      }

      console.log("Saving address:", address);

      try {
        // Attempt to save the address
        await axios.post(
          `https://wallmasters-backend-2a28e4a6d156.herokuapp.com/addresses/${userId}`,
          { address }
        );
        console.log("Address saved successfully");

        // Refresh the saved address list after saving
        await loadSavedAddress();
      } catch (error) {
        if (error.response && error.response.status === 409) {
          // Handle duplicate address without showing an alert
          console.log("Duplicate address detected, proceeding without saving.");
        } else {
          console.error("Error saving address:", error);
          Alert.alert("Error", "Failed to save the address.");
          return;
        }
      }

      // Navigate to Order Summary screen after saving or if duplicate
      navigation.navigate("Order Summary", { address, paymentMethod });
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to complete the action.");
    }
  };

  const handleProceedToConfirm = () => {
    const address = {
      name,
      email,
      mobileNo,
      houseNo,
      street,
      city,
      postalCode,
      country,
      isDefault: false, // Default to false unless specified otherwise
    };

    if (!validateAddress(address)) {
      Alert.alert("Error", "Please fill all the required fields.");
      return;
    }

    handleSaveAddress(); // Save the address (whether new or edited)
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Full Name"
        style={styles.input}
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email Address"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        value={mobileNo}
        onChangeText={setMobileNo}
        placeholder="Mobile No"
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        value={houseNo}
        onChangeText={setHouseNo}
        placeholder="House No, Building"
        style={styles.input}
      />
      <TextInput
        value={street}
        onChangeText={setStreet}
        placeholder="Street, Area"
        style={styles.input}
      />
      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder="City"
        style={styles.input}
      />
      <TextInput
        value={postalCode}
        onChangeText={setPostalCode}
        placeholder="Postal Code"
        keyboardType="numeric"
        style={styles.input}
      />

      {/* Non-editable fields styled like inputs */}
      <Text style={styles.text}>Country:</Text>
      <TextInput
        value={country}
        editable={false}
        placeholder="Country"
        style={styles.input}
      />
      <Text style={styles.text}>Payment Method:</Text>
      <TextInput
        value={paymentMethod}
        editable={false}
        placeholder="Payment Method"
        style={styles.input}
      />
      <Text style={styles.text}>Shipping Time: </Text>
      <TextInput
        value="6 Business Days"
        editable={false}
        placeholder="Shipping Duration"
        style={styles.input}
      />

      <Pressable onPress={handleProceedToConfirm} style={styles.proceedButton}>
        <Text style={styles.buttonText}>
          {isAddressLoaded ? "Proceed to Checkout" : "Save and Proceed"}
        </Text>
      </Pressable>
    </ScrollView>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    borderColor: "#D0D0D0",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    color: "#000",
    fontSize: 16,
  },
  proceedButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 10,
    alignItems: "center",
    marginBottom: 30,
    marginTop: 15,
  },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  text: { paddingVertical: 3 },
});
