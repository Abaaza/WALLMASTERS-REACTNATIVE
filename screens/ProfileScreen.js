import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const didNavigate = useRef(false); // Prevent multiple navigations

  const menuOptions = [
    { id: "1", title: "Your Orders", screen: "Your Orders" },
    { id: "4", title: "Saved Items", screen: "Saved Items" },
    { id: "2", title: "Manage Addresses", screen: "Saved Addresses" },
    { id: "3", title: "Change Password", screen: "ChangePassword" },
    { id: "5", title: "Logout", action: "logout" },
  ];

  useEffect(() => {
    const verifyAndFetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          // No token found, treat as session expired
          handleSessionExpired();
          return;
        }

        // First verify the token
        const verifyResponse = await axios.get(
          "https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/auth/verify-session",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (verifyResponse.status !== 200) {
          // If verification fails, treat as session expired
          handleSessionExpired();
          return;
        }

        // If verification succeeds, now fetch user details
        const userResponse = await axios.get(
          "https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/user/details",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserInfo({
          name: userResponse.data.name || "Guest",
          email: userResponse.data.email || "guest@example.com",
        });
      } catch (error) {
        console.error("Error in verifyAndFetchUser:", error);

        // If token verification or user fetch fails due to 401 or similar,
        // treat as session expired
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          handleSessionExpired();
        } else {
          Alert.alert("Error", "Unable to fetch user data.");
          // Optionally, you can handle other errors here differently
        }
      } finally {
        setLoading(false);
      }
    };

    const handleSessionExpired = async () => {
      if (didNavigate.current) return; // Prevent multiple navigations
      didNavigate.current = true;

      // Clear invalid token
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("userId");
      Alert.alert("Session Expired", "Please log in again.");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    };

    verifyAndFetchUser();
  }, [navigation]);

  const handlePress = async (screen, action) => {
    if (action === "logout") {
      Alert.alert("Logout Confirmation", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "authToken",
                "userId",
                "refreshToken",
              ]);
              setUserInfo({ name: "Guest", email: "guest@example.com" });
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          },
        },
      ]);
    } else if (screen) {
      navigation.navigate(screen);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.option}
      onPress={() => handlePress(item.screen, item.action)}
    >
      <Text style={styles.optionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Image
        style={styles.logo}
        source={require("../assets/13.jpg")}
        resizeMode="cover"
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}></View>
        <Text style={styles.welcomeText}>Welcome, {userInfo.name}!</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <View style={styles.option}>
            <Text style={styles.optionText}>Name: {userInfo.name}</Text>
          </View>
          <View style={styles.option}>
            <Text style={styles.optionText}>Email: {userInfo.email}</Text>
          </View>
        </View>

        <FlatList
          data={menuOptions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: undefined,
    aspectRatio: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  option: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 18,
    color: "#000",
  },
  listContainer: {
    marginTop: 20,
  },
});
