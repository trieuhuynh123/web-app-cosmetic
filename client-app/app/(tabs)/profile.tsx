import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const ProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await SecureStore.getItemAsync(
              "cosmetic_access_token"
            )}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const data = await response.json();

      setName(data.name);
      setEmail(data.email);
      setAddress(data.address);
    } catch (error) {
      Alert.alert("Error", "Failed to load profile data.");
    }
  };
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Hàm đăng xuất
  const handleLogout = async () => {
    await SecureStore.setItemAsync("loggedIn", "false");
    await SecureStore.deleteItemAsync("cosmetic_access_token");
    await SecureStore.deleteItemAsync("cosmetic_refresh_token");
    router.push("/");
    Alert.alert("Success", "You have logged out successfully!");
  };

  return (
    <View className="flex-1 p-6 justify-center">
      <Text className="text-2xl font-bold mb-6">Profile</Text>

      <Text className="border border-gray-300 rounded-lg h-12 mb-4 p-2">
        <Text className="font-semibold">Name: </Text>
        {name}
      </Text>

      <Text className="border border-gray-300 rounded-lg h-12 mb-4 p-2">
        <Text className="font-semibold">Email: </Text>
        {email}
      </Text>

      <Text className="border border-gray-300 rounded-lg h-12 mb-4 p-2">
        <Text className="font-semibold">Address: </Text>
        {address}
      </Text>

      <Button title="Logout" onPress={handleLogout} color="#FF6347" />
    </View>
  );
};

export default ProfileScreen;
