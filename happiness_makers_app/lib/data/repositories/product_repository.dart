import '../datasources/supabase_service.dart';
import '../models/product_model.dart';

/// Repository for product data from Supabase
class ProductRepository {
  /// Fetch all products with branch stock join
  Future<List<ProductModel>> getProducts({
    String? categoryId,
    bool? isFeatured,
    bool isAdmin = false,
    int? branchId,
  }) async {
    var query = SupabaseService.from('products').select('''
      *,
      product_branch_stock!left (
        stock,
        branch_id
      )
    ''');

    // Customer filters
    if (!isAdmin) {
      query = query
          .gt('price', 0)
          .not('image', 'is', null)
          .neq('image', '')
          .not('image', 'ilike', '%unsplash.com%')
          .not('image', 'ilike', '%placeholder%')
          .not('image', 'ilike', '%generic%')
          .not('description', 'ilike', '%[DRAFT]%');
    }

    // Category filter
    if (categoryId != null && categoryId != 'all') {
      query = query.eq('category_id', categoryId);
    }

    // Featured filter
    if (isFeatured == true) {
      query = query.eq('is_featured', true);
    }

    final response = await query.order('created_at', ascending: false);
    final data = response as List<dynamic>;

    final products = data.map((json) {
      return ProductModel.fromJson(
        json as Map<String, dynamic>,
        isAdmin: isAdmin,
        branchId: branchId,
      );
    }).toList();

    // Customer view: group by name and aggregate stock
    if (!isAdmin) {
      final groupedMap = <String, ProductModel>{};

      for (final p in products) {
        if (!p.isAvailableForCustomer) continue;

        final key = p.name.toLowerCase().trim();
        if (groupedMap.containsKey(key)) {
          final existing = groupedMap[key]!;
          groupedMap[key] = existing.copyWith(
            stock: existing.stock + p.stock,
          );
        } else {
          groupedMap[key] = p;
        }
      }

      return groupedMap.values.toList();
    }

    return products;
  }

  /// Fetch a single product by ID
  Future<ProductModel?> getProduct({
    required int id,
    bool isAdmin = false,
    int? branchId,
  }) async {
    final response = await SupabaseService.from('products')
        .select('''
          *,
          product_branch_stock!left (
            stock,
            branch_id
          )
        ''')
        .eq('id', id)
        .single();

    final product = ProductModel.fromJson(
      response,
      isAdmin: isAdmin,
      branchId: branchId,
    );

    if (isAdmin) return product;

    // Customer: aggregate stock from all batches with same name
    final batchesResponse = await SupabaseService.from('products')
        .select('''
          *,
          product_branch_stock!left (
            stock,
            branch_id
          )
        ''')
        .eq('name', response['name']);

    final batches = (batchesResponse as List<dynamic>)
        .map((b) => ProductModel.fromJson(
              b as Map<String, dynamic>,
              isAdmin: false,
              branchId: branchId,
            ))
        .toList();

    final totalStock = batches.fold<int>(0, (sum, b) => sum + b.stock);
    final result = product.copyWith(stock: totalStock);

    if (!result.isAvailableForCustomer) return null;

    return result;
  }

  /// Search products by name
  Future<List<ProductModel>> searchProducts({
    required String query,
    bool isAdmin = false,
    int? branchId,
  }) async {
    final response = await SupabaseService.from('products')
        .select('''
          *,
          product_branch_stock!left (
            stock,
            branch_id
          )
        ''')
        .ilike('name', '%$query%')
        .order('created_at', ascending: false);

    final data = response as List<dynamic>;
    final products = data
        .map((json) => ProductModel.fromJson(
              json as Map<String, dynamic>,
              isAdmin: isAdmin,
              branchId: branchId,
            ))
        .where((p) => isAdmin || p.isAvailableForCustomer)
        .toList();

    return products;
  }

  /// Toggle product featured status
  Future<void> toggleProductFeatured(int productId, bool isFeatured) async {
    await SupabaseService.from('products').update({'is_featured': isFeatured}).eq('id', productId);
  }
}
