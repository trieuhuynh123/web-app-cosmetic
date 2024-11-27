import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class OrderPage extends StatefulWidget {
  const OrderPage({super.key});

  @override
  State<OrderPage> createState() => _OrderPageState();
}

class _OrderPageState extends State<OrderPage> {
  String _selectedStatus = 'new'; // Default status is 'new'
  Map<String, dynamic> _ordersData = {}; // Data fetched from API

  // Fetch orders from the API
  Future<void> _fetchOrders() async {
    try {
      final response =
          await http.get(Uri.parse("${dotenv.env['API_URL']}/orders/admin"));
      if (response.statusCode == 200) {
        setState(() {
          _ordersData = json.decode(response.body); // Store data in _ordersData
        });
      } else {
        throw Exception('Failed to load orders');
      }
    } catch (e) {
      print('Error fetching orders: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    _fetchOrders(); // Fetch orders when the page loads
  }

  @override
  Widget build(BuildContext context) {
    // Get the orders for the selected status
    final orders = _ordersData.containsKey(_selectedStatus)
        ? _ordersData[_selectedStatus]['orders'] ?? []
        : [];

    return Scaffold(
      appBar: AppBar(
        title: Text('Quản lý Đơn hàng'),
      ),
      body: Column(
        children: [
          // Status selection buttons (New, Shipping, Delivered)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _statusButton('New'),
              _statusButton('Shipping'),
              _statusButton('Delivered'),
            ],
          ),
          Expanded(
            child: _ordersData.isEmpty
                ? Center(
                    child:
                        CircularProgressIndicator()) // Show loading if no data
                : ListView.builder(
                    itemCount: orders.length,
                    itemBuilder: (context, index) {
                      final order = orders[index];
                      return OrderCard(
                        order: order,
                        refreshOrders:
                            _fetchOrders, // Pass the refresh callback
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  // Widget for the status selection buttons
  Widget _statusButton(String status) {
    return ElevatedButton(
      onPressed: () {
        setState(() {
          _selectedStatus = status.toLowerCase(); // Update selected status
        });
      },
      child: Text(status),
    );
  }
}

class OrderCard extends StatelessWidget {
  final Map<String, dynamic> order;
  final Future<void> Function()
      refreshOrders; // The callback function to refresh orders

  const OrderCard(
      {super.key, required this.order, required this.refreshOrders});

  // Format the date and convert it to a readable string
  String _formatDate(DateTime createDate) {
    DateTime localCreateDate = createDate.toLocal();
    return '${localCreateDate.day}/${localCreateDate.month}/${localCreateDate.year} ${localCreateDate.hour}:${localCreateDate.minute.toString().padLeft(2, '0')}';
  }

  // Handle the API request to change the order status
  Future<void> _changeOrderStatus(
      BuildContext context, String orderId, String newStatus) async {
    try {
      final response = await http.patch(
        Uri.parse("${dotenv.env['API_URL']}/orders/$orderId"),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'status': newStatus, // Change the order status
        }),
      );

      if (response.statusCode == 200) {
        // On success, show a success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Order has been moved to $newStatus.')),
        );
        // Call the callback function to refresh the orders
        refreshOrders();
      } else {
        // Handle failure
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update order status.')),
        );
      }
    } catch (e) {
      // Handle any errors during the request
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    DateTime createDate = DateTime.parse(order['createDate']);
    String formattedDate = _formatDate(createDate);

    return Card(
      margin: EdgeInsets.all(10),
      child: Padding(
        padding: EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Ngày tạo: $formattedDate'),
            Text('Địa chỉ giao: ${order['address']}'),
            Text('Tổng tiền: ${order['totalAmount']} VND'),
            SizedBox(height: 10),
            Text('Chi tiết đơn hàng:'),
            Column(
              children: order['orderDetails']
                  .map<Widget>((detail) => ListTile(
                        leading: Image.network(detail['product']['image']),
                        title: Text(detail['product']['name']),
                        subtitle: Text('Số lượng: ${detail['quantity']}'),
                      ))
                  .toList(),
            ),
            SizedBox(height: 10),
            // Show the button to change the order status if it's "new"
            if (order['status'] == 'new')
              ElevatedButton(
                onPressed: () =>
                    _changeOrderStatus(context, order['id'], 'shipping'),
                child: Text('Confirm Shipping'),
              ),
            // Optional: You can add a button for "Delivered" status as well
            if (order['status'] == 'shipping')
              ElevatedButton(
                onPressed: () =>
                    _changeOrderStatus(context, order['id'], 'delivered'),
                child: Text('Mark as Delivered'),
              ),
          ],
        ),
      ),
    );
  }
}
