import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";

interface Order {
  _id: string;
  status: string;
  items: Array<{
    product: { name: string; price: number };
    quantity: number;
  }>;
  total: number;
  createdAt: string;
}

const OrderScreen: React.FC = () => {
  const [groupOrders, setGroupOrders] = useState();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"New" | "Delivered">("New");
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const accessToken = await SecureStore.getItemAsync(
        "cosmetic_access_token"
      );
      if (!accessToken) {
        Toast.show({
          type: "info",
          text1: "Authentication Required",
          text2: "Please log in to view your orders.",
        });
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/orders`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      console.log(data);
      setGroupOrders(data);
      // Filter orders based on the active tab
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to fetch orders. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <View style={styles.container}>
      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        {Object.entries().map(([key, { orders, totalAmount }]) => (
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "Delivered" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("Delivered")}
          >
            <Text style={styles.tabText}>Delivered</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Order List */}
      {loading ? (
        <Text>Loading...</Text>
      ) : filteredOrders.length === 0 ? (
        <Text style={styles.emptyText}>
          No {activeTab.toLowerCase()} orders found.
        </Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(order) => order._id}
          renderItem={({ item }) => (
            <View style={styles.orderItem}>
              <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              {item.items.map((orderItem, index) => (
                <Text key={index} style={styles.orderDetails}>
                  {orderItem.quantity} x {orderItem.product.name} - $
                  {(orderItem.product.price * orderItem.quantity).toFixed(2)}
                </Text>
              ))}
              <Text style={styles.orderTotal}>
                Total: ${item.total.toFixed(2)}
              </Text>
            </View>
          )}
        />
      )}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ddd",
  },
  activeTab: {
    borderBottomColor: "#0F8BBD0",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#888",
  },
  orderItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  orderDetails: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
});

export default OrderScreen;
