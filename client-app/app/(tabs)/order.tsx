import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
export interface Order {
  id: string;
  status: string;
  address: string;
  user: { refresh_token: string };
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
  const [activeTab, setActiveTab] = useState<string>("new");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      setGroupOrders(data);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to fetch orders. Please try again later.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false); // Đảm bảo set lại trạng thái refreshing khi tải lại xong
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true); // Đánh dấu là đang refresh
    await fetchOrders();
  };

  useEffect(() => {
    fetchOrders(); // Lần đầu tiên khi màn hình được tải
  }, []);

  if (!groupOrders) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-500">Không có đơn nào</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <View className="flex-row justify-between mb-4">
        {["new", "shipping", "delivered"].map((key, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-1 p-3 items-center border-b-2 ${
              activeTab === key ? "border-blue-500" : "border-gray-300"
            }`}
            onPress={() => setActiveTab(key)}
          >
            <Text className="text-sm font-semibold text-gray-700">
              {key.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {Object.entries(groupOrders).map(([key, { orders, totalAmount }]) =>
        key === activeTab ? (
          <View key={key}>
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Tổng tiền: {totalAmount}
            </Text>
            <FlatList
              data={orders}
              className=" mb-48"
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="mb-4 p-4 border border-gray-300 rounded-md">
                  <Text className="text-sm text-gray-600">
                    Thời gian: {new Date(item.createDate).toLocaleString()}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Giao đến: {item.address}
                  </Text>
                  {item.orderDetails.map((orderItem, index) => (
                    <View key={index} className="flex-row items-center mt-2">
                      <TouchableOpacity
                        onPress={() => {
                          router.push(`/products/${orderItem.product.id}`);
                        }}
                      >
                        <Image
                          source={{ uri: orderItem.product.image }}
                          className="w-32 h-32 mr-4 rounded-md"
                        />
                      </TouchableOpacity>
                      <Text className="text-sm text-gray-700">
                        {orderItem.product.name} x{orderItem.quantity}
                      </Text>
                    </View>
                  ))}
                  <Text className="text-lg font-semibold text-gray-800 mt-2">
                    Tổng tiền: {item.totalAmount}
                  </Text>
                </View>
              )}
              refreshing={refreshing} // Kết nối trạng thái refreshing vào FlatList
              onRefresh={handleRefresh} // Gọi hàm handleRefresh khi kéo xuống
            />
          </View>
        ) : null
      )}
    </View>
  );
};

export default OrderScreen;
