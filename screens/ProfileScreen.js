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
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const navigation = useNavigation();

  const menuOptions = [
    { id: "1", title: "Your Orders" },
    { id: "2", title: "Your Account" },
    { id: "3", title: "Buy Again" },
    { id: "4", title: "Saved Items" },
    { id: "5", title: "Saved Addresses" },
    { id: "6", title: "Logout", action: "logout" },
  ];

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerStyle: { backgroundColor: "#fff" },
      headerLeft: () => (
        <Image
          style={styles.headerImage}
          source={{
            uri: "https://assets.stickpng.com/thumbs/580b57fcd9996e24bc43c518.png",
          }}
        />
      ),
      headerRight: () => (
        <View style={styles.headerIcons}>
          <Ionicons name="notifications-outline" size={24} color="black" />
          <AntDesign name="search1" size={24} color="black" />
        </View>
      ),
    });
  }, [navigation]);

  const handlePress = (action) => {
    if (action === "logout") {
      console.log("Logged out");
      navigation.replace("Login");
    } else {
      console.log(`Navigating to ${action}`);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.listItem}
      onPress={() => handlePress(item.action || item.title)}
    >
      <Text style={styles.listItemText}>{item.title}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require("../assets/13.jpg")}
          resizeMode="cover"
        ></Image>
      </View>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.container}>
        <Text style={styles.welcomeText}>Welcome to your profile</Text>

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
  },
  listContainer: {
    marginTop: 20,
  },
  listItem: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "left",
  },
  logoContainer: {
    width: "100%", // Full width of the container
    alignItems: "center", // Centering the image
  },
  logo: {
    width: "100%", // Image takes 100% width
    height: undefined, // Allow height to adjust automatically
    aspectRatio: 10,
  },
});
