import { ProductItem } from "@/components/ProductItem";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";

interface Category {
  id: string;
  name: string;
}
interface Brand {
  id: string;
  name: string;
}
interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
}
const SearchPage = () => {
  const { name, categoryId, brandId } = useLocalSearchParams<{
    name: string;
    brandId?: string;
    categoryId?: string;
  }>();
  const [searchText, setSearchText] = useState<string>(name);
  const [products, setProducts] = useState<Product[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isBrandModalVisible, setBrandModalVisible] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/categories`
        );
        const data = await response.json();
        setCategories([{ id: "all", name: "Tất cả" }, ...data]);
      } catch (error) {
        console.log(error);
      }
    };
    const fetchBrands = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/brands`
        );
        const data = await response.json();
        setBrands([{ id: "all", name: "Tất cả" }, ...data]);
      } catch (error) {
        console.log(error);
      }
    };
    const fetchHotProducts = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/products/top-sold`
        );
        const data = await response.json();
        setHotProducts(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchHotProducts();
    fetchBrands();
    fetchCategories();
  }, []);

  const loadMoreProducts = async () => {
    if (loading || !hasMore) return; // Tránh gọi nhiều lần khi đang tải
    setLoading(true);

    try {
      // Gọi hàm search với offset và limit
      const newProducts = await search(offset + 1, limit);

      if (newProducts[0]?.id) {
        setProducts((prevProducts) => [...prevProducts, ...newProducts]);
        setOffset(offset + 1);
      } else {
        setHasMore(false);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false); // Đảm bảo setLoading là false trong trường hợp lỗi
    }
  };

  const search = async (offset: number, limit: number) => {
    try {
      const baseUrl = `${process.env.EXPO_PUBLIC_API_URL}/products/search`;

      const categoryIdParam =
        categoryId && categoryId !== "all" ? `categoryId=${categoryId}` : "";

      const brandIdParam =
        brandId && brandId !== "all" ? `brandId=${brandId}` : "";

      const nameParam = searchText
        ? `name=${encodeURIComponent(searchText)}`
        : "";

      const offsetParam = `offset=${offset}`;
      const limitParam = `limit=${limit}`;

      const queryParams = [
        categoryIdParam,
        brandIdParam,
        nameParam,
        offsetParam,
        limitParam,
      ]
        .filter((param) => param) // Loại bỏ các chuỗi rỗng
        .join("&");

      const url = `${baseUrl}${queryParams ? `?${queryParams}` : ""}`;
      const response = await fetch(url, {
        method: "GET",
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const initialProducts = await search(0, limit);
        setOffset(0);
        setHasMore(true);
        setProducts(initialProducts);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProducts(); // Gọi hàm bên trong useEffect
  }, [name, categoryId, brandId]); // Chạy lại khi name, categoryId, hoặc brandId thay đổi

  const submit = () => {
    const categoryIdParam = categoryId ? `categoryId=${categoryId}` : "";

    const brandIdParam = brandId ? `brandId=${brandId}` : "";

    const nameParam = searchText
      ? `name=${encodeURIComponent(searchText)}`
      : "";

    const queryParams = [categoryIdParam, brandIdParam, nameParam]
      .filter((param) => param) // Loại bỏ các chuỗi rỗng
      .join("&"); // Kết nối các tham số với dấu `&`

    router.navigate(`../search?${queryParams}`);
  };

  // Hàm xử lý khi chọn thương hiệu
  const handleSelectBrand = (brand: Brand) => {
    const categoryIdParam = categoryId ? `categoryId=${categoryId}` : "";

    const brandIdParam = `brandId=${brand.id}`;

    const nameParam = searchText
      ? `name=${encodeURIComponent(searchText)}`
      : "";

    const queryParams = [categoryIdParam, brandIdParam, nameParam]
      .filter((param) => param) // Loại bỏ các chuỗi rỗng
      .join("&"); // Kết nối các tham số với dấu `&`
    setBrandModalVisible(false);
    router.navigate(`../search?${queryParams}`);
  };

  // Hàm xử lý khi chọn danh mục
  const handleSelectCategory = (category: Category) => {
    const categoryIdParam = `categoryId=${category.id}`;

    const brandIdParam = brandId ? `brandId=${brandId}` : "";

    const nameParam = searchText
      ? `name=${encodeURIComponent(searchText)}`
      : "";

    const queryParams = [categoryIdParam, brandIdParam, nameParam]
      .filter((param) => param) // Loại bỏ các chuỗi rỗng
      .join("&"); // Kết nối các tham số với dấu `&`
    setCategoryModalVisible(false);
    router.navigate(`../search?${queryParams}`);
  };

  return (
    <View className="p-5">
      {/* Thanh tìm kiếm */}
      <TextInput
        placeholder="Tìm kiếm sản phẩm..."
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={submit}
        returnKeyType="search"
        className="border border-gray-300 rounded-lg p-3 bg-gray-100 mb-2"
      />

      <View className="flex-row justify-between">
        {/* Nút chọn thương hiệu */}
        <TouchableOpacity
          onPress={() => setBrandModalVisible(true)}
          className="border border-gray-300 rounded-lg p-3 bg-gray-100 flex-1 mr-2"
        >
          <Text className="text-center">
            {(() => {
              const brand = brands.find((brand) => brand.id === brandId);
              return brand ? brand.name : "Chọn thương hiệu";
            })()}
          </Text>
        </TouchableOpacity>

        {/* Nút chọn danh mục */}
        <TouchableOpacity
          onPress={() => setCategoryModalVisible(true)}
          className="border border-gray-300 rounded-lg p-3 bg-gray-100 flex-1" // Sử dụng flex-1 để nút chiếm không gian
        >
          <Text className="text-center">
            {(() => {
              const category = categories.find(
                (category) => category.id === categoryId
              );
              return category ? category.name : "Chọn danh mục";
            })()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal chọn thương hiệu */}
      <Modal
        visible={isBrandModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-lg h-64">
            <Text className="mb-3">Chọn thương hiệu</Text>
            <FlatList
              data={brands}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectBrand(item)}>
                  <Text className="p-3">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setBrandModalVisible(false)}
              className="mt-5"
            >
              <Text className="text-red-500">Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal chọn danh mục */}
      <Modal
        visible={isCategoryModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-lg h-64">
            <Text className="mb-3">Chọn danh mục</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectCategory(item)}>
                  <Text className="p-3">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setCategoryModalVisible(false)}
              className="mt-5"
            >
              <Text className="text-red-500">Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row h-40"
      >
        {hotProducts.map((product, index) => (
          <TouchableOpacity
            key={index}
            className="mr-5 items-center"
            onPress={() => router.push(`../products/${product.id}`)}
          >
            <Image
              source={{
                uri: product.image,
              }}
              className="w-20 h-20 rounded-full"
            />
            <Text className="mt-2 text-sm">{product.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text className="text-xl font-bold mb-4">Kết quả tìm kiếm</Text>
      {products[0] ? (
        <FlatList
          data={products}
          numColumns={2}
          renderItem={({ item, index }) => (
            <View className="flex-1 p-2">
              <ProductItem
                key={index}
                id={item.id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 400 }}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={loadMoreProducts} // Tải thêm khi cuộn đến gần cuối
          onEndReachedThreshold={0.1} // Ngưỡng để gọi loadMoreProducts
          ListFooterComponent={loading ? <ActivityIndicator /> : null}
        />
      ) : (
        <Text className="text-center text-lg text-red-500">Không tìm thấy</Text>
      )}
    </View>
  );
};

export default SearchPage;
