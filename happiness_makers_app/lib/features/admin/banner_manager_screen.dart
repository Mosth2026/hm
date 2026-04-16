import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/products_provider.dart';
import '../../shared/widgets/glass_card.dart';
import 'package:cached_network_image/cached_network_image.dart';

class BannerManagerScreen extends ConsumerStatefulWidget {
  const BannerManagerScreen({super.key});

  @override
  ConsumerState<BannerManagerScreen> createState() => _BannerManagerScreenState();
}

class _BannerManagerScreenState extends ConsumerState<BannerManagerScreen> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final featuredProducts = ref.watch(featuredProductsProvider);
    final searchResults = ref.watch(searchProductsProvider(_searchQuery));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('إدارة البانر المميز', style: AppTypography.headlineMedium),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // ─── Search Bar ───
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'ابحث عن منتج لتثبيته...',
                prefixIcon: const Icon(Iconsax.search_normal_1, color: AppColors.textTertiary),
                hintStyle: const TextStyle(color: AppColors.textTertiary),
                filled: true,
                fillColor: AppColors.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          Expanded(
            child: CustomScrollView(
              slivers: [
                // ─── Currently Featured Section ───
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    child: Text('المنتجات المثبتة حالياً', style: AppTypography.titleMedium),
                  ),
                ),

                featuredProducts.when(
                  data: (products) => SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => _buildProductListTile(products[index], true),
                        childCount: products.length,
                      ),
                    ),
                  ),
                  loading: () => const SliverToBoxAdapter(child: Center(child: CircularProgressIndicator())),
                  error: (err, _) => SliverToBoxAdapter(child: Text('Error: $err')),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 20)),

                // ─── Search Results Section ───
                if (_searchQuery.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      child: Text('نتائج البحث', style: AppTypography.titleMedium),
                    ),
                  ),
                  searchResults.when(
                    data: (products) {
                      final nonFeatured = products.where((p) => !p.isFeatured).toList();
                      return SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) => _buildProductListTile(nonFeatured[index], false),
                            childCount: nonFeatured.length,
                          ),
                        ),
                      );
                    },
                    loading: () => const SliverToBoxAdapter(child: Center(child: CircularProgressIndicator())),
                    error: (err, _) => SliverToBoxAdapter(child: Text('Error: $err')),
                  ),
                ],

                const SliverToBoxAdapter(child: SizedBox(height: 100)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductListTile(dynamic product, bool isPinned) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: CachedNetworkImage(
                  imageUrl: product.image,
                  width: 50,
                  height: 50,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(product.name, style: AppTypography.labelLarge),
                    Text('${product.price} ج.م', style: AppTypography.labelSmall.copyWith(color: AppColors.accent)),
                  ],
                ),
              ),
              IconButton(
                icon: Icon(
                  isPinned ? Iconsax.minus_cirlce : Iconsax.add_circle,
                  color: isPinned ? AppColors.brandRed : AppColors.accent,
                ),
                onPressed: () async {
                  final repo = ref.read(productRepositoryProvider);
                  await repo.toggleProductFeatured(product.id, !isPinned);
                  
                  // Invalidate providers to refresh UI
                  ref.invalidate(featuredProductsProvider);
                  ref.invalidate(searchProductsProvider(_searchQuery));
                  
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(isPinned ? 'تم إلغاء التثبيت' : 'تم التثبيت بنجاح'),
                        backgroundColor: isPinned ? AppColors.brandRed : AppColors.primary,
                      ),
                    );
                  }
                },
              ),
            ],
          ),
        ),
      ),
    ).animate().fadeIn().slideX(begin: 0.05);
  }
}
