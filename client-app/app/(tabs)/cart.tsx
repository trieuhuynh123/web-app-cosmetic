import React, { useEffect, useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { CartContext, CartItem } from "../context/CartContext";
import CartItemComponent from "@/components/CartItem";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

const CartScreen: React.FC = () => {
  const { cartItems, cartCount, fetchCart } = useContext(CartContext);
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    fetchCart();
  }, []);

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      Toast.show({
        type: "info",
        text1: "No Items Selected",
        text2: "Please select items to checkout.",
      });
      return;
    }

    Alert.alert("Confirm Checkout", `\nDo you want to proceed?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => createOrder(),
      },
    ]);
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      const accessToken = await SecureStore.getItemAsync(
        "cosmetic_access_token"
      );
      if (!accessToken) {
        Toast.show({
          type: "info",
          text1: "Authentication Required",
          text2: "Please log in to proceed with checkout.",
        });
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/orders`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedItems),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order");
      }

      const data = await response.json();
      Toast.show({
        type: "success",
        text1: "Order Placed",
        text2: "Your order has been placed successfully.",
      });

      // Clear selected items and refresh cart
      // setSelectedItems([]);
      fetchCart();
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: "Checkout Error",
          text2: error.message || "An error occurred during checkout.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Checkout Error",
          text2: "An unexpected error occurred.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: CartItem) => {
    setSelectedItems((prevSelected) => {
      // Check if the item is already selected
      const isAlreadySelected = prevSelected.some(
        (selectedItem) => selectedItem._id === item._id
      );

      const itemTotalPrice = item.product.price * item.quantity;

      if (isAlreadySelected) {
        return prevSelected.filter(
          (selectedItem) => selectedItem._id !== item._id
        );
      } else {
        return [...prevSelected, item];
      }
    });
  };

  if (cartCount === null) {
    return (
      <View>
        <ActivityIndicator size="large" color="#0F8BBD0" />
      </View>
    );
  }

  return (
    <View className="pb-[200px]">
      {cartItems.length === 0 ? (
        <Text>Giỏ hàng của bạn đang trống.</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <CartItemComponent item={item} onSelect={handleSelectItem} />
          )}
        />
      )}
      <TouchableOpacity
        className="bg-pink-300 py-3 px-5 rounded-lg shadow-md flex items-center justify-center"
        onPress={handleCheckout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text className="text-white font-semibold text-lg">Thanh toán</Text>
        )}
      </TouchableOpacity>
      {/* {cartItems.length > 0 && (
        <View>
          <Text>Tổng cộng: ${total}</Text>
        </View>
      )} */}
      <Toast />
    </View>
  );
};

export default CartScreen;
