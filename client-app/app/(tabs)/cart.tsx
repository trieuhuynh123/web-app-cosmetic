// src/screens/CartScreen.tsx
import React, { useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { CartContext, CartItem } from "../context/CartContext";
import CartItemComponent from "@/components/CartItem";

const CartScreen: React.FC = () => {
  const { cartItems, cartCount, fetchCart } = useContext(CartContext);

  useEffect(() => {
    fetchCart();
  }, []);

  if (cartCount === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0F8BBD0" />
      </View>
    );
  }

  const calculateTotal = () => {
    return cartItems
      .reduce(
        (acc: number, item: CartItem) =>
          item.product && item.product.price ? acc + item.product.price * item.quantity : acc,
        0
      )
      .toFixed(2);
  };

  const handleCheckout = () => {
    // Implement checkout functionality here
    Alert.alert("Thông báo", "Chức năng thanh toán đang được phát triển.");
  };

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống.</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item: CartItem) =>
            item.product && item.product.id ? item.product.id.toString() : Math.random().toString()
          }
          renderItem={({ item }: { item: CartItem }) => (
            <CartItemComponent item={item} />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
      {cartItems.length > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Tổng cộng: ${calculateTotal()}</Text>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  emptyCartText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#888",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  totalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  checkoutButton: {
    backgroundColor: "#0F8BBD0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CartScreen;
