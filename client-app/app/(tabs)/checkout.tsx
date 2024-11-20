//tabs/checkout.tsx
import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CartContext } from "../context/CartContext";
import Toast from "react-native-toast-message";

const Checkout: React.FC = () => {
  const { cartItems, cartCount } = useContext(CartContext);

  const handlePlaceOrder = () => {
    if (cartCount === 0) {
      Toast.show({
        type: "info",
        text1: "Empty Cart",
        text2: "Please add items to your cart before checking out.",
      });
      return;
    }

    // Call your order placement API here
    Toast.show({
      type: "success",
      text1: "Order Placed",
      text2: "Your order has been placed successfully!",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      {cartItems.length > 0 ? (
        cartItems.map((item) => (
          <View key={item.product.id} style={styles.item}>
            <Text>{item.product.name}</Text>
            <Text>Quantity: {item.quantity}</Text>
            <Text>Price: ${item.product.price * item.quantity}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handlePlaceOrder}>
        <Text style={styles.buttonText}>Place Order</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  item: { padding: 8, borderBottomWidth: 1, borderColor: "#ddd" },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#888",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#0F8BBD0",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default Checkout;
