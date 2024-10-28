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

const AddressScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isAddressLoaded, setIsAddressLoaded] = useState(false); // Track if address was loaded

  useEffect(() => {
    loadSavedAddress();
  }, []);

  const loadSavedAddress = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        return;
      }

      const response = await axios.get(
        `http://192.168.1.100:3000/addresses/${userId}`
      );

      if (response.data && response.data.length > 0) {
        const address = response.data[0]; // Assuming only one saved address

        setName(address.name);
        setMobileNo(address.mobileNo);
        setHouseNo(address.houseNo);
        setStreet(address.street);
        setCity(address.city);
        setPostalCode(address.postalCode);
        setIsAddressLoaded(true); // Mark address as loaded
      }
    } catch (error) {
      console.error("Error loading address:", error);
    }
  };

  const handleSaveAddress = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const address = { name, mobileNo, houseNo, street, city, postalCode };

      console.log("Saving address:", address);

      const response = await axios.post(
        `http://192.168.1.100:3000/addresses/${userId}`,
        { address }
      );

      console.log("Address saved successfully:", response.data);
      navigation.navigate("Order Summary", { address });
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleProceedToConfirm = () => {
    const address = { name, mobileNo, houseNo, street, city, postalCode };

    if (Object.values(address).some((field) => field === "")) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    if (isAddressLoaded) {
      // If address is already loaded, proceed to checkout with the existing one
      navigation.navigate("Order Summary", { address });
    } else {
      // Otherwise, save the new address and proceed
      handleSaveAddress();
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
  },
  proceedButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 10,
    alignItems: "center",
    marginBottom: 10,
    marginTop: 15,
  },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
});
