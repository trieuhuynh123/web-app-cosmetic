import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as SecureStore from "expo-secure-store";
const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const handleLogin = async () => {
    // Kiểm tra định dạng email
    const isValidEmail = (email: string) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(email);
    };

    // Kiểm tra xem email có hợp lệ không
    if (!isValidEmail(email)) {
      setMessage("Địa chỉ email không hợp lệ");
      return; // Dừng hàm nếu email không hợp lệ
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            email: email,
            password: password,
          }).toString(),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.message || "Unknown error occurred";
        setMessage(errorMessage);
      } else {
        await SecureStore.setItemAsync("loggedIn", "true");
        await SecureStore.setItemAsync(
          "cosmetic_access_token",
          data.access_token
        );
        await SecureStore.setItemAsync(
          "cosmetic_refresh_token",
          data.refresh_token
        );
        setEmail("");
        setMessage("");
        setPassword("");
        router.back();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          router.push("/register");
        }}
      >
        <Text style={styles.register}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    color: "red", // Style thông báo lỗi
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  register: {
    marginTop: 15,
    color: "#007bff",
    textAlign: "center",
  },
});

export default LoginScreen;
