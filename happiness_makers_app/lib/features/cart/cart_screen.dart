import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:iconsax/iconsax.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/cart_provider.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartProvider);
    final notifier = ref.read(cartProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('السلة'),
        actions: [
          if (!cartState.isEmpty)
            IconButton(
              icon: const Icon(Iconsax.trash, color: AppColors.error),
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('إفراغ السلة'),
                    content: const Text('هل أنت متأكد من مسح جميع المنتجات؟'),
                    actions: [
                      TextButton(
                        onPressed: () => context.pop(),
                        child: const Text('إلغاء'),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          notifier.clearCart();
                          context.pop();
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
                        child: const Text('مسح'),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
      body: cartState.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Iconsax.shopping_cart, size: 80, color: AppColors.textTertiary.withValues(alpha: 0.5)),
                  const SizedBox(height: 24),
                  Text('سلتك فارغة', style: AppTypography.headlineMedium),
                  const SizedBox(height: 12),
                  Text(
                    'تصفح منتجاتنا الفاخرة وأضف ما يعجبك',
                    style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: () => context.go('/'),
                    child: const Text('تسوق الآن'),
                  ),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: cartState.items.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final item = cartState.items[index];
                      return Container(
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.borderLight),
                        ),
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            // Image
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: CachedNetworkImage(
                                imageUrl: item.product.image,
                                width: 80,
                                height: 80,
                                fit: BoxFit.cover,
                              ),
                            ),
                            const SizedBox(width: 16),
                            
                            // Info
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.product.name,
                                    style: AppTypography.titleMedium,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    '${item.product.displayPrice} ج.م',
                                    style: AppTypography.priceSmall,
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      // Quantity controls
                                      Container(
                                        height: 36,
                                        decoration: BoxDecoration(
                                          color: AppColors.surfaceVariant,
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            IconButton(
                                              icon: const Icon(Iconsax.minus, size: 16),
                                              padding: EdgeInsets.zero,
                                              constraints: const BoxConstraints(minWidth: 36),
                                              onPressed: () => notifier.updateQuantity(item.product.id, item.quantity - 1),
                                            ),
                                            Text('${item.quantity}', style: AppTypography.titleMedium),
                                            IconButton(
                                              icon: const Icon(Iconsax.add, size: 16),
                                              padding: EdgeInsets.zero,
                                              constraints: const BoxConstraints(minWidth: 36),
                                              onPressed: () => notifier.updateQuantity(item.product.id, item.quantity + 1),
                                            ),
                                          ],
                                        ),
                                      ),
                                      
                                      // Total for this item
                                      Text(
                                        '${item.lineTotal} ج.م',
                                        style: AppTypography.titleLarge.copyWith(color: AppColors.primary),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                
                // Summary Bottom Sheet
                Container(
                  padding: EdgeInsets.only(
                    left: 20, 
                    right: 20, 
                    top: 24, 
                    bottom: 16 + MediaQuery.of(context).padding.bottom
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.shadow.withValues(alpha: 0.08),
                        blurRadius: 20,
                        offset: const Offset(0, -5),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('المجموع', style: AppTypography.titleMedium),
                          Text(
                            '${cartState.totalPrice} ج.م',
                            style: AppTypography.titleMedium,
                          ),
                        ],
                      ),
                      
                      if (cartState.appliedCoupon != null) ...[
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'الخصم (${cartState.appliedCoupon!.code})', 
                              style: AppTypography.titleMedium.copyWith(color: AppColors.success),
                            ),
                            Text(
                              '- ${cartState.discountAmount} ج.م',
                              style: AppTypography.titleMedium.copyWith(color: AppColors.success),
                            ),
                          ],
                        ),
                      ],
                      
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 16),
                      
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('الإجمالي', style: AppTypography.headlineMedium),
                          Text(
                            '${cartState.discountedTotal} ج.م',
                            style: AppTypography.displaySmall.copyWith(color: AppColors.primary, fontSize: 24),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 24),
                      
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => context.push('/checkout'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                          child: const Text('إتمام الطلب'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
