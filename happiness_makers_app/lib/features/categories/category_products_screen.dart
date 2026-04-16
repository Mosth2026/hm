import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../data/models/category_tree_model.dart';
import '../../providers/products_provider.dart';
import '../../providers/categories_provider.dart';
import '../../shared/product_card.dart';
import '../home/widgets/dashboard_category_card.dart';

/// Deep category drill-down screen.
/// If the category has sub-categories → shows sub-category chips (with "الكل") + product grid.
/// If the category is a leaf → shows product grid directly.
/// Works the same in both themes.
class CategoryProductsScreen extends ConsumerStatefulWidget {
  final String categoryId;

  const CategoryProductsScreen({super.key, required this.categoryId});

  @override
  ConsumerState<CategoryProductsScreen> createState() => _CategoryProductsScreenState();
}

class _CategoryProductsScreenState extends ConsumerState<CategoryProductsScreen> {
  String? _selectedSubId;

  CategoryNode? _findNodeInTree(List<CategoryNode> nodes, String id) {
    if (id == 'all') return const CategoryNode(id: 'all', label: 'كل المنتجات', icon: '🏠');
    for (final node in nodes) {
      final found = node.findById(id);
      if (found != null) return found;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final treeAsync = ref.watch(categoryTreeProvider);
    
    return treeAsync.when(
      data: (nodes) {
        final node = _findNodeInTree(nodes, widget.categoryId);
        if (node == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('قسم غير موجود')),
            body: Center(child: Text('القسم ${widget.categoryId} غير متوفر')),
          );
        }
        return _buildContent(context, node);
      },
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('خطأ في جلب الأقسام: $e'))),
    );
  }

  Widget _buildContent(BuildContext context, CategoryNode node) {

    // Determine what products to load
    final String? activeFilter;
    if (node.id == 'all') {
      activeFilter = _selectedSubId; // null = all products
    } else if (_selectedSubId != null && _selectedSubId != node.id) {
      activeFilter = _selectedSubId;
    } else {
      activeFilter = node.id;
    }

    final productsAsync = ref.watch(productsProvider(activeFilter));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        surfaceTintColor: Colors.transparent,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(node.icon, style: const TextStyle(fontSize: 24)),
            const SizedBox(width: 10),
            Text(node.label, style: AppTypography.headlineMedium),
          ],
        ),
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_right_3),
          onPressed: () => context.pop(),
        ),
      ),
      body: CustomScrollView(
        slivers: [
          // ─── Sub-category Grid (Buttons) ───
          if (node.hasChildren)
            _buildSubCategoryGrid(node),

          // ─── Products Title ───
          if (node.hasChildren)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
                child: Text(
                  _selectedSubId == node.id || _selectedSubId == null 
                    ? 'كل المنتجات' 
                    : 'منتجات القسم المختار',
                  style: AppTypography.titleMedium,
                ),
              ),
            ),

          // ─── Products Grid ───
          productsAsync.when(
            data: (products) {
              if (products.isEmpty) {
                return SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Iconsax.box_search, size: 72, color: AppColors.border),
                        const SizedBox(height: 16),
                        Text('لا توجد منتجات في هذا القسم', style: AppTypography.titleMedium),
                      ],
                    ),
                  ),
                );
              }
              return SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.60,
                    crossAxisSpacing: 14,
                    mainAxisSpacing: 18,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => ProductCard(product: products[index]),
                    childCount: products.length,
                  ),
                ),
              );
            },
            loading: () => SliverFillRemaining(
              hasScrollBody: false,
              child: Center(
                child: CircularProgressIndicator(color: AppColors.accent),
              ),
            ),
            error: (err, _) => SliverFillRemaining(
              hasScrollBody: false,
              child: Center(child: Text('حدث خطأ: $err')),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubCategoryGrid(CategoryNode node) {
    final subs = node.children;
    
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1.0,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            // First card = "الكل"
            if (index == 0) {
              return DashboardCategoryCard(
                category: node.copyWith(id: node.id, label: 'الكل (كل المنتجات)', icon: ''),
                isAllProducts: true,
                variant: CategoryCardVariant.internal,
                onTap: () => setState(() => _selectedSubId = node.id),
              ).animate().fadeIn(duration: 300.ms).scale(begin: const Offset(0.95, 0.95));
            }

            final sub = subs[index - 1];
            return DashboardCategoryCard(
              category: sub,
              variant: CategoryCardVariant.internal,
              onTap: () {
                if (sub.hasChildren) {
                  context.push('/category/${sub.id}');
                } else {
                  setState(() => _selectedSubId = sub.id);
                }
              },
            ).animate().fadeIn(delay: (index * 50).ms, duration: 300.ms).scale(begin: const Offset(0.95, 0.95));
          },
          childCount: subs.length + 1,
        ),
      ),
    );
  }
}
