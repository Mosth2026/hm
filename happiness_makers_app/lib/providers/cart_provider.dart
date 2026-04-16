import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/models/cart_item_model.dart';
import '../data/models/product_model.dart';
import '../data/models/coupon_model.dart';

/// Cart state
class CartState {
  final List<CartItemModel> items;
  final CouponModel? appliedCoupon;

  const CartState({
    this.items = const [],
    this.appliedCoupon,
  });

  /// Total before coupon
  double get totalPrice {
    return items.fold(0.0, (sum, item) => sum + item.lineTotal);
  }

  /// Total after coupon discount
  double get discountedTotal {
    if (appliedCoupon == null) return totalPrice;
    final discount = appliedCoupon!.calculateDiscount(totalPrice);
    return (totalPrice - discount).clamp(0, double.infinity);
  }

  /// Coupon discount amount
  double get discountAmount {
    if (appliedCoupon == null) return 0;
    return appliedCoupon!.calculateDiscount(totalPrice);
  }

  /// Total item count
  int get itemCount {
    return items.fold(0, (sum, item) => sum + item.quantity);
  }

  /// Is empty
  bool get isEmpty => items.isEmpty;

  CartState copyWith({
    List<CartItemModel>? items,
    CouponModel? appliedCoupon,
    bool clearCoupon = false,
  }) {
    return CartState(
      items: items ?? this.items,
      appliedCoupon: clearCoupon ? null : (appliedCoupon ?? this.appliedCoupon),
    );
  }
}

/// Cart notifier with persistence
class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(const CartState()) {
    _loadFromStorage();
  }

  static const _storageKey = 'happiness_makers_cart_v1';

  /// Load cart from SharedPreferences
  Future<void> _loadFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cartJson = prefs.getString(_storageKey);
      if (cartJson != null) {
        final data = jsonDecode(cartJson) as Map<String, dynamic>;
        final items = (data['items'] as List<dynamic>?)
                ?.map((item) =>
                    CartItemModel.fromJson(item as Map<String, dynamic>))
                .toList() ??
            [];
        state = CartState(items: items);
      }
    } catch (_) {
      // Start with empty cart on error
    }
  }

  /// Save cart to SharedPreferences
  Future<void> _saveToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final data = {
        'items': state.items.map((item) => item.toJson()).toList(),
      };
      await prefs.setString(_storageKey, jsonEncode(data));
    } catch (_) {}
  }

  /// Add item to cart
  void addItem(ProductModel product, {int quantity = 1}) {
    final safeQuantity = quantity.clamp(1, 99);
    final currentItems = List<CartItemModel>.from(state.items);
    final existingIndex =
        currentItems.indexWhere((item) => item.product.id == product.id);

    if (existingIndex >= 0) {
      currentItems[existingIndex] = currentItems[existingIndex].copyWith(
        quantity: currentItems[existingIndex].quantity + safeQuantity,
      );
    } else {
      currentItems.add(CartItemModel(product: product, quantity: safeQuantity));
    }

    state = state.copyWith(items: currentItems);
    _saveToStorage();
  }

  /// Remove item from cart
  void removeItem(int productId) {
    final updated =
        state.items.where((item) => item.product.id != productId).toList();
    state = state.copyWith(items: updated);
    _saveToStorage();
  }

  /// Update item quantity
  void updateQuantity(int productId, int quantity) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    final currentItems = List<CartItemModel>.from(state.items);
    final index =
        currentItems.indexWhere((item) => item.product.id == productId);

    if (index >= 0) {
      currentItems[index] = currentItems[index].copyWith(quantity: quantity);
      state = state.copyWith(items: currentItems);
      _saveToStorage();
    }
  }

  /// Apply coupon
  void applyCoupon(CouponModel coupon) {
    state = state.copyWith(appliedCoupon: coupon);
  }

  /// Remove coupon
  void removeCoupon() {
    state = state.copyWith(clearCoupon: true);
  }

  /// Clear cart
  void clearCart() {
    state = const CartState();
    _saveToStorage();
  }
}

/// Cart provider
final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});
