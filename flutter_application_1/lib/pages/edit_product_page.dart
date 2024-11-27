import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class EditProductPage extends StatefulWidget {
  final dynamic product; // Sản phẩm cần chỉnh sửa

  const EditProductPage({super.key, required this.product});

  @override
  _EditProductPageState createState() => _EditProductPageState();
}

class _EditProductPageState extends State<EditProductPage> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _imageController = TextEditingController();
  String? _categoryId; // ID của category đã chọn
  String? _brandId; // ID của brand đã chọn
  bool _isLoading = false;
  String _errorMessage = '';
  List<dynamic> _categories = [];
  List<dynamic> _brands = [];

  @override
  void initState() {
    super.initState();
    _nameController.text = widget.product['name'];
    _priceController.text = widget.product['price'].toString();
    _descriptionController.text = widget.product['description'] ?? '';
    _imageController.text = widget.product['image'];
    _categoryId = widget.product['category']['id'];
    _brandId = widget.product['brand']['id'];

    // Load categories and brands when editing
    _loadCategories();
    _loadBrands();
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

  // Cập nhật thông tin sản phẩm
  Future<void> _updateProduct() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    if (double.tryParse(_priceController.text) == null ||
        double.parse(_priceController.text) <= 0) {
      setState(() {
        _errorMessage = 'Price must be greater than 0';
      });
      setState(() {
        _isLoading = false;
      });
      return;
    }

    try {
      final response = await http.patch(
        Uri.parse("${dotenv.env['API_URL']}/products/${widget.product['id']}"),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': _nameController.text,
          'price': double.parse(_priceController.text),
          'description': _descriptionController.text,
          'category': _categoryId,
          'brand': _brandId,
          'image': _imageController.text,
        }),
      );

      if (response.statusCode == 200) {
        // Cập nhật thành công
        Navigator.pop(context, true);
      } else {
        setState(() {
          _errorMessage = 'Failed to update product';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error updating product: $e';
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
      appBar: AppBar(title: Text('Edit Product')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Tên sản phẩm
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Product Name',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 10),

            // Giá sản phẩm
            TextField(
              controller: _priceController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Price',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 10),

            // Mô tả sản phẩm
            TextField(
              controller: _descriptionController,
              decoration: InputDecoration(
                labelText: 'Description',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            SizedBox(height: 10),

            // Chọn category
            DropdownButton<String?>(
              value: _categoryId,
              hint: Text('Select Category'),
              onChanged: (String? newValue) {
                setState(() {
                  _categoryId = newValue;
                });
              },
              items: [
                ..._categories.map<DropdownMenuItem<String?>>((category) {
                  return DropdownMenuItem<String?>(
                    value: category['id'],
                    child: Text(category['name']),
                  );
                }).toList(),
              ],
            ),
            SizedBox(height: 10),

            // Chọn brand
            DropdownButton<String?>(
              value: _brandId,
              hint: Text('Select Brand'),
              onChanged: (String? newValue) {
                setState(() {
                  _brandId = newValue;
                });
              },
              items: [
                ..._brands.map<DropdownMenuItem<String?>>((brand) {
                  return DropdownMenuItem<String?>(
                    value: brand['id'],
                    child: Text(brand['name']),
                  );
                }).toList(),
              ],
            ),
            SizedBox(height: 10),

            // Link image
            TextField(
              controller: _imageController,
              decoration: InputDecoration(
                labelText: 'Image URL',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 10),

            // Nút lưu cập nhật
            ElevatedButton(
              onPressed: _isLoading ? null : _updateProduct,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('Update Product'),
            ),

            // Hiển thị thông báo lỗi nếu có
            if (_errorMessage.isNotEmpty) ...[
              SizedBox(height: 10),
              Text(_errorMessage, style: TextStyle(color: Colors.red)),
            ],
          ],
        ),
      ),
    );
  }
}
