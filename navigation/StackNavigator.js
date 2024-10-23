import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Entypo,
  AntDesign,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import ProductInfoScreen from "../screens/ProductInfoScreen";
import AddressScreen from "../screens/AddressScreen";
import CartScreen from "../screens/CartScreen";
import ConfirmationScreen from "../screens/ConfirmationScreen";
import OrderScreen from "../screens/OrderScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ShopScreen from "../screens/ShopScreen";

// Stack and Tab Navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Shop Stack Navigator with Product Info Screen
function ShopStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShopMain" component={ShopScreen} />
      <Stack.Screen
        name="ProductInfo"
        component={ProductInfoScreen}
        options={({ route, navigation }) => ({
          headerShown: true, // Show header only here
          title: route.params?.title || "Product Info",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ),
          headerStyle: { height: 60, backgroundColor: "#fff" },
          headerTitleStyle: { fontSize: 22, fontWeight: "bold" },
          headerTitleAlign: "center",
        })}
      />
    </Stack.Navigator>
  );
}

// Home Stack Navigator
function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}

// Bottom Tabs Navigator
function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: "Home",
          tabBarLabelStyle: { color: "#000" },
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Entypo name="home" size={24} color="#ff6347" />
            ) : (
              <AntDesign name="home" size={24} color="#000" />
            ),
        }}
      />
      <Tab.Screen
        name="ShopStack"
        component={ShopStackNavigator}
        options={{
          tabBarLabel: "Shop",
          tabBarLabelStyle: { color: "#000" },
          tabBarIcon: ({ focused }) =>
            focused ? (
              <FontAwesome5 name="store" size={20} color="#ff6347" />
            ) : (
              <FontAwesome5 name="store" size={20} color="#000" />
            ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault(); // Prevent the default behavior
            navigation.navigate("ShopStack", { screen: "ShopMain" }); // Ensure it always opens the main shop screen
          },
        })}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: "Cart",
          tabBarLabelStyle: { color: "#000" },
          tabBarIcon: ({ focused }) =>
            focused ? (
              <AntDesign name="shoppingcart" size={24} color="#ff6347" />
            ) : (
              <AntDesign name="shoppingcart" size={24} color="#000" />
            ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarLabelStyle: { color: "#000" },
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MaterialIcons name="person" size={24} color="#ff6347" />
            ) : (
              <MaterialIcons name="person" size={24} color="#000" />
            ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="Address" component={AddressScreen} />
        <Stack.Screen name="Confirm" component={ConfirmationScreen} />
        <Stack.Screen name="Order" component={OrderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  backButton: {
    backgroundColor: "transparent",
    padding: 10,
  },
  backButtonText: {
    color: "#000",
    fontSize: 18,
  },
});
