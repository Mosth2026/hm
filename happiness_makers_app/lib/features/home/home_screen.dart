
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/constants/app_constants.dart';
import '../../data/models/category_tree_model.dart';
import '../../providers/products_provider.dart';
import '../../providers/categories_provider.dart';
import 'widgets/hero_banner.dart';
import 'widgets/featured_products.dart';
import 'widgets/dashboard_category_card.dart';
import 'widgets/fast_category_card.dart';

// State to control layout mode - Default to 'fast' for Breadfast look
final layoutModeProvider = StateProvider<String>((ref) => 'fast');

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    // Watch categories and current layout mode
    final categoriesAsync = ref.watch(categoryTreeProvider);
    final layoutMode = ref.watch(layoutModeProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(featuredProductsProvider);
          ref.invalidate(categoriesProvider);
          ref.invalidate(categoryTreeProvider);
        },
        color: AppColors.accent,
        child: CustomScrollView(
          slivers: [
            // ─── Header App Bar ───
            SliverAppBar(
              floating: true,
              snap: true,
              expandedHeight: 70,
              backgroundColor: AppColors.background,
              surfaceTintColor: Colors.transparent,
              title: Row(
                children: [
                  GestureDetector(
                    onLongPress: () => context.push('/admin'),
                    child: Hero(
                      tag: 'app_logo',
                      child: Image.asset('assets/images/logo.png', height: 40),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(AppConstants.appName, style: AppTypography.headlineMedium.copyWith(color: AppColors.primary)),
                      Text(AppConstants.appSlogan, style: AppTypography.futuristicLabel.copyWith(fontSize: 10)),
                    ],
                  ),
                ],
              ),
              actions: [
                // Layout Switcher Button
                _buildCircularAction(
                  layoutMode == 'premium' ? Iconsax.menu_board : Iconsax.category,
                  () => ref.read(layoutModeProvider.notifier).state = (layoutMode == 'premium' ? 'fast' : 'premium'),
                  isActive: true,
                ),
                const SizedBox(width: 8),
                _buildCircularAction(Iconsax.search_normal_1, () => context.go('/search')),
                const SizedBox(width: 16),
              ],
            ),

            // ─── Banner ───
            const SliverToBoxAdapter(child: Padding(padding: EdgeInsets.only(top: 8, bottom: 20), child: HeroBanner())),

            // ─── Sections Title ───
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(layoutMode == 'premium' ? 'تصفح أقسامنا' : 'جميع الأقسام', style: AppTypography.displayMedium.copyWith(fontSize: 22)),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 16)),

            // ─── Categories Grid (Premium or Fast) ───
            categoriesAsync.when(
              data: (categories) => SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverGrid(
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: layoutMode == 'premium' ? 2 : 3,
                    childAspectRatio: layoutMode == 'premium' ? 0.85 : 1.1, // Shorter, more compact cards
                    crossAxisSpacing: layoutMode == 'premium' ? 14 : 10,
                    mainAxisSpacing: layoutMode == 'premium' ? 14 : 10,
                  ),
                  delegate: SliverChildBuilderDelegate((context, index) {
                    if (index == 0) {
                      const allCat = CategoryNode(id: 'all', label: 'كل المنتجات', icon: '🛍️');
                      return layoutMode == 'premium'
                          ? DashboardCategoryCard(category: allCat, isAllProducts: true, onTap: () => context.push('/category/all'))
                          : FastCategoryCard(category: allCat, isAllProducts: true, onTap: () => context.push('/category/all'));
                    }
                    final cat = categories[index - 1];
                    return layoutMode == 'premium'
                        ? DashboardCategoryCard(category: cat, onTap: () => context.push('/category/${cat.id}'))
                        : FastCategoryCard(category: cat, onTap: () => context.push('/category/${cat.id}'));
                  }, childCount: categories.length + 1),
                ),
              ),
              loading: () => const SliverToBoxAdapter(child: Center(child: CircularProgressIndicator())),
              error: (e, _) => SliverToBoxAdapter(child: Center(child: Text('خطأ: $e'))),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 32)),
            const SliverToBoxAdapter(child: FeaturedProducts()),
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildCircularAction(IconData icon, VoidCallback onTap, {bool isActive = false}) {
    return Container(
      decoration: BoxDecoration(
        color: isActive ? AppColors.primary.withValues(alpha: 0.1) : AppColors.surface,
        shape: BoxShape.circle,
        border: Border.all(color: isActive ? AppColors.primary.withValues(alpha: 0.3) : AppColors.borderLight),
      ),
      child: IconButton(
        icon: Icon(icon, size: 20, color: isActive ? AppColors.primary : AppColors.textPrimary),
        onPressed: onTap,
      ),
    );
  }
}
