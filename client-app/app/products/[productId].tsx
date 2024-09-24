// ProductDetail.js
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
}
const ProductDetail = ({}) => {
  const { productId } = useLocalSearchParams();
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/products/${productId}`,
          {
            method: "GEt",
          }
        );
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!product) {
    return <Text>Product not found</Text>;
  }

  return (
    <ScrollView className="flex-1 bg-white px-4">
      {/* Banner quảng cáo */}
      <View>
        <Image
          className="w-full h-20 mt-5"
          source={require("@/assets/images/banner.jpg")}
        />
      </View>
      <View className="flex-1 p-4 mt-10">
        <Image
          source={{
            uri: product.image,
          }}
          className="w-full h-64 object-cover"
        />
        <Text className="text-2xl font-bold mt-4">{product.name}</Text>
        <Text className="text-xl text-gray-500 mt-2">${product.price}</Text>
        <View className="flex-row items-center mt-4">
          <TouchableOpacity
            onPress={handleDecrease}
            className="bg-gray-300 p-2 rounded"
          >
            <Text className="text-lg font-bold">-</Text>
          </TouchableOpacity>
          <Text className="text-lg mx-4">{quantity}</Text>
          <TouchableOpacity
            onPress={handleIncrease}
            className="bg-gray-300 p-2 rounded"
          >
            <Text className="text-lg font-bold">+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="bg-blue-500 p-4 rounded mt-4">
          <Text className="text-white text-center text-lg font-bold">
            Thêm vào giỏ hàng
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProductDetail;
