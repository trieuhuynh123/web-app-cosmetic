import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
// Định nghĩa các interface và xuất khẩu chúng
export interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
}

export interface CartItem {
  _id: string;
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

// Create the context with a default value
export const CartContext = createContext<CartContextProps>({
  cartItems: [],
  cartCount: 0,
  addToCart: async () => {},
  updateCartItem: async () => {},
  removeFromCart: async () => {},
  fetchCart: async () => {},
});
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);

  // Fetch Cart Function
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
      console.log(error);
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "Cannot load cart.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Cannot load cart.",
        });
      }
    }
  };

  // Add to Cart Function
  const addToCart = async (productId: number, quantity: number) => {
    try {
      const accessToken = await SecureStore.getItemAsync(
        "cosmetic_access_token"
      );
      if (!accessToken) {
        Toast.show({
          type: "info",
          text1: "Authentication Required",
          text2: "Please log in to add items to your cart.",
        });
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
            productId,
            quantity,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add to cart");
      }

      await fetchCart();
      Toast.show({
        type: "success",
        text1: "Added to Cart",
        text2: "The item has been added to your cart.",
      });
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "Cannot add to cart.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Cannot add to cart.",
        });
      }
    }
  };

  // Update Cart Item Function
  const updateCartItem = async (productId: number, quantity: number) => {
    try {
      const accessToken = await SecureStore.getItemAsync(
        "cosmetic_access_token"
      );
      if (!accessToken) {
        Toast.show({
          type: "info",
          text1: "Authentication Required",
          text2: "Please log in to update your cart.",
        });
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
            productId,
            quantity,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update cart");
      }

      await fetchCart();
      Toast.show({
        type: "success",
        text1: "Cart Updated",
        text2: "Your cart has been updated.",
      });
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "Cannot update cart.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Cannot update cart.",
        });
      }
    }
  };

  // Remove from Cart Function
  const removeFromCart = async (productId: number) => {
    try {
      const accessToken = await SecureStore.getItemAsync(
        "cosmetic_access_token"
      );
      if (!accessToken) {
        Toast.show({
          type: "info",
          text1: "Authentication Required",
          text2: "Please log in to modify your cart.",
        });
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

      await fetchCart();
      Toast.show({
        type: "success",
        text1: "Removed from Cart",
        text2: "The item has been removed from your cart.",
      });
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "Cannot remove from cart.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Cannot remove from cart.",
        });
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
