import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/constants/app_constants.dart';
import '../../providers/orders_provider.dart';

class MyOrdersScreen extends ConsumerWidget {
  const MyOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(myOrdersProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('طلباتي السابقة'),
      ),
      body: ordersAsync.when(
        data: (orders) {
          if (orders.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Iconsax.receipt_2, size: 80, color: AppColors.textTertiary.withValues(alpha: 0.5)),
                  const SizedBox(height: 24),
                  Text('لا توجد طلبات سابقة', style: AppTypography.headlineMedium),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => context.go('/'),
                    child: const Text('ابدأ التسوق'),
                  ),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: orders.length,
            separatorBuilder: (context, index) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final order = orders[index];
              final dateStr = order.createdAt != null 
                  ? DateFormat('yyyy/MM/dd hh:mm a').format(order.createdAt!) 
                  : '';
              
              final colorValue = AppConstants.orderStatusColors[order.status] ?? 0xFF9CA3AF;
              final statusColor = Color(colorValue);

              return InkWell(
                onTap: () => context.push('/order-tracking/${order.id}'),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('طلب #${order.id}', style: AppTypography.headlineSmall),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: statusColor.withValues(alpha: 0.5)),
                            ),
                            child: Text(
                              AppConstants.orderStatuses[order.status] ?? order.status,
                              style: AppTypography.labelMedium.copyWith(color: statusColor),
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 24),
                      Row(
                        children: [
                          const Icon(Iconsax.calendar_1, size: 16, color: AppColors.textSecondary),
                          const SizedBox(width: 8),
                          Text(dateStr, style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Iconsax.box, size: 16, color: AppColors.textSecondary),
                          const SizedBox(width: 8),
                          Text('${order.items.length} منتجات', style: AppTypography.bodyMedium),
                          const Spacer(),
                          Text(
                            '${order.totalPrice} ج.م',
                            style: AppTypography.titleLarge.copyWith(color: AppColors.primary),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('خطأ: $err')),
      ),
    );
  }
}
