import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/repositories/product_repository.dart';
import '../data/models/product_model.dart';
import 'auth_provider.dart';
import 'branches_provider.dart';

/// Product repository provider
final productRepositoryProvider = Provider<ProductRepository>((ref) {
  return ProductRepository();
});

/// All products provider
final productsProvider = FutureProvider.family<List<ProductModel>, String?>(
  (ref, categoryId) async {
    final repo = ref.read(productRepositoryProvider);
    final auth = ref.watch(authProvider);
    final selectedBranch = ref.watch(selectedBranchProvider);

    return repo.getProducts(
      categoryId: categoryId,
      isAdmin: auth.isAdmin,
      branchId: selectedBranch?.id,
    );
  },
);

/// Featured products provider
final featuredProductsProvider = FutureProvider<List<ProductModel>>(
  (ref) async {
    final repo = ref.read(productRepositoryProvider);
    final auth = ref.watch(authProvider);
    final selectedBranch = ref.watch(selectedBranchProvider);

    return repo.getProducts(
      isFeatured: true,
      isAdmin: auth.isAdmin,
      branchId: selectedBranch?.id,
    );
  },
);

/// Single product provider
final productDetailProvider = FutureProvider.family<ProductModel?, int>(
  (ref, id) async {
    final repo = ref.read(productRepositoryProvider);
    final auth = ref.watch(authProvider);
    final selectedBranch = ref.watch(selectedBranchProvider);

    return repo.getProduct(
      id: id,
      isAdmin: auth.isAdmin,
      branchId: selectedBranch?.id,
    );
  },
);

/// Search products provider
final searchProductsProvider = FutureProvider.family<List<ProductModel>, String>(
  (ref, query) async {
    if (query.trim().isEmpty) return [];
    final repo = ref.read(productRepositoryProvider);
    final auth = ref.watch(authProvider);
    final selectedBranch = ref.watch(selectedBranchProvider);

    return repo.searchProducts(
      query: query,
      isAdmin: auth.isAdmin,
      branchId: selectedBranch?.id,
    );
  },
);
