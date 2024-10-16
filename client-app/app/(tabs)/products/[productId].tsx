// ProductDetail.js
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert, // Thêm Alert
} from "react-native";
import * as SecureStore from "expo-secure-store";
import RatingComponent from "@/components/RatingComponent";
import OthersReviews from "@/components/OthersReviews";
import { CartContext } from "@/app/context/CartContext";// Đường dẫn có thể thay đổi

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
}
interface Review {
  rating: number;
  comment: string;
  user: {
    name: string; // Bạn có thể thêm thuộc tính name nếu có
  };
}

const ProductDetail = ({ }) => {
  const { productId } = useLocalSearchParams();
  const productIdString = productId as string;
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [purchaseStatus, setPurchaseStatus] = useState<boolean>();
  const [reviews, setReviews] = useState<Review[]>([]);

  const { addToCart } = useContext(CartContext); // Sử dụng CartContext

  useEffect(() => {
    const fetchOthersReviews = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/reviews/find/others?productId=${productId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${await SecureStore.getItemAsync(
                "cosmetic_access_token"
              )}`,
            },
          }
        );

        const data = await response.json();
        setReviews(data); // Giả sử dữ liệu trả về là mảng đánh giá
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      } finally {
      }
    };
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/products/${productId}`,
          {
            method: "GET", // Sửa từ "GEt" thành "GET"
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
    const checkPurchasedProduct = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/orders/check-purchase`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${await SecureStore.getItemAsync(
                "cosmetic_access_token"
              )}`,
            },
            body: JSON.stringify({ productId }), // Gửi productId trong body
          }
        );
        const data = await response.json();

        if (data.purchased === true) {
          setPurchaseStatus(true);
        } else {
          setPurchaseStatus(false);
        }
      } catch (error) {
        setPurchaseStatus(false);
      }
    };
    fetchProduct();
    checkPurchasedProduct();
    fetchOthersReviews();
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
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded mt-4"
          onPress={async () => {
            if (product) {
              await addToCart(product.id, quantity); // Thêm sản phẩm vào giỏ hàng
              Alert.alert("Thành công", "Sản phẩm đã được thêm vào giỏ hàng.");
            }
          }}
        >
          <Text className="text-white text-center text-lg font-bold">
            Thêm vào giỏ hàng
          </Text>
        </TouchableOpacity>
      </View>
      <View className="mb-20">
        {purchaseStatus && <RatingComponent productId={productIdString} />}
        <OthersReviews productId={productIdString} />
      </View>
    </ScrollView>
  );
};

export default ProductDetail;
