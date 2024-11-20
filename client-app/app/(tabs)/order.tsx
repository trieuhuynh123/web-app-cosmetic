import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";

interface Order {
  _id: string;
  status: string;
  orderDetails: {
    price: number;
    quantity: number;
    product: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  totalAmount: number;
  createDate: string;
}

interface GroupOrder {
  [key: string]: {
    orders: Order[];
    totalAmount: number;
  };
}

const OrderScreen: React.FC = () => {
  const [groupOrders, setGroupOrders] = useState<GroupOrder>();
  const [activeTab, setActiveTab] = useState<string>();
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
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`, // Thêm header Authorization với token
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      setGroupOrders(data);
      // Filter orders based on the active tab
    } catch (error) {
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

  if (!groupOrders) {
    return (
      <View>
        <Text>Không có đơn nào</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {Object.keys(groupOrders).map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabButton, activeTab === key && styles.activeTab]}
            onPress={() => setActiveTab(key)}
          >
            <Text style={styles.tabText}>{key.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {Object.entries(groupOrders).map(([key, { orders, totalAmount }]) =>
        key === activeTab ? ( // Chỉ hiển thị nội dung của tab đang active
          <View key={key}>
            <Text>Tổng tiền: {totalAmount}</Text>
            <FlatList
              data={orders}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View className="my-5 border">
                  <Text>
                    Thời gian: {new Date(item.createDate).toLocaleString()}
                  </Text>
                  {item.orderDetails.map((orderItem, index) => (
                    <View
                      key={index}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View>
                        <TouchableOpacity
                          onPress={() => {
                            router.push(`/products/${orderItem.product.id}`);
                          }}
                        >
                          <Image
                            source={{
                              uri: orderItem.product.image,
                            }}
                            style={{ width: 130, height: 130, marginRight: 10 }} // Added margin to space image from text
                          />
                        </TouchableOpacity>
                      </View>
                      <Text>
                        {orderItem.product.name} x{orderItem.quantity}
                      </Text>
                    </View>
                  ))}
                  <Text>Tổng tiền: {item.totalAmount}</Text>
                </View>
              )}
            />
          </View>
        ) : null
      )}
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
