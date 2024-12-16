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

const isValidEmail = (email) => {
  const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return regex.test(email);
};

const validateAddress = (address) => {
  return Object.entries(address).every(([key, value]) => {
    if (key === "postalCode") return true; // Allow postalCode to be optional
    return value.trim() !== "";
  });
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
  const [savedAddresses, setSavedAddresses] = useState([]); // All saved addresses
  const [loadedAddress, setLoadedAddress] = useState(null); // Currently loaded address

  const country = "Egypt";
  const paymentMethod = "Cash on Delivery";

  useEffect(() => {
    loadUserData();
    loadSavedAddresses();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const { data } = await axios.get(
        `https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/users/${userId}`
      );

      if (data) {
        setName(data.name);
        setEmail(data.email);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadSavedAddresses = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const { data } = await axios.get(
        `https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/addresses/${userId}`
      );

      if (data && data.length > 0) {
        const defaultAddress = data.find((address) => address.isDefault);
        const address = defaultAddress || data[0];

        // Set the form fields with the loaded address
        setName(address.name || "");
        setEmail(address.email || "");
        setMobileNo(address.mobileNo || "");
        setHouseNo(address.houseNo || "");
        setStreet(address.street || "");
        setCity(address.city || "");
        setPostalCode(address.postalCode || "");

        setSavedAddresses(data); // Store all addresses
        setLoadedAddress(address); // Store the currently loaded address
        setIsAddressLoaded(true);
      } else {
        console.log("No saved addresses found.");
      }
    } catch (error) {
      console.error("Error loading saved addresses:", error);
    }
  };
  const handleSaveAddress = async () => {
    try {
      // Create the new address object
      const newAddress = {
        name: name.trim(),
        email: email.trim(),
        mobileNo: mobileNo.trim(),
        houseNo: houseNo.trim(),
        street: street.trim(),
        city: city.trim(),
        country,
        ...(postalCode ? { postalCode: postalCode.trim() } : {}), // Include postalCode only if provided
      };

      // Validate the address
      if (!validateAddress(newAddress)) {
        Alert.alert("Error", "Please fill all the required fields.");
        return;
      }

      // Validate the email format
      if (!isValidEmail(email)) {
        Alert.alert("Error", "Please enter a valid email address.");
        return;
      }

      // Get the user ID from AsyncStorage
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.log("No user ID found, navigating directly.");
        navigation.navigate("Order Summary", {
          address: newAddress,
          paymentMethod,
        });
        return;
      }

      // Send the address to the backend
      const response = await axios.post(
        `https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/addresses/${userId}`,
        newAddress
      );

      // Handle successful response
      if (response.status === 201) {
        console.log("Address saved successfully.");

        await loadSavedAddresses(); // Refresh saved addresses
        setLoadedAddress(newAddress); // Update the loaded address
        navigation.navigate("Order Summary", {
          address: newAddress,
          paymentMethod,
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle duplicate address case based on backend response
        if (error.response?.status === 409) {
          console.log("Duplicate address detected:", error.response.data);

          navigation.navigate("Order Summary", {
            address: {
              name,
              email,
              mobileNo,
              houseNo,
              street,
              city,
              country,
              postalCode, // Explicitly include all fields
            },
            paymentMethod,
          });
          return;
        }
      }

      // Handle other errors
      console.error("Error saving address:", error);
      Alert.alert("Error", "Failed to save the address. Please try again.");
    }
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
        placeholder="Postal Code (optional)"
        keyboardType="numeric"
        style={styles.input}
      />
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
      <Text style={styles.text}>Shipping Time:</Text>
      <TextInput
        value="6 Business Days"
        editable={false}
        placeholder="Shipping Duration"
        style={styles.input}
      />
      <Pressable onPress={handleSaveAddress} style={styles.proceedButton}>
        <Text style={styles.buttonText}>
          {isAddressLoaded ? "Proceed to Checkout" : "Proceed to Checkout"}
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
