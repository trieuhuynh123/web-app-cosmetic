import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  CartContext,
  CartItem,
  CartItem as CartItemType,
} from "@/app/context/CartContext";
import Checkbox from "expo-checkbox";
interface CartItemProps {
  item: CartItemType;
  onSelect: (item: CartItem) => void;
}

const CartItemComponent: React.FC<CartItemProps> = ({ item, onSelect }) => {
  const { updateCartItem, removeFromCart } = useContext(CartContext);
  const [isChecked, setChecked] = useState(false);
  const handleRemove = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: () => removeFromCart(item.product.id),
        },
      ]
    );
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateCartItem(item.product.id, item.quantity - 1);
    } else {
      handleRemove();
    }
  };

  const handleIncrease = () => {
    updateCartItem(item.product.id, item.quantity + 1);
  };

  return (
    <View style={styles.cartItem}>
      <Checkbox
        value={isChecked}
        onValueChange={() => {
          setChecked(!isChecked);
          onSelect(item);
        }}
      />

      <Image source={{ uri: item.product.image }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.product.name}</Text>
        <Text style={styles.productPrice}>${item.product.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleDecrease}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleIncrease}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={handleRemove}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productPrice: {
    fontSize: 14,
    color: "#888",
    marginVertical: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0F8BBD0",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 16,
  },
});

export default CartItemComponent;
