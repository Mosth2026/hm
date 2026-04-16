import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../data/models/category_tree_model.dart';
import '../../../providers/categories_provider.dart';

enum CategoryCardVariant { home, internal }

/// A premium dashboard card for a category on the Home Screen.
/// Shows a dynamic product collage background, gradient overlay, and category info.
class DashboardCategoryCard extends ConsumerWidget {
  final CategoryNode category;
  final bool isAllProducts;
  final VoidCallback onTap;
  final CategoryCardVariant variant;

  const DashboardCategoryCard({
    super.key,
    required this.category,
    required this.onTap,
    this.isAllProducts = false,
    this.variant = CategoryCardVariant.home,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Fetch product images — searches category + all subcategories
    final descendantIds = isAllProducts ? 'all' : category.allDescendantIds.join(',');
    final previewAsync = ref.watch(categoryPreviewImagesProvider(descendantIds));

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(32), // More rounded premium corners
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Background — Product collage or gradient
            previewAsync.when(
              data: (images) {
                if (images.isEmpty) return _buildFallbackBackground();
                return _buildProductCollage(images);
              },
              loading: () => _buildFallbackBackground(isLoading: true),
              error: (_, __) => _buildFallbackBackground(),
            ),

            // Modern Gradient Overlay - More pronounced for readability
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.1),
                    Colors.black.withValues(alpha: 0.65),
                  ],
                ),
              ),
            ),

            // Subtle top-left shine
            Positioned(
              top: -30,
              left: -30,
              child: Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      Colors.white.withValues(alpha: 0.15),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),

            // Content based on variant
            if (variant == CategoryCardVariant.home)
              _buildHomeContent()
            else
              _buildInternalContent(),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 400.ms).scale(begin: const Offset(0.92, 0.92), duration: 400.ms);
  }

  Widget _buildHomeContent() {
    return Container(
      padding: const EdgeInsets.all(16),
      alignment: Alignment.bottomRight, // Clean bottom-right alignment
      child: Text(
        category.label,
        textAlign: TextAlign.right,
        style: AppTypography.titleLarge.copyWith(
          color: Colors.white,
          fontFamily: AppTypography.arabicFontFamily,
          fontWeight: FontWeight.w600, // Elegant medium-bold
          fontSize: 18,
          shadows: [
            Shadow(
              color: Colors.black.withValues(alpha: 0.8),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  Widget _buildInternalContent() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
      alignment: Alignment.bottomRight,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            category.label,
            textAlign: TextAlign.right,
            style: AppTypography.titleLarge.copyWith(
              color: Colors.white,
              fontFamily: AppTypography.arabicFontFamily,
              fontWeight: FontWeight.w600,
              fontSize: 17,
              shadows: [
                Shadow(
                  color: Colors.black.withValues(alpha: 0.8),
                  blurRadius: 10,
                ),
              ],
            ),
          ),
          if (category.hasChildren)
            Container(
              margin: const EdgeInsets.only(top: 4),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                '${category.children.length} أقسام فرعية',
                style: AppTypography.labelSmall.copyWith(
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: 7,
                  fontFamily: AppTypography.arabicFontFamily,
                  letterSpacing: 0,
                ),
              ),
            ),
        ],
      ),
    );
  }






  Widget _buildFallbackBackground({bool isLoading = false}) {
    return Container(
      decoration: BoxDecoration(
        color: variant == CategoryCardVariant.internal ? const Color(0xFF0D121F) : AppColors.primary,
        gradient: variant == CategoryCardVariant.home ? AppColors.primaryGradient : null,
      ),
      child: isLoading ? const Center(child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white24)) : null,
    );
  }

  Widget _buildProductCollage(List<String> imageUrls) {
    if (imageUrls.isEmpty) return _buildFallbackBackground();

    if (imageUrls.length == 1) {
      return CachedNetworkImage(
        imageUrl: imageUrls[0],
        fit: BoxFit.cover,
        errorWidget: (_, __, ___) => _buildFallbackBackground(),
      );
    }

    // Always try to show a 2x2 grid if more than 1 image available
    final displayUrls = [...imageUrls];
    while (displayUrls.length < 4 && displayUrls.isNotEmpty) {
      displayUrls.add(displayUrls[0]); // Duplicate to fill
    }

    return Positioned.fill(
      child: Column(
        children: [
          Expanded(
            child: Row(
              children: [
                Expanded(child: CachedNetworkImage(imageUrl: displayUrls[0], fit: BoxFit.cover, height: double.infinity, width: double.infinity)),
                const SizedBox(width: 1),
                Expanded(child: CachedNetworkImage(imageUrl: displayUrls[1], fit: BoxFit.cover, height: double.infinity, width: double.infinity)),
              ],
            ),
          ),
          const SizedBox(height: 1),
          Expanded(
            child: Row(
              children: [
                Expanded(child: CachedNetworkImage(imageUrl: displayUrls[2], fit: BoxFit.cover, height: double.infinity, width: double.infinity)),
                const SizedBox(width: 1),
                Expanded(child: CachedNetworkImage(imageUrl: displayUrls[3], fit: BoxFit.cover, height: double.infinity, width: double.infinity)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
