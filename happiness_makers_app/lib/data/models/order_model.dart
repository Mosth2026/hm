/// Order model matching Supabase orders table
class OrderModel {
  final int id;
  final String customerName;
  final String customerPhone;
  final String customerAddress;
  final String customerNotes;
  final double totalPrice;
  final String status;
  final String? processedBy;
  final String? couponCode;
  final double discountAmount;
  final String? userId;
  final String? trackingCode;
  final int? branchId;
  final DateTime? createdAt;
  final List<OrderItemModel> items;

  const OrderModel({
    required this.id,
    required this.customerName,
    required this.customerPhone,
    this.customerAddress = '',
    this.customerNotes = '',
    required this.totalPrice,
    this.status = 'pending',
    this.processedBy,
    this.couponCode,
    this.discountAmount = 0,
    this.userId,
    this.trackingCode,
    this.branchId,
    this.createdAt,
    this.items = const [],
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final itemsList = json['order_items'] as List<dynamic>? ?? [];
    return OrderModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      customerName: json['customer_name']?.toString() ?? '',
      customerPhone: json['customer_phone']?.toString() ?? '',
      customerAddress: json['customer_address']?.toString() ?? '',
      customerNotes: json['customer_notes']?.toString() ?? '',
      totalPrice: (json['total_price'] as num?)?.toDouble() ?? 0.0,
      status: json['status']?.toString() ?? 'pending',
      processedBy: json['processed_by'] as String?,
      couponCode: json['coupon_code'] as String?,
      discountAmount: (json['discount_amount'] as num?)?.toDouble() ?? 0.0,
      userId: json['user_id'] as String?,
      trackingCode: json['tracking_code'] as String?,
      branchId: (json['branch_id'] as num?)?.toInt(),
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
      items: itemsList
          .map((item) => OrderItemModel.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toInsertJson() => {
        'customer_name': customerName,
        'customer_phone': customerPhone,
        'customer_address': customerAddress,
        'customer_notes': customerNotes,
        'total_price': (totalPrice * 100).round() / 100,
        'coupon_code': couponCode ?? '',
        'discount_amount': (discountAmount * 100).round() / 100,
        'status': status,
        'user_id': userId,
      };
}

/// Order item model matching Supabase order_items table
class OrderItemModel {
  final int? id;
  final int? orderId;
  final int? productId;
  final String productName;
  final int quantity;
  final double price;
  final DateTime? createdAt;

  const OrderItemModel({
    this.id,
    this.orderId,
    this.productId,
    required this.productName,
    required this.quantity,
    required this.price,
    this.createdAt,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: (json['id'] as num?)?.toInt(),
      orderId: (json['order_id'] as num?)?.toInt(),
      productId: (json['product_id'] as num?)?.toInt(),
      productName: json['product_name']?.toString() ?? '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }

  Map<String, dynamic> toInsertJson(int orderId) => {
        'order_id': orderId,
        'product_id': productId,
        'product_name': productName,
        'quantity': quantity,
        'price': price,
      };
}
