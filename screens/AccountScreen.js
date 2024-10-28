import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AccountScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const storedName = await AsyncStorage.getItem("userName");
      const storedEmail = await AsyncStorage.getItem("userEmail");

      setUserInfo({
        name: storedName || "No name provided",
        email: storedEmail || "No email provided",
      });
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Account</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <AccountOption title={`Name: ${userInfo.name}`} />
        <AccountOption title={`Email: ${userInfo.email}`} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Addresses</Text>
        <AccountOption
          title="Manage Addresses"
          onPress={() => navigation.navigate("Saved Addresses")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <AccountOption
          title="Change Password"
          onPress={() => navigation.navigate("ChangePassword")} // Navigate to password change screen
        />
      </View>
    </ScrollView>
  );
};

const AccountOption = ({ title, onPress }) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <Text style={styles.optionText}>{title}</Text>
  </TouchableOpacity>
);

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
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
});
