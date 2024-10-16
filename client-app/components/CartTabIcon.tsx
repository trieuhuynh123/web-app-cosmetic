import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CartContext } from "@/app/context/CartContext";

interface CartTabIconProps {
    focused: boolean;
}

const CartTabIcon: React.FC<CartTabIconProps> = ({ focused }) => {
    const { cartCount } = useContext(CartContext);

    return (
        <View style={styles.container}>
            <Ionicons
                name={focused ? "cart" : "cart-outline"}
                color={focused ? "#0F8BBD0" : "pink"}
                size={24}
            />
            {cartCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
            )}
            <Text style={[styles.label, { color: focused ? "#0F8BBD0" : "pink" }]}>
                Cart
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        paddingTop: 10,
    },
    badge: {
        position: "absolute",
        right: -6,
        top: -3,
        backgroundColor: "red",
        borderRadius: 6,
        width: 12,
        height: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    badgeText: {
        color: "white",
        fontSize: 8,
        fontWeight: "bold",
    },
    label: {
        fontSize: 12,
        marginTop: 4,
    },
});

export default CartTabIcon;