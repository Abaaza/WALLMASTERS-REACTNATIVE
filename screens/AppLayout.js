import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

const AppLayout = ({ children }) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Global StatusBar Configuration */}
        <StatusBar
          style="dark" // Adjust based on your theme
          translucent
          backgroundColor="transparent" // For proper translucent effect
        />
        {children} {/* Directly rendering children */}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default AppLayout;
