/// Coupon model matching Supabase coupons table
class CouponModel {
  final int id;
  final String code;
  final String discountType; // 'percentage' or 'fixed'
  final double discountValue;
  final bool isActive;
  final int? usageLimit;
  final int usedCount;
  final DateTime? expiresAt;
  final DateTime? createdAt;

  const CouponModel({
    required this.id,
    required this.code,
    required this.discountType,
    required this.discountValue,
    this.isActive = true,
    this.usageLimit,
    this.usedCount = 0,
    this.expiresAt,
    this.createdAt,
  });

  /// Check if coupon is currently valid
  bool get isValid {
    if (!isActive) return false;
    if (expiresAt != null && expiresAt!.isBefore(DateTime.now())) return false;
    if (usageLimit != null && usedCount >= usageLimit!) return false;
    return true;
  }

  /// Calculate discount amount for a given total
  double calculateDiscount(double total) {
    if (discountType == 'percentage') {
      return total * discountValue / 100;
    } else {
      return discountValue.clamp(0, total);
    }
  }

  factory CouponModel.fromJson(Map<String, dynamic> json) {
    return CouponModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      code: json['code']?.toString() ?? '',
      discountType: json['discount_type']?.toString() ?? 'percentage',
      discountValue: (json['discount_value'] as num?)?.toDouble() ?? 0.0,
      isActive: json['is_active'] == true,
      usageLimit: (json['usage_limit'] as num?)?.toInt(),
      usedCount: (json['used_count'] as num?)?.toInt() ?? 0,
      expiresAt: json['expires_at'] != null
          ? DateTime.tryParse(json['expires_at'].toString())
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }
}
