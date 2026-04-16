import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../providers/products_provider.dart';
import '../../../shared/product_card.dart';

class FeaturedProducts extends ConsumerWidget {
  const FeaturedProducts({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featuredAsync = ref.watch(featuredProductsProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'عروض مميزة',
                style: AppTypography.headlineMedium,
              ),
              TextButton(
                onPressed: () {}, // Navigate to products (not implemented yet as all items)
                child: const Text('عرض الكل', style: TextStyle(color: AppColors.accentDark)),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 280,
          child: featuredAsync.when(
            data: (products) {
              if (products.isEmpty) {
                return Center(
                  child: Text('لا توجد عروض حالياً', style: AppTypography.bodyMedium),
                );
              }
              
              return ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                scrollDirection: Axis.horizontal,
                itemCount: products.length,
                itemBuilder: (context, index) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: SizedBox(
                      width: 160,
                      child: ProductCard(product: products[index]),
                    ),
                  );
                },
              );
            },
            loading: () => ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              scrollDirection: Axis.horizontal,
              itemCount: 4,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Shimmer.fromColors(
                    baseColor: AppColors.shimmerBase,
                    highlightColor: AppColors.shimmerHighlight,
                    child: Container(
                      width: 160,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                );
              },
            ),
            error: (err, stack) => Center(
              child: Text('حدث خطأ في تحميل العروض', style: AppTypography.bodySmall.copyWith(color: AppColors.error)),
            ),
          ),
        ),
      ],
    );
  }
}
