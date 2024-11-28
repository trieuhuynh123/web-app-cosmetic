import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'product_page.dart'; // Trang quản lý sản phẩm
import 'order_page.dart'; // Trang quản lý đơn hàng

class AdminPage extends StatefulWidget {
  const AdminPage({super.key});

  @override
  State<AdminPage> createState() => _AdminPageState();
}

class _AdminPageState extends State<AdminPage> {
  int _selectedIndex = 0; // Mục được chọn trong Sidebar

  // Danh sách các trang được hiển thị
  final List<Widget> _pages = [
    ProductPage(), // Trang quản lý sản phẩm
    OrderPage(), // Trang quản lý đơn hàng
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Admin Dashboard'),
      ),
      body: Row(
        children: [
          // Sidebar (NavigationRail)
          NavigationRail(
            selectedIndex: _selectedIndex,
            onDestinationSelected: (int index) {
              setState(() {
                _selectedIndex = index;
              });
            },
            labelType: NavigationRailLabelType.all, // Hiển thị label
            destinations: [
              NavigationRailDestination(
                icon: Icon(Icons.shopping_bag),
                label: Text('Quản lý sản phẩm'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.list_alt),
                label: Text('Quản lý đơn hàng'),
              ),
            ],
          ),

          // Nội dung hiển thị
          Expanded(
            child: _pages[_selectedIndex],
          ),
        ],
      ),
    );
  }
}
