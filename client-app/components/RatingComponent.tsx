import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";

import { Rating } from "react-native-ratings";
import ReviewDisplay from "./ReviewDisplay";
const RatingComponent = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0 && comment.trim() !== "") {
      setSubmitted(true);
    } else {
      alert("Vui lòng đánh giá và nhập nhận xét của bạn!");
    }
  };

  const handleDelete = () => {
    setRating(0);
    setComment("");
    setSubmitted(false);
  };
  return (
    <View className="p-5 items-center bg-gray-100 rounded-lg">
      <Text className="text-lg font-semibold mb-2">Đánh giá sản phẩm:</Text>
      <Rating
        showRating
        onFinishRating={setRating}
        startingValue={rating}
        style={{ paddingVertical: 10 }}
        readonly={submitted} // Không cho phép thay đổi khi đã gửi đánh giá
      />
      {submitted ? (
        <ReviewDisplay
          rating={rating}
          comment={comment}
          onDelete={handleDelete} // Truyền hàm xóa vào
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
