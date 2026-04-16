import '../datasources/supabase_service.dart';
import '../models/order_model.dart';

/// Repository for order operations
class OrderRepository {
  /// Place a new order (saves to Supabase)
  Future<({bool success, int? orderId, String? trackingCode, String? error})>
      placeOrder({
    required String customerName,
    required String customerPhone,
    String customerAddress = 'طلب عبر التطبيق',
    String customerNotes = '',
    required double totalPrice,
    required List<OrderItemModel> items,
    String couponCode = '',
    double discountAmount = 0,
    String? userId,
  }) async {
    try {
      final roundedTotal = (totalPrice * 100).round() / 100;
      final roundedDiscount = (discountAmount * 100).round() / 100;

      // 1. Insert order
      final orderResponse = await SupabaseService.from('orders')
          .insert({
            'customer_name': customerName,
            'customer_phone': customerPhone,
            'customer_address': customerAddress,
            'customer_notes': customerNotes,
            'total_price': roundedTotal,
            'coupon_code': couponCode,
            'discount_amount': roundedDiscount,
            'status': 'pending',
            'user_id': userId,
          })
          .select('*, tracking_code');

      if ((orderResponse as List).isEmpty) {
        return (
          success: false,
          orderId: null,
          trackingCode: null,
          error: 'لم يتم إرجاع بيانات الطلب',
        );
      }

      final order = orderResponse[0];
      final orderId = (order['id'] as num).toInt();
      final trackingCode = order['tracking_code'] as String?;

      // 2. Insert order items
      if (items.isNotEmpty) {
        final orderItems = items.map((item) => item.toInsertJson(orderId)).toList();
        await SupabaseService.from('order_items').insert(orderItems);
      }

      return (
        success: true,
        orderId: orderId,
        trackingCode: trackingCode,
        error: null,
      );
    } catch (e) {
      // Fallback: try minimal insert
      try {
        final fallback = await SupabaseService.from('orders')
            .insert({
              'customer_name': '$customerName (فشل تقني)',
              'customer_phone': customerPhone,
              'customer_address': customerAddress,
              'total_price': (totalPrice * 100).round() / 100,
              'status': 'pending',
            })
            .select();

        if ((fallback as List).isNotEmpty) {
          return (
            success: true,
            orderId: (fallback[0]['id'] as num).toInt(),
            trackingCode: null,
            error: null,
          );
        }
      } catch (_) {}

      return (
        success: false,
        orderId: null,
        trackingCode: null,
        error: e.toString(),
      );
    }
  }

  /// Get orders for the current user
  Future<List<OrderModel>> getMyOrders(String userId) async {
    final response = await SupabaseService.from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .order('created_at', ascending: false);

    return (response as List<dynamic>)
        .map((json) => OrderModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Track order by ID
  Future<OrderModel?> getOrder(int orderId) async {
    try {
      final response = await SupabaseService.from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single();

      return OrderModel.fromJson(response);
    } catch (_) {
      return null;
    }
  }

  /// Track order by tracking code
  Future<OrderModel?> getOrderByTrackingCode(String trackingCode) async {
    try {
      final response = await SupabaseService.from('orders')
          .select('*, order_items(*)')
          .eq('tracking_code', trackingCode)
          .single();

      return OrderModel.fromJson(response);
    } catch (_) {
      return null;
    }
  }
}
