import React from "react";
import { View, Text, Button } from "react-native";

interface ReviewDisplayProps {
  comment: string;
  onDelete: () => void;
}

const ReviewDisplay = ({ comment, onDelete }: ReviewDisplayProps) => {
  return (
    <View className="mt-4 p-4 bg-white rounded shadow">
      <Text className="text-md">Nhận xét: {comment}</Text>
      <Button title="Xóa Đánh Giá" onPress={onDelete} color="#ff4d4d" />
    </View>
  );
};

export default ReviewDisplay;
