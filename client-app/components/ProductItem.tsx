import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, Image, Text, StyleSheet } from "react-native";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
}
export function ProductItem({ id, name, image, price }: Product) {
  return (
    <TouchableOpacity
      className="mb-5 border border-gray-200 rounded-lg p-3 items-center"
      onPress={() => router.push(`../products/${id}`)}
    >
      <Image
        source={{
          uri: image,
        }}
        className="w-24 h-24 rounded-lg"
      />
      <Text className="mt-3 font-bold text-center">{name}</Text>
      <Text className="mt-1 text-red-500 text-sm">{price}</Text>
    </TouchableOpacity>
  );
}
