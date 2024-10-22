// AppLayout.js
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

const AppLayout = ({ children }) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Global StatusBar Configuration */}
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        {/* Render children passed to this component */}
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

// Styles for the AppLayout component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // Ensures the background is white
  },
});

export default AppLayout;
