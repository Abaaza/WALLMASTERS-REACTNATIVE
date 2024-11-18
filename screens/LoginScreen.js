import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { MaterialIcons, AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/CartReducer";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userId = await AsyncStorage.getItem("userId");

        if (token && userId) {
          dispatch(setUser(userId));
          navigation.replace("Profile");
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

    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://wallmasters-backend-2a28e4a6d156.herokuapp.com/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;
      const userId = user?._id;

      if (!token || !userId) {
        throw new Error("Invalid login response. Missing token or userId.");
      }

      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userId", userId);

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

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      Alert.alert("Validation Error", "Email is required.");
      return;
    }

    setIsForgotPasswordLoading(true);

    try {
      const response = await axios.post(
        "https://wallmasters-backend-2a28e4a6d156.herokuapp.com/request-password-reset",
        {
          email: forgotPasswordEmail,
        }
      );

      Alert.alert("Success", response.data.message);
      setIsForgotPasswordVisible(false);
    } catch (error) {
      console.error("Password reset request failed:", error);

      if (error.response) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={require("../assets/13.jpg")}
            resizeMode="cover"
          />
        </View>

        <KeyboardAvoidingView behavior="padding" style={styles.formContainer}>
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

          <Pressable onPress={() => setIsForgotPasswordVisible(true)}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.linkText}>
              Don't have an account?{" "}
              <Text style={styles.signUpButton}>Sign Up</Text>
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal
        visible={isForgotPasswordVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsForgotPasswordVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Forgot Password</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your Email"
              keyboardType="email-address"
              value={forgotPasswordEmail}
              onChangeText={setForgotPasswordEmail}
            />
            <Pressable
              onPress={handleForgotPassword}
              style={styles.modalButton}
              disabled={isForgotPasswordLoading}
            >
              {isForgotPasswordLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Send Reset Link</Text>
              )}
            </Pressable>
            <Pressable onPress={() => setIsForgotPasswordVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: "100%",
    height: undefined,
    aspectRatio: 10,
  },
  formContainer: {
    width: "90%",
    alignItems: "center",
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
    width: "100%",
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
    width: "100%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  linkText: {
    color: "gray",
    alignSelf: "center",
    fontSize: 16,
    marginTop: 10,
  },
  signUpButton: {
    color: "blue",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalInput: {
    width: "100%",
    padding: 10,
    borderColor: "#D0D0D0",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginVertical: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalCancelText: {
    color: "blue",
    marginTop: 10,
    fontSize: 16,
  },
});
