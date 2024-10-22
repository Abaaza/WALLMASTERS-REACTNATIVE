import React from "react";
import { StatusBar } from "expo-status-bar"; // Import StatusBar from expo
import { StyleSheet } from "react-native";
import StackNavigator from "./navigation/StackNavigator";
import { Provider } from "react-redux";
import store from "./store";
import { ModalPortal } from "react-native-modals";
import AppLayout from "./screens/AppLayout"; // Import AppLayout

export default function App() {
  return (
    <AppLayout>
      {/* Apply white background and dark content icons globally */}
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />

      <Provider store={store}>
        <StackNavigator />
        <ModalPortal />
      </Provider>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
