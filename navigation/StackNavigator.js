import React, { useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
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

// Stack Navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Standalone Product Info Screen Wrapper
function ProductInfoScreenWrapper({ route, navigation }) {
  const { title, item } = route.params || {};
  const itemName = title || item?.name || "Product Info";

  useEffect(() => {
    navigation.setOptions({
      title: itemName,
      headerLeft: () => (
        <Button
          onPress={() => navigation.goBack()}
          title="Back"
          color="#ff6347"
        />
      ),
    });
  }, [navigation, itemName]);

  return <ProductInfoScreen />;
}

// Shop Stack Navigator
function ShopStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          height: 60,
          backgroundColor: "#fff",
        },
        headerTitleStyle: {
          fontSize: 22,
          fontWeight: "bold",
        },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="ShopMain"
        component={ShopScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Home Stack Navigator
function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          height: 60,
          backgroundColor: "#fff",
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "bold",
        },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Bottom Tabs Navigator
function BottomTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: "Home",
          tabBarLabelStyle: { color: "#000" },
          headerShown: false,
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
          headerShown: false,
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
        component={CartScreen}
        options={{
          tabBarLabel: "Cart",
          tabBarLabelStyle: { color: "#000" },
          headerShown: false,
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
          headerShown: false,
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
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProductInfo"
          component={ProductInfoScreenWrapper}
          options={{ headerShown: true }} // Ensure header is shown
        />
        <Stack.Screen
          name="Address"
          component={AddressScreen}
          options={{
            headerStyle: {
              height: 60,
              backgroundColor: "#f8f8f8",
            },
          }}
        />
        <Stack.Screen
          name="Confirm"
          component={ConfirmationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Order"
          component={OrderScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
