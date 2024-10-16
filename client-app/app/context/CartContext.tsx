import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

// Định nghĩa các interface và xuất khẩu chúng
export interface Product {
    id: number;
    name: string;
    image: string;
    price: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextProps {
    cartItems: CartItem[];
    cartCount: number;
    addToCart: (productId: number, quantity: number) => Promise<void>;
    updateCartItem: (productId: number, quantity: number) => Promise<void>;
    removeFromCart: (productId: number) => Promise<void>;
    fetchCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextProps>({
    cartItems: [],
    cartCount: 0,
    addToCart: async () => { },
    updateCartItem: async () => { },
    removeFromCart: async () => { },
    fetchCart: async () => { },
});

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartCount, setCartCount] = useState<number>(0);

    // Hàm để lấy giỏ hàng từ backend
    const fetchCart = async () => {
        try {
            const accessToken = await SecureStore.getItemAsync(
                "cosmetic_access_token"
            );
            if (!accessToken) {
                setCartItems([]);
                setCartCount(0);
                return;
            }

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch cart");
            }

            const data = await response.json();
            setCartItems(data.items);
            setCartCount(
                data.items.reduce(
                    (acc: number, item: CartItem) => acc + item.quantity,
                    0
                )
            );
        } catch (error: unknown) {
            // Đặt kiểu của error là unknown
            console.log(error);
            if (error instanceof Error) {
                // Kiểm tra nếu error là instance của Error
                Alert.alert("Error", error.message || "Không thể tải giỏ hàng.");
            } else {
                Alert.alert("Error", "Không thể tải giỏ hàng.");
            }
        }
    };

    // Hàm để thêm sản phẩm vào giỏ hàng
    const addToCart = async (productId: number, quantity: number) => {
        try {
            const accessToken = await SecureStore.getItemAsync(
                "cosmetic_access_token"
            );
            if (!accessToken) {
                Alert.alert("Error", "Bạn cần đăng nhập để thêm vào giỏ hàng.");
                return;
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/cart/add`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        productId: productId,
                        quantity: quantity,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add to cart");
            }

            // Cập nhật giỏ hàng sau khi thêm
            await fetchCart();
        } catch (error: unknown) {
            // Đặt kiểu của error là unknown
            console.log(error);
            if (error instanceof Error) {
                // Kiểm tra nếu error là instance của Error
                Alert.alert(
                    "Error",
                    error.message || "Không thể thêm sản phẩm vào giỏ hàng."
                );
            } else {
                Alert.alert("Error", "Không thể thêm sản phẩm vào giỏ hàng.");
            }
        }
    };

    // Hàm để cập nhật số lượng sản phẩm trong giỏ hàng
    const updateCartItem = async (productId: number, quantity: number) => {
        try {
            const accessToken = await SecureStore.getItemAsync(
                "cosmetic_access_token"
            );
            if (!accessToken) {
                Alert.alert("Error", "Bạn cần đăng nhập để cập nhật giỏ hàng.");
                return;
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/cart/update`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        productId: productId,
                        quantity: quantity,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update cart");
            }

            // Cập nhật giỏ hàng sau khi cập nhật
            await fetchCart();
        } catch (error: unknown) {
            // Đặt kiểu của error là unknown
            console.log(error);
            if (error instanceof Error) {
                // Kiểm tra nếu error là instance của Error
                Alert.alert("Error", error.message || "Không thể cập nhật giỏ hàng.");
            } else {
                Alert.alert("Error", "Không thể cập nhật giỏ hàng.");
            }
        }
    };

    // Hàm để xóa sản phẩm khỏi giỏ hàng
    const removeFromCart = async (productId: number) => {
        try {
            const accessToken = await SecureStore.getItemAsync(
                "cosmetic_access_token"
            );
            if (!accessToken) {
                Alert.alert(
                    "Error",
                    "Bạn cần đăng nhập để xóa sản phẩm khỏi giỏ hàng."
                );
                return;
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/cart/remove/${productId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to remove item");
            }

            // Cập nhật giỏ hàng sau khi xóa
            await fetchCart();
        } catch (error: unknown) {
            // Đặt kiểu của error là unknown
            console.log(error);
            if (error instanceof Error) {
                // Kiểm tra nếu error là instance của Error
                Alert.alert(
                    "Error",
                    error.message || "Không thể xóa sản phẩm khỏi giỏ hàng."
                );
            } else {
                Alert.alert("Error", "Không thể xóa sản phẩm khỏi giỏ hàng.");
            }
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartCount,
                addToCart,
                updateCartItem,
                removeFromCart,
                fetchCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
