import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/constants/app_constants.dart';
import '../../providers/orders_provider.dart';

class OrderTrackingScreen extends ConsumerWidget {
  final int orderId;
  
  const OrderTrackingScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch a specific order detail if we want real-time, but here we can just fetch it or read from list initially.
    // Assuming we have a way to fetch order by id:
    final repo = ref.read(orderRepositoryProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('تتبع طلب #$orderId'),
      ),
      body: FutureBuilder(
        future: repo.getOrder(orderId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData || snapshot.data == null) {
            return Center(
              child: Text('عفواً، لا يمكن العثور على تفاصيل الطلب', style: AppTypography.titleMedium),
            );
          }

          final order = snapshot.data!;
          final statusColors = AppConstants.orderStatusColors;
          final colorObj = statusColors[order.status] ?? 0xFF9CA3AF;
          final color = Color(colorObj);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Status Header
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: color.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      Icon(Iconsax.box, color: color, size: 32),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('حالة الطلب', style: AppTypography.labelMedium.copyWith(color: AppColors.textSecondary)),
                          Text(
                            AppConstants.orderStatuses[order.status] ?? order.status,
                            style: AppTypography.headlineMedium.copyWith(color: color),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // Items List
                Text('المنتجات (${order.items.length})', style: AppTypography.headlineSmall),
                const SizedBox(height: 16),
                
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: order.items.length,
                    separatorBuilder: (c, i) => const Divider(height: 1),
                    itemBuilder: (c, i) {
                      final item = order.items[i];
                      return ListTile(
                        title: Text(item.productName, style: AppTypography.titleMedium),
                        subtitle: Text('${item.quantity} قطعة', style: AppTypography.bodySmall),
                        trailing: Text('${item.price * item.quantity} ج.م', style: AppTypography.titleMedium.copyWith(color: AppColors.primary)),
                      );
                    },
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Summary Calculation
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('إجمالي المنتجات', style: AppTypography.bodyMedium),
                          Text('${order.totalPrice + order.discountAmount} ج.م', style: AppTypography.bodyMedium),
                        ],
                      ),
                      if (order.discountAmount > 0) ...[
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('الخصم', style: AppTypography.bodyMedium.copyWith(color: AppColors.success)),
                            Text('- ${order.discountAmount} ج.م', style: AppTypography.bodyMedium.copyWith(color: AppColors.success)),
                          ],
                        ),
                      ],
                      const Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('الإجمالي المطلوب', style: AppTypography.headlineSmall),
                          Text('${order.totalPrice} ج.م', style: AppTypography.headlineSmall.copyWith(color: AppColors.primary)),
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
    );
  }
}
