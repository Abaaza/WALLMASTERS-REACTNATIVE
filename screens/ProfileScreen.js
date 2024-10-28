import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  StatusBar,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true); // Loading state for async operations

  const menuOptions = [
    { id: "1", title: "Your Orders", screen: "Your Orders" },
    { id: "2", title: "Your Account", screen: "Your Account" },
    { id: "3", title: "Saved Items", screen: "Saved Items" },

    { id: "5", title: "Logout", action: "logout" },
  ];

  // Check if the user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const storedName = await AsyncStorage.getItem("userName");
          setUserName(storedName || "User");
        } else {
          navigation.replace("Login"); // Redirect to Login if not logged in
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false); // Stop loading when check is done
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
    <Pressable
      style={styles.listItem}
      onPress={() => handlePress(item.screen, item.action)}
    >
      <Text style={styles.listItemText}>{item.title}</Text>
    </Pressable>
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
      <ScrollView style={styles.container}>
        <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
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
  container: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerImage: {
    width: 140,
    height: 120,
    resizeMode: "contain",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 25,
    textAlign: "center",
  },
  listContainer: {
    marginTop: 20,
  },
  listItem: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "600",
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
});
