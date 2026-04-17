import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:iconsax/iconsax.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../data/models/product_model.dart';
import '../../providers/cart_provider.dart';
import 'widgets/glass_card.dart';

class ProductCard extends ConsumerWidget {
  final ProductModel product;
  final bool isList;

  const ProductCard({
    super.key,
    required this.product,
    this.isList = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (isList) return _buildListCard(context, ref);
    return _buildGridCard(context, ref);
  }

  Widget _buildGridCard(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onTap: () => context.push('/product/${product.id}'),
      child: GlassCard(
        opacity: 0.08,
        blur: 10,
        borderRadius: 28,
        hasGlow: product.isFeatured,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image and Badges
            Expanded(
              flex: 5,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Blurred background — fills space with product's own colors
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                    child: ImageFiltered(
                      imageFilter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
                      child: CachedNetworkImage(
                        imageUrl: product.image,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        height: double.infinity,
                        color: Colors.white.withValues(alpha: 0.6),
                        colorBlendMode: BlendMode.lighten,
                      ),
                    ),
                  ),

                  // Main product image — fully visible, no cropping
                  Hero(
                    tag: 'product_image_${product.id}',
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                      child: CachedNetworkImage(
                        imageUrl: product.image,
                        fit: BoxFit.contain,
                        errorWidget: (context, url, error) => Container(
                          color: AppColors.shimmerBase,
                          child: const Icon(Iconsax.image, color: AppColors.border),
                        ),
                      ),
                    ),
                  ),

                  // Decorative Overlay (Futuristic Shine)
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Colors.white.withValues(alpha: 0.05),
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.04),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Status Badges
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        if (product.isNew)
                          _buildFuturisticBadge('جديد', AppColors.newBadge),
                        if (product.isOnSale)
                          const SizedBox(height: 6),
                        if (product.isOnSale)
                          _buildFuturisticBadge('${product.discount}%-', AppColors.saleBadge),
                      ],
                    ),
                  ),

                  // Dietary Badges (Small Bottom Badges)
                  Positioned(
                    bottom: 8,
                    left: 12,
                    child: Row(
                      children: [
                        if (product.isFreeSugar)
                          _buildDietaryIcon('🚫🍬', 'خالي من السكر'),
                        if (product.isFreeGluten)
                          const SizedBox(width: 4),
                        if (product.isFreeGluten)
                          _buildDietaryIcon('🌾❌', 'خالي من الجلوتين'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            // Details
            Expanded(
              flex: 4,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.categoryName.toUpperCase(),
                          style: AppTypography.futuristicLabel.copyWith(fontSize: 9),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          product.name,
                          style: AppTypography.titleMedium.copyWith(height: 1.1, fontSize: 13),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                    
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (product.isOnSale)
                              Text(
                                '${product.price} ج.م',
                                style: AppTypography.priceOld,
                              ),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Text(
                                  '${product.displayPrice}',
                                  style: AppTypography.priceMedium.copyWith(
                                    color: AppColors.primary,
                                    fontSize: 18,
                                  ),
                                ),
                                const SizedBox(width: 3),
                                Text('ج.م', style: AppTypography.currency),
                              ],
                            ),
                          ],
                        ),
                        
                        // Action Button (Futuristic Circle)
                        GestureDetector(
                          onTap: () {
                            ref.read(cartProvider.notifier).addItem(product);
                            Feedback.forTap(context);
                          },
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: AppColors.accentGradient,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.accent.withValues(alpha: 0.3),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                )
                              ],
                            ),
                            child: const Icon(
                              Iconsax.add,
                              color: Colors.white,
                              size: 22,
                            ),
                          ),
                        ).animate(onPlay: (controller) => controller.repeat())
                        .shimmer(duration: 2000.ms, color: Colors.white.withValues(alpha: 0.3)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 400.ms).scale(begin: const Offset(0.95, 0.95));
  }

  Widget _buildListCard(BuildContext context, WidgetRef ref) {
    // Simplified futuristic list card using the same design language
    return GestureDetector(
      onTap: () => context.push('/product/${product.id}'),
      child: Container(
        height: 120,
        margin: const EdgeInsets.only(bottom: 16),
        child: GlassCard(
          borderRadius: 20,
          padding: EdgeInsets.zero,
          child: Row(
            children: [
              // Image
              ClipRRect(
                borderRadius: const BorderRadius.horizontal(left: Radius.circular(20)),
                child: SizedBox(
                  width: 120,
                  height: 120,
                  child: CachedNetworkImage(
                    imageUrl: product.image,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              // Details
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(product.categoryName, style: AppTypography.futuristicLabel),
                          Text(
                            product.name,
                            style: AppTypography.titleMedium,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('${product.displayPrice} ج.م', style: AppTypography.priceMedium),
                          IconButton(
                            icon: const Icon(Iconsax.add_circle),
                            onPressed: () => ref.read(cartProvider.notifier).addItem(product),
                            color: AppColors.accent,
                          ),
                        ],
                      )
                    ],
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFuturisticBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.2),
            blurRadius: 8,
          )
        ],
      ),
      child: Text(
        text,
        style: AppTypography.badge,
      ),
    );
  }

  Widget _buildDietaryIcon(String emoji, String tooltip) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(emoji, style: const TextStyle(fontSize: 10)),
    );
  }
}
