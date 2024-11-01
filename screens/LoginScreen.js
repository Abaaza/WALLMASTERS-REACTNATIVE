import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useDispatch } from "react-redux"; // Import useDispatch from redux
import { setUser } from "../redux/CartReducer"; // Redux action

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch(); // Correctly call useDispatch

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userEmail = await AsyncStorage.getItem("userEmail");
        const userId = await AsyncStorage.getItem("userId");

        console.log(
          `Checking login: Token: ${token}, Email: ${userEmail}, UserId: ${userId}`
        );

        if (token && userId) {
          dispatch(setUser(userId)); // Set userId in Redux
          navigation.replace("Profile"); // Redirect to Profile if already logged in
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkLoginStatus();
  }, [dispatch, navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Both email and password are required.");
      return;
    }

    console.log("Attempting login with:", email); // Debugging log

    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://wallmasters-backend-2a28e4a6d156.herokuapp.com/login",
        {
          email,
          password,
        }
      );

      console.log("Login Response:", response.data);

      const { token, user } = response.data;
      const userId = user?._id;

      if (!token || !userId) {
        throw new Error("Invalid login response. Missing token or userId.");
      }

      // Store user data in AsyncStorage
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userName", user.name || "Unknown");
      await AsyncStorage.setItem("userEmail", user.email || "Unknown");
      await AsyncStorage.setItem("userId", userId);

      // Dispatch Redux action to set userId
      dispatch(setUser(userId));

      navigation.replace("Profile");
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response) {
        Alert.alert("Login Error", error.response.data.message);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
        <Text style={styles.title}>Login to your Account</Text>

        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={24} color="gray" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <AntDesign name="lock1" size={24} color="gray" />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your Password"
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
            style={styles.input}
          />
          <Pressable onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={24}
              color="gray"
            />
          </Pressable>
        </View>

        <Pressable onPress={handleLogin} style={styles.button}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={styles.linkText}>
            Don't have an account?{" "}
            <Text style={styles.signUpButton}>Sign Up</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    flex: 1,
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    flex: 1,
    marginBottom: 50,
  },
  logo: {
    width: "100%",
    height: undefined,
    aspectRatio: 10,
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
  signUpButton: {
    color: "blue",
  },
});
