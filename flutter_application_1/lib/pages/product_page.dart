import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'add_product_page.dart';
import 'edit_product_page.dart';

class ProductPage extends StatefulWidget {
  const ProductPage({super.key});

  @override
  _ProductPageState createState() => _ProductPageState();
}

class _ProductPageState extends State<ProductPage> {
  List<dynamic> _products = []; // Danh sách sản phẩm
  List<dynamic> _categories = []; // Danh sách category
  List<dynamic> _brands = []; // Danh sách brand
  bool _isLoading = false;
  String _errorMessage = '';
  String? _categoryId; // ID của category đã chọn
  String? _brandId; // ID của brand đã chọn
  String _productName = ''; // Tên sản phẩm tìm kiếm

  @override
  void initState() {
    super.initState();
    _loadCategories(); // Tải danh sách category
    _loadBrands(); // Tải danh sách brand
    _loadProducts(); // Tải danh sách sản phẩm khi trang khởi tạo
  }

  // Tải danh sách categories từ API
  Future<void> _loadCategories() async {
    try {
      final response =
          await http.get(Uri.parse("${dotenv.env['API_URL']}/categories"));
      if (response.statusCode == 200) {
        setState(() {
          _categories = json.decode(response.body);
        });
      } else {
        setState(() {
          _errorMessage = 'Failed to load categories';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading categories: $e';
      });
    }
  }

  // Tải danh sách brands từ API
  Future<void> _loadBrands() async {
    try {
      final response =
          await http.get(Uri.parse("${dotenv.env['API_URL']}/brands"));
      if (response.statusCode == 200) {
        setState(() {
          _brands = json.decode(response.body);
        });
      } else {
        setState(() {
          _errorMessage = 'Failed to load brands';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading brands: $e';
      });
    }
  }

  // Tải sản phẩm dựa trên các tham số tìm kiếm
  Future<void> _loadProducts() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    // Xây dựng URL động
    String url = "${dotenv.env['API_URL']}/products?name=$_productName";
    if (_categoryId != null) {
      url += "&categoryId=$_categoryId";
    }
    if (_brandId != null) {
      url += "&brandId=$_brandId";
    }

    try {
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        setState(() {
          _products = json.decode(response.body);
        });
      } else {
        setState(() {
          _errorMessage = 'Failed to load products';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading products: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Product Management')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Thanh tìm kiếm
            TextField(
              decoration: InputDecoration(
                labelText: 'Search by name',
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                setState(() {
                  _productName = value;
                });
              },
            ),
            SizedBox(height: 10),

            // Dropdown for Category
            DropdownButton<String?>(
              value: _categoryId,
              hint: Text('Select Category (All)'),
              onChanged: (String? newValue) {
                setState(() {
                  _categoryId = newValue;
                });
              },
              items: [
                DropdownMenuItem<String?>(
                  value: null,
                  child: Text('All Categories'),
                ),
                ..._categories.map<DropdownMenuItem<String?>>((category) {
                  return DropdownMenuItem<String?>(
                    value: category['id'],
                    child: Text(category['name']),
                  );
                }).toList(),
              ],
            ),
            SizedBox(height: 10),

            // Dropdown for Brand
            DropdownButton<String?>(
              value: _brandId,
              hint: Text('Select Brand (All)'),
              onChanged: (String? newValue) {
                setState(() {
                  _brandId = newValue;
                });
              },
              items: [
                DropdownMenuItem<String?>(
                  value: null,
                  child: Text('All Brands'),
                ),
                ..._brands.map<DropdownMenuItem<String?>>((brand) {
                  return DropdownMenuItem<String?>(
                    value: brand['id'],
                    child: Text(brand['name']),
                  );
                }).toList(),
              ],
            ),
            SizedBox(height: 20),

            // Nút tìm kiếm
            ElevatedButton(
              onPressed: _isLoading ? null : _loadProducts,
              child: _isLoading ? CircularProgressIndicator() : Text('Search'),
            ),

            // Hiển thị thông báo lỗi nếu có
            if (_errorMessage.isNotEmpty) ...[
              SizedBox(height: 10),
              Text(_errorMessage, style: TextStyle(color: Colors.red)),
            ],

            // Danh sách sản phẩm
            _isLoading
                ? Center(child: CircularProgressIndicator())
                : Expanded(
                    child: ListView.builder(
                      itemCount: _products.length,
                      itemBuilder: (context, index) {
                        final product = _products[index];
                        return ProductCard(
                          product: product,
                          reloadProducts: _loadProducts, // Truyền callback
                        );
                      },
                    ),
                  ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          // Điều hướng đến màn hình thêm sản phẩm
          bool? result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => AddProductPage(),
            ),
          );

          // Nếu có kết quả trả về là true, gọi lại hàm tải danh sách sản phẩm
          if (result == true) {
            _loadProducts();
          }
        },
        child: Icon(Icons.add),
      ),
    );
  }
}

class ProductCard extends StatelessWidget {
  final dynamic product;
  final VoidCallback reloadProducts;

  const ProductCard(
      {super.key, required this.product, required this.reloadProducts});

  Future<void> deleteProduct(String productId) async {
    final String apiUrl = '${dotenv.env['API_URL']}/products/$productId';

    try {
      final response = await http.delete(Uri.parse(apiUrl));

      if (response.statusCode == 200) {
        print('Product deleted successfully');
      } else {
        print('Failed to delete product. Status code: ${response.statusCode}');
      }
    } catch (error) {
      print('Error deleting product: $error');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(vertical: 8),
      child: ListTile(
        leading: Image.network(
          product['image'],
          width: 50,
          height: 50,
          fit: BoxFit.cover,
        ),
        title: Text(product['name']),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Price: \$${product['price']}'),
            Text('Category: ${product['category']['name']}'),
            Text('Brand: ${product['brand']['name']}'),
            Text('Sold: ${product['sold']}'),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: Icon(Icons.edit),
              onPressed: () async {
                // Chuyển đến trang chỉnh sửa sản phẩm và chờ kết quả trả về
                bool? result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => EditProductPage(product: product),
                  ),
                );

                // Nếu có kết quả trả về là true, gọi lại reloadProducts để tải lại danh sách sản phẩm
                if (result == true) {
                  reloadProducts();
                }
              },
            ),
            IconButton(
              icon: Icon(Icons.delete),
              color: Colors.red,
              onPressed: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (BuildContext context) {
                    return AlertDialog(
                      title: Text('Confirm Delete'),
                      content:
                          Text('Are you sure you want to delete this product?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(false),
                          child: Text('Cancel'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(true),
                          child: Text('Delete',
                              style: TextStyle(color: Colors.red)),
                        ),
                      ],
                    );
                  },
                );

                if (confirm == true) {
                  await deleteProduct(product['id']);
                  reloadProducts(); // Tải lại danh sách sản phẩm sau khi xóa
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
