import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/products_provider.dart';
import '../../providers/cart_provider.dart';

class ProductDetailsScreen extends ConsumerStatefulWidget {
  final int productId;

  const ProductDetailsScreen({super.key, required this.productId});

  @override
  ConsumerState<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends ConsumerState<ProductDetailsScreen> {
  int _quantity = 1;

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productDetailProvider(widget.productId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_right_3),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Iconsax.share),
            onPressed: () {},
          ),
          Consumer(
            builder: (context, ref, _) {
              final cartCount = ref.watch(cartProvider.select((state) => state.itemCount));
              return Stack(
                alignment: Alignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Iconsax.shopping_cart),
                    onPressed: () => context.push('/cart'),
                  ),
                  if (cartCount > 0)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppColors.brandRed,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          cartCount.toString(),
                          style: AppTypography.badge.copyWith(fontSize: 10),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
      extendBodyBehindAppBar: true,
      body: productAsync.when(
        data: (product) {
          if (product == null) {
            return const Center(child: Text('المنتج غير متوفر'));
          }

          return Stack(
            children: [
              SingleChildScrollView(
                padding: const EdgeInsets.only(bottom: 100),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image Hero
                    Hero(
                      tag: 'product_image_${product.id}',
                      child: Container(
                        width: double.infinity,
                        height: 400,
                        decoration: BoxDecoration(
                          color: AppColors.shimmerBase,
                          image: DecorationImage(
                            image: CachedNetworkImageProvider(product.image),
                            fit: BoxFit.cover,
                          ),
                        ),
                        // Soft gradient at bottom blending to background
                        child: Align(
                          alignment: Alignment.bottomCenter,
                          child: Container(
                            height: 60,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                                colors: [
                                  AppColors.background,
                                  AppColors.background.withValues(alpha: 0),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Product Info
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      product.categoryName,
                                      style: AppTypography.labelLarge.copyWith(color: AppColors.accentDark),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      product.name,
                                      style: AppTypography.displaySmall,
                                    ),
                                  ],
                                ),
                              ),
                              if (product.isOnSale && product.discount > 0)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: AppColors.saleBadge.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppColors.saleBadge.withValues(alpha: 0.5)),
                                  ),
                                  child: Text(
                                    '${product.discount}% خصم',
                                    style: AppTypography.labelMedium.copyWith(color: AppColors.saleBadge),
                                  ),
                                ),
                            ],
                          ),
                          
                          const SizedBox(height: 16),
                          
                          // Price
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                '${product.displayPrice}',
                                style: AppTypography.displayMedium.copyWith(color: AppColors.primary),
                              ),
                              const SizedBox(width: 4),
                              Text('ج.م', style: AppTypography.titleMedium.copyWith(color: AppColors.textSecondary)),
                              
                              if (product.isOnSale) ...[
                                const SizedBox(width: 12),
                                Text(
                                  '${product.price} ج.م',
                                  style: AppTypography.priceOld.copyWith(fontSize: 16),
                                ),
                              ]
                            ],
                          ),

                          const SizedBox(height: 24),
                          const Divider(),
                          const SizedBox(height: 24),

                          // Wait, checking if description exists
                          if (product.description.isNotEmpty) ...[
                            Text(
                              'وصف المنتج',
                              style: AppTypography.headlineSmall,
                            ),
                            const SizedBox(height: 12),
                            Text(
                              product.description,
                              style: AppTypography.bodyLarge.copyWith(color: AppColors.textSecondary, height: 1.8),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              
              // Bottom Action Bar
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: EdgeInsets.only(
                    left: 20, 
                    right: 20, 
                    top: 16, 
                    bottom: 16 + MediaQuery.of(context).padding.bottom
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.shadow.withValues(alpha: 0.08),
                        blurRadius: 20,
                        offset: const Offset(0, -5),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Quantity Selector
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.surfaceVariant,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Row(
                          children: [
                            IconButton(
                              icon: const Icon(Iconsax.minus),
                              onPressed: () {
                                if (_quantity > 1) {
                                  setState(() => _quantity--);
                                }
                              },
                              color: _quantity > 1 ? AppColors.textPrimary : AppColors.textTertiary,
                            ),
                            Text(
                              '$_quantity',
                              style: AppTypography.titleLarge,
                            ),
                            IconButton(
                              icon: const Icon(Iconsax.add),
                              onPressed: () {
                                setState(() => _quantity++);
                              },
                              color: AppColors.textPrimary,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      
                      // Add to Cart Button
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            ref.read(cartProvider.notifier).addItem(product, quantity: _quantity);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: const Text('تم الإضافة للسلة بنجاح'),
                                behavior: SnackBarBehavior.floating,
                                action: SnackBarAction(
                                  label: 'متابعة الدفع',
                                  textColor: AppColors.accent,
                                  onPressed: () => context.push('/cart'),
                                ),
                              ),
                            );
                            // reset
                            setState(() => _quantity = 1);
                          },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            backgroundColor: AppColors.primary,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Iconsax.shopping_cart, size: 20),
                              const SizedBox(width: 8),
                              Text('أضف للسلة', style: AppTypography.button),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
