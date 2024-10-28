import React from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";

const AuthCheckModal = ({ visible, onClose, onGuest, onLogin }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            For better experience, please register or login to your account.
          </Text>

          <Pressable style={styles.button} onPress={onLogin}>
            <Text style={styles.buttonText}>Register / Login</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={onGuest}>
            <Text style={styles.buttonText}>Continue as Guest</Text>
          </Pressable>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default AuthCheckModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },

  modalText: {
    fontSize: 17,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff6347",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: "#555",
    fontSize: 14,
  },
});
