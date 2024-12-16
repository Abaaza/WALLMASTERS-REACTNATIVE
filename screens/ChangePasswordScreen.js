import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const ChangePasswordScreen = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigation = useNavigation();

  // Load email from AsyncStorage when the screen loads
  useEffect(() => {
    loadUserEmail();
  }, []);

  const loadUserEmail = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem("userEmail");
      console.log("Loaded email:", storedEmail); // Debugging email retrieval
      setEmail(storedEmail || "");
    } catch (error) {
      console.error("Error loading email:", error);
      Alert.alert("Error", "Failed to load your email.");
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (!email) {
      Alert.alert("Error", "No email found. Please log in again.");
      return;
    }

    try {
      const response = await axios.post(
        "https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/change-password",
        {
          email,
          oldPassword,
          newPassword,
        }
      );

      Alert.alert("Success", response.data.message);
      setOldPassword(""); // Clear input fields
      setNewPassword("");
      // Navigate to Profile after successful password change
      navigation.navigate("Profile");
    } catch (error) {
      console.error("Password change failed:", error);
      if (error.response) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      <TextInput
        placeholder="Old Password"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
        style={styles.input}
      />

      <TextInput
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
      />

      <Pressable onPress={handleChangePassword} style={styles.button}>
        <Text style={styles.buttonText}>Change Password</Text>
      </Pressable>
    </ScrollView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#ff6347",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
