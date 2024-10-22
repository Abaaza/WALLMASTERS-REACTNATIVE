import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";

const AddressScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const handleProceedToConfirm = () => {
    const address = { name, mobileNo, houseNo, street, landmark, postalCode };

    if (Object.values(address).some((field) => field === "")) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    navigation.navigate("Confirm", { address });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Enter Address</Text>

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
        value={landmark}
        onChangeText={setLandmark}
        placeholder="Landmark"
        style={styles.input}
      />
      <TextInput
        value={postalCode}
        onChangeText={setPostalCode}
        placeholder="Postal Code"
        style={styles.input}
      />

      <Pressable onPress={handleProceedToConfirm} style={styles.proceedButton}>
        <Text style={styles.buttonText}>Proceed to Confirmation</Text>
      </Pressable>
    </ScrollView>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderColor: "#D0D0D0",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  proceedButton: {
    backgroundColor: "#FFC72C",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { fontWeight: "bold" },
});
