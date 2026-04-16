import '../datasources/supabase_service.dart';
import '../models/coupon_model.dart';

/// Repository for coupon operations
class CouponRepository {
  /// Validate and fetch a coupon by code
  Future<CouponModel?> validateCoupon(String code) async {
    try {
      final response = await SupabaseService.from('coupons')
          .select()
          .eq('code', code.trim().toUpperCase())
          .eq('is_active', true)
          .single();

      final coupon = CouponModel.fromJson(response);
      return coupon.isValid ? coupon : null;
    } catch (_) {
      return null;
    }
  }
}
