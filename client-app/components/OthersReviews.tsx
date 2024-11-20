import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string; // Bạn có thể thêm thuộc tính name nếu có
  };
}

interface OthersReviewsProps {
  productId: string;
}

const OthersReviews = ({ productId }: OthersReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

      // Check if data is an array
      if (Array.isArray(data)) {
        setReviews(data);
      } else {
        console.error("Unexpected API response format:", data);
        setReviews([]); // Set empty array if data is not in the expected format
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      Alert.alert("Error", "Unable to fetch reviews. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOthersReviews();
  }, [productId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="p-5 bg-gray-100 rounded-lg">
      <Text className="text-lg font-semibold mb-2">
        Đánh giá của người khác:
      </Text>
      {reviews.length === 0 && !reviews ? (
        <Text>Không có đánh giá nào.</Text>
      ) : (
        reviews.map((review) => (
          <View key={review.id} className="bg-white rounded p-4 mb-2 shadow">
            <Text className="font-bold">
              {review.user.name || "Người dùng"}
            </Text>
            <Text>Số sao: {review.rating}</Text>
            <Text>{review.comment}</Text>
          </View>
        ))
      )}
    </View>
  );
};

export default OthersReviews;
