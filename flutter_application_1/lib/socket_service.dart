import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart'; // Import thư viện thông báo

class SocketService {
  static final SocketService _singleton = SocketService._internal();
  late IO.Socket socket;
  late FlutterLocalNotificationsPlugin
      flutterLocalNotificationsPlugin; // Thêm plugin thông báo

  factory SocketService() {
    return _singleton;
  }

  SocketService._internal() {
    socket = IO.io('${dotenv.env['API_URL']}', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    // Khởi tạo plugin thông báo
    flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('app_icon'); // Icon cho thông báo

    final InitializationSettings initializationSettings =
        InitializationSettings(
      android: initializationSettingsAndroid,
    );

    flutterLocalNotificationsPlugin.initialize(initializationSettings);

    // Lắng nghe sự kiện kết nối
    socket.on('connect', (_) {
      print('Kết nối Socket.IO thành công');
    });

    // Lắng nghe sự kiện "orderCreated" khi có đơn hàng mới
    socket.on('orderCreated', (_) {
      print('Đã có đơn hàng mới!');
    });

    // Lắng nghe sự kiện "order_updated" khi trạng thái đơn hàng thay đổi
  }

  void connect() {
    socket.connect();
  }

  void disconnect() {
    socket.disconnect();
  }

  // Phương thức để lắng nghe sự kiện đơn hàng mới
  void listenForNewOrder(Function callback) {
    socket.on('orderCreated', (data) {
      callback(data); // Gọi callback khi có đơn hàng mới
      _sendNotification('Đơn hàng mới', 'Có một đơn hàng mới được tạo.');
    });
  }

  // Phương thức gửi thông báo
  Future<void> _sendNotification(String title, String body) async {
    const AndroidNotificationDetails androidNotificationDetails =
        AndroidNotificationDetails(
      'Admin', // ID của channel
      'Đơn hàng', // Tên channel
      importance: Importance.max,
      priority: Priority.high,
    );

    const NotificationDetails notificationDetails =
        NotificationDetails(android: androidNotificationDetails);

    // Hiển thị thông báo
    await flutterLocalNotificationsPlugin.show(
      0, // ID thông báo
      title,
      body,
      notificationDetails,
    );
  }
}
