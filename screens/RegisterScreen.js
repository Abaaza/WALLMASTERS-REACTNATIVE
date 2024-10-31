import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
} from "react-native";
import { Ionicons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  // Helper function to validate email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleRegister = async () => {
    console.log("Register button clicked");
    console.log("Name:", name);
    console.log("Email:", email);

    if (!name || !email || !password) {
      Alert.alert("Input Error", "Please fill all fields.");
      return;
    }

    console.log("Sending registration request...");

    try {
      const response = await axios.post(
        "https://wallmasters-backend-2a28e4a6d156.herokuapp.com/register",
        {
          name,
          email,
          password,
        }
      );

      console.log("Response from server:", response.data);

      const { token, user } = response.data;

      if (!token) {
        console.log("No token received in the response.");
        throw new Error("Token is missing from the response");
      }

      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userName", user.name);

      Alert.alert(
        "Registration Successful",
        "You have registered successfully"
      );
      navigation.replace("Profile");
    } catch (error) {
      console.error("Registration failed", error);

      if (error.response) {
        Alert.alert("Registration Error", error.response.data.message);
      } else if (error.request) {
        Alert.alert("Network Error", "No response from the server.");
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require("../assets/13.jpg")}
          resizeMode="cover"
        />
      </View>
      <KeyboardAvoidingView behavior="padding">
        <Text style={styles.title}>Register to your Account</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="ios-person" size={24} color="gray" />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your Name"
            style={styles.input}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={24} color="gray" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your Email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <AntDesign name="lock1" size={24} color="gray" />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your Password"
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        <Pressable onPress={handleRegister} style={styles.button}>
          <Text style={styles.buttonText}>Register</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>
            Already have an account?{" "}
            <Text style={styles.signUpButton}>Sign In</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  safeContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D0D0D0",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    width: "90%",
  },
  input: {
    flex: 1,
    marginLeft: 8,
  },
  button: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 0,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  linkText: {
    color: "gray",
    marginBottom: "150%",
    alignSelf: "center",
    fontSize: 16,
  },
  logoContainer: {
    width: "100%", // Full width of the container
    alignItems: "center", // Centering the image
    flex: 1,
    marginBottom: 50,
  },
  logo: {
    width: "100%", // Image takes 100% width
    height: undefined, // Allow height to adjust automatically
    aspectRatio: 10,
  },
  signUpButton: {
    color: "blue",
  },
});
