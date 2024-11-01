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
import YourOrders from "../screens/YourOrders";
import AccountScreen from "../screens/AccountScreen";
import SavedItemsScreen from "../screens/SavedItemsScreen";
import RegisterScreen from "../screens/RegisterScreen";
import LoginScreen from "../screens/LoginScreen";
import SavedAddressesScreen from "../screens/SavedAddressesScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";

// Stack and Tab Navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Individual Stack Navigators with ProductInfoScreen in each

// Shop Stack Navigator
function ShopStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ShopMain"
        component={ShopScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductInfo"
        component={ProductInfoScreen}
        options={({ route, navigation }) => ({
          headerShown: true,
          title: route.params?.title || "Product Info",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("ShopMain")}
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
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductInfo"
        component={ProductInfoScreen}
        options={{ headerShown: true, title: "Product Info" }}
      />
    </Stack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Your Orders"
        component={YourOrders}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Your Account"
        component={AccountScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Saved Addresses"
        component={SavedAddressesScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Saved Items"
        component={SavedItemsScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerShown: true, title: "Change Password" }}
      />
      <Stack.Screen
        name="ProductInfo"
        component={ProductInfoScreen}
        options={{ headerShown: true, title: "Product Info" }}
      />
    </Stack.Navigator>
  );
}

// Cart Stack Navigator
function CartStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Enter Address"
        component={AddressScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Order Summary"
        component={ConfirmationScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Order"
        component={OrderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductInfo"
        component={ProductInfoScreen}
        options={{ headerShown: true, title: "Product Info" }}
      />
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
          tabBarIcon: ({ focused }) =>
            focused ? (
              <FontAwesome5 name="store" size={20} color="#ff6347" />
            ) : (
              <FontAwesome5 name="store" size={20} color="#000" />
            ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStackNavigator}
        options={{
          tabBarLabel: "Cart",
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
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: "Profile",
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
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={BottomTabs} />
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
