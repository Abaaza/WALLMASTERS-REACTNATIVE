import React, { useEffect, useState } from "react";
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

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);

  const menuOptions = [
    { id: "1", title: "Your Orders", screen: "Your Orders" },
    { id: "4", title: "Saved Items", screen: "Saved Items" }, // Added "Saved Items" option
    { id: "2", title: "Manage Addresses", screen: "Saved Addresses" },
    { id: "3", title: "Change Password", screen: "ChangePassword" },
    { id: "5", title: "Logout", action: "logout" },
  ];

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const storedName = await AsyncStorage.getItem("userName");
          const storedEmail = await AsyncStorage.getItem("userEmail");
          setUserInfo({
            name: storedName || "No name provided",
            email: storedEmail || "No email provided",
          });
        } else {
          navigation.replace("Login");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigation]);

  const handlePress = (screen, action) => {
    if (action === "logout") {
      Alert.alert("Logout Confirmation", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await AsyncStorage.removeItem("authToken");
            navigation.replace("Login");
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

        {/* Personal Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <View style={styles.option}>
            <Text style={styles.optionText}>Name: {userInfo.name}</Text>
          </View>
          <View style={styles.option}>
            <Text style={styles.optionText}>Email: {userInfo.email}</Text>
          </View>
        </View>

        {/* Menu Options */}
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
