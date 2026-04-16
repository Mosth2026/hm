import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/category_model.dart';
import '../data/models/category_tree_model.dart';
import '../data/repositories/category_repository.dart';
import 'products_provider.dart';
import '../core/constants/app_constants.dart';

/// Categories repository provider
final categoryRepositoryProvider = Provider<CategoryRepository>((ref) => CategoryRepository());

/// Raw categories from Supabase (flat list)
final categoriesProvider = FutureProvider<List<CategoryModel>>((ref) async {
  return ref.read(categoryRepositoryProvider).getCategories();
});

/// Helper to build tree from flat list
List<CategoryNode> _buildTree(List<CategoryModel> categories) {
  final childrenMap = <String?, List<CategoryModel>>{};
  for (final cat in categories) {
    childrenMap.putIfAbsent(cat.parentId, () => []).add(cat);
  }

  List<CategoryNode> buildRecursive(String? pid) {
    final List<CategoryModel> childrenModels = childrenMap[pid] ?? [];
    return childrenModels.map((CategoryModel m) {
      return CategoryNode(
        id: m.id,
        label: m.label,
        icon: m.icon,
        imageUrl: m.imageUrl,
        children: buildRecursive(m.id),
      );
    }).toList();
  }
  return buildRecursive(null);
}

/// Dynamic Category Tree Provider (Filtered for Customers)
final categoryTreeProvider = FutureProvider<List<CategoryNode>>((ref) async {
  final categories = await ref.watch(categoriesProvider.future);
  if (categories.isEmpty) {
    return AppConstants.categoryHierarchy.map((m) => CategoryNode.fromMap(m)).toList();
  }

  // Filter out internal/accounting categories for customers (e.g., "بدون ضريبة" / "no-tax")
  final customerActiveCategories = categories.where((cat) {
    final isAccounting = cat.id == 'no-tax' || 
                         cat.label.contains('ضريبة') || 
                         cat.label.contains('محاسبي');
    return !isAccounting;
  }).toList();

  return _buildTree(customerActiveCategories);
});

/// Admin Category Tree Provider (Unfiltered)
final adminCategoryTreeProvider = FutureProvider<List<CategoryNode>>((ref) async {
  final categories = await ref.watch(categoriesProvider.future);
  if (categories.isEmpty) {
    return AppConstants.categoryHierarchy.map((m) => CategoryNode.fromMap(m)).toList();
  }
  return _buildTree(categories);
});

/// Selected category provider
final selectedCategoryProvider = StateProvider<String?>((ref) => null);

/// Preview images provider — returns up to 4 product images for a category.
/// Searches the category itself first, then its subcategories if empty.
/// Key = comma-separated descendant IDs (e.g. "chocolate,milk-chocolate,dark-chocolate")
final categoryPreviewImagesProvider = FutureProvider.family<List<String>, String>(
  (ref, descendantIdsStr) async {
    if (descendantIdsStr.isEmpty) return [];
    final repo = ref.read(productRepositoryProvider);
    final ids = descendantIdsStr.split(',');

    for (final id in ids) {
      if (id.isEmpty || id == 'all') continue;
      final products = await repo.getProducts(categoryId: id);
      final images = products
          .where((p) => p.hasValidImage)
          .take(4)
          .map((p) => p.image)
          .toList();
      if (images.isNotEmpty) return images;
    }
    return [];
  },
);
