import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Tabs } from "expo-router";
import { View, Text } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { CartProvider } from "../context/CartContext";
import React from "react";
import io from "socket.io-client";
import * as Notifications from "expo-notifications";
import { Order } from "./order";

const Layout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoginStatus = async () => {
    if (await SecureStore.getItemAsync("cosmetic_refresh_token")) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  checkLoginStatus();
  // Định nghĩa hàm refresh token
  const refreshTokenHandler = async () => {
    const refreshToken = await SecureStore.getItemAsync(
      "cosmetic_refresh_token"
    );

    if (!refreshToken) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await SecureStore.getItemAsync(
              "cosmetic_refresh_token"
            )}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            refresh_token: refreshToken,
          }).toString(),
        }
      );

      const data = await response.text();
      if (response.ok) {
        setIsLoggedIn(true);
        await SecureStore.setItemAsync("cosmetic_access_token", data);
      } else {
        setIsLoggedIn(false);
        await SecureStore.deleteItemAsync("cosmetic_refresh_token");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    refreshTokenHandler();
    const intervalId = setInterval(async () => {
      refreshTokenHandler();
    }, 840000);
    return () => clearInterval(intervalId);
  }, []);
  const socket = io(`${process.env.EXPO_PUBLIC_API_URL}`, {
    transports: ["websocket"],
  });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket");
    });
    socket.on("orderUpdated", async (data: Order) => {
      const refresh_token = await SecureStore.getItemAsync(
        "cosmetic_refresh_token"
      );
      if (
        data.status === "shipping" &&
        refresh_token === data.user.refresh_token
      ) {
        sendNotification(data.createDate);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const sendNotification = async (date: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Thông báo đơn hàng",
        body: `Đơn hàng ${new Date(date).toLocaleString()} đang được giao`,
      },
      trigger: null, // Trigger ngay lập tức
    });
  };

  return (
    <>
      <CartProvider>
        <Tabs
          backBehavior="history"
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 72,
              elevation: 0,
              backgroundColor: "white",
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              tabBarIcon: ({ focused }) => (
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 10,
                  }}
                >
                  <Ionicons
                    name={focused ? "home" : "home-outline"}
                    color={focused ? "#0F8BBD0" : "pink"}
                    size={24}
                  />
                  <Text
                    style={{
                      color: focused ? "#0F8BBD0" : "pink",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Home
                  </Text>
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              tabBarIcon: ({ focused }) => (
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 10,
                  }}
                >
                  <Ionicons
                    name={focused ? "search" : "search-outline"}
                    color={focused ? "#0F8BBD0" : "pink"}
                    size={24}
                  />
                  <Text
                    style={{
                      color: focused ? "#0F8BBD0" : "pink",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Search
                  </Text>
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="cart"
            options={{
              tabBarIcon: ({ focused }) => (
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 10,
                  }}
                >
                  <Ionicons
                    name={focused ? "cart" : "cart-outline"}
                    color={focused ? "#0F8BBD0" : "pink"}
                    size={24}
                  />
                  <Text
                    style={{
                      color: focused ? "#0F8BBD0" : "pink",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Cart
                  </Text>
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              tabBarIcon: ({ focused }) => (
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 10,
                  }}
                >
                  <Ionicons
                    name={focused ? "person" : "person-outline"}
                    color={focused ? "#0F8BBD0" : "pink"}
                    size={24}
                  />
                  <Text
                    style={{
                      color: focused ? "#0F8BBD0" : "pink",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Profile
                  </Text>
                </View>
              ),
              href: isLoggedIn ? undefined : null,
            }}
          />
          <Tabs.Screen
            name="login"
            options={{
              tabBarIcon: ({ focused }) => (
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 10,
                  }}
                >
                  <Ionicons
                    name={focused ? "log-in" : "log-in-outline"}
                    color={focused ? "#0F8BBD0" : "pink"}
                    size={24}
                  />
                  <Text
                    style={{
                      color: focused ? "#0F8BBD0" : "pink",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Login
                  </Text>
                </View>
              ),
              href: !isLoggedIn ? undefined : null,
            }}
          />

          <Tabs.Screen
            name="register"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="products/[productId]"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="password"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="order"
            options={{
              tabBarIcon: ({ focused }) => (
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 10,
                  }}
                >
                  <Ionicons
                    name={focused ? "bag" : "bag-outline"}
                    color={focused ? "#0F8BBD0" : "pink"}
                    size={24}
                  />
                  <Text
                    style={{
                      color: focused ? "#0F8BBD0" : "pink",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Đơn hàng
                  </Text>
                </View>
              ),
            }}
          />
        </Tabs>
        <Toast />
      </CartProvider>
    </>
  );
};

export default Layout;
