// src/components/CartItem.tsx
import React, { useContext } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { CartItem, CartContext } from "@/app/context/CartContext";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Props {
    item: CartItem;
}

const CartItemComponent: React.FC<Props> = ({ item }) => {
    const { updateCartItem, removeFromCart } = useContext(CartContext);

    const handleIncrease = async () => {
        try {
            await updateCartItem(item.product.id, item.quantity + 1);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDecrease = async () => {
        if (item.quantity > 1) {
            try {
                await updateCartItem(item.product.id, item.quantity - 1);
            } catch (error) {
                console.error(error);
            }
        } else {
            Alert.alert(
                "Xác nhận",
                "Bạn có chắc chắn muốn xóa sản phẩm khỏi giỏ hàng không?",
                [
                    { text: "Không", style: "cancel" },
                    { text: "Có", onPress: () => handleRemove() },
                ]
            );
        }
    };

    const handleRemove = async () => {
        try {
            await removeFromCart(item.product.id);
            Alert.alert("Thành công", "Sản phẩm đã được xóa khỏi giỏ hàng.");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.itemContainer}>
            <Image source={{ uri: item.product.image }} style={styles.productImage} />
            <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.product.name}</Text>
                <Text style={styles.productPrice}>${item.product.price}</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity onPress={handleDecrease} style={styles.quantityButton}>
                        <Ionicons name="remove-circle-outline" size={24} color="#0F8BBD0" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={handleIncrease} style={styles.quantityButton}>
                        <Ionicons name="add-circle-outline" size={24} color="#0F8BBD0" />
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
                <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: "row",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 5,
    },
    productDetails: {
        marginLeft: 10,
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    productPrice: {
        fontSize: 14,
        color: "#888",
        marginTop: 4,
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    quantityButton: {
        padding: 4,
    },
    quantityText: {
        fontSize: 16,
        marginHorizontal: 10,
    },
    removeButton: {
        padding: 4,
    },
});

export default CartItemComponent;
