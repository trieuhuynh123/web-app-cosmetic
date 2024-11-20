import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";

import { Rating } from "react-native-ratings";
import ReviewDisplay from "./ReviewDisplay";
interface RatingComponentProps {
  productId: string;
}
const RatingComponent = ({ productId }: RatingComponentProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasReview, setHasReview] = useState<boolean>();
  const [reviewId, setReviewId] = useState("");
  const handleDeleteConfirmation = () => {
    Alert.alert(
      "Xác Nhận Xóa",
      "Bạn có chắc chắn muốn xóa đánh giá này?",
      [
        {
          text: "Hủy",
          onPress: () => console.log("Hủy xóa"),
          style: "cancel",
        },
        {
          text: "Xóa",
          onPress: handleDelete,
          style: "destructive", // Tùy chọn kiểu nút xóa
        },
      ],
      { cancelable: true }
    );
  };
  const handleDelete = async () => {
    if (!reviewId) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${await SecureStore.getItemAsync(
              "cosmetic_access_token"
            )}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Thành công", "Đánh giá của bạn đã được xóa!");
        setRating(0); // Reset rating
        setComment(""); // Reset comment
        setReviewId(""); // Reset reviewId
        setHasReview(false); // Đánh dấu không có review
      } else {
        const errorData = await response.json();
        Alert.alert("Lỗi", `Xóa đánh giá thất bại: ${errorData.message}`);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi xóa đánh giá");
    }
  };
  const checkExistingReview = async () => {
    setRating(0);
    setComment("");
    setReviewId("");
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reviews/find?productId=${productId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await SecureStore.getItemAsync(
              "cosmetic_access_token"
            )}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data) {
          // Nếu review tồn tại, cập nhật state
          setRating(data.rating);
          setComment(data.comment);
          setReviewId(data.id); // Giả sử review có ID để quản lý
          setHasReview(true); // Đánh dấu đã có review
        } else {
          setHasReview(false); // Không có review
        }
      } else {
        setHasReview(false); // Nếu xảy ra lỗi, giả định không có review
      }
    } catch (error) {
      setHasReview(false);
    }
  };

  // Gọi hàm kiểm tra review khi component được mount
  useEffect(() => {
    checkExistingReview();
  }, [productId]);

  const handleSubmit = async () => {
    if (rating > 0 && comment.trim() !== "") {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/reviews`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${await SecureStore.getItemAsync(
                "cosmetic_access_token"
              )}`,
            },
            body: JSON.stringify({
              product: productId,
              rating, // Số sao
              comment, // Nhận xét
            }),
          }
        );
        if (response.ok) {
          Alert.alert("Thành công", "Đánh giá của bạn đã được gửi!");
          const data = await response.json();

          setRating(data.rating);
          setComment(data.comment);
          setReviewId(data.id);
          setHasReview(true); // Đánh dấu đã gửi thành công
        } else {
          const errorData = await response.json();
          Alert.alert("Lỗi", `Gửi đánh giá thất bại: ${errorData.message}`);
        }
      } catch (error) {
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi đánh giá");
      }
    } else {
      alert("Vui lòng đánh giá và nhập nhận xét của bạn!");
    }
  };

  return (
    <View className="p-5 items-center bg-gray-100 rounded-lg">
      <Text className="text-lg font-semibold mb-2">Đánh giá sản phẩm:</Text>
      <Rating
        onFinishRating={setRating}
        startingValue={rating}
        style={{ paddingVertical: 10 }}
        readonly={hasReview} // Không cho phép thay đổi khi đã gửi đánh giá
      />
      {hasReview ? (
        <ReviewDisplay
          comment={comment}
          onDelete={handleDeleteConfirmation} // Truyền hàm xóa vào
        />
      ) : (
        <>
          <Text className="text-md mt-2">Bạn đã đánh giá: {rating} sao</Text>
          <TextInput
            className="h-24 w-full border border-gray-400 rounded p-2 mt-2 mb-2"
            placeholder="Nhập nhận xét của bạn"
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <Button title="Gửi Đánh Giá" onPress={handleSubmit} />
        </>
      )}
    </View>
  );
};

export default RatingComponent;
