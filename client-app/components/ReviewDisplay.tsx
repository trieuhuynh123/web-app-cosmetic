import React from "react";
import { View, Text, Button } from "react-native";

interface ReviewDisplayProps {
  rating: number;
  comment: string;
  onDelete: () => void;
}

const ReviewDisplay = ({ rating, comment, onDelete }: ReviewDisplayProps) => {
  return (
    <View className="mt-4 p-4 bg-white rounded shadow">
      <Text className="text-lg font-bold">Đánh giá của bạn:</Text>
      <Text className="text-md">Sao: {rating}</Text>
      <Text className="text-md">Nhận xét: {comment}</Text>
      <Button title="Xóa Đánh Giá" onPress={onDelete} color="#ff4d4d" />
    </View>
  );
};

export default ReviewDisplay;
