/// Product model matching Supabase products table
class ProductModel {
  final int id;
  final String name;
  final double price;
  final String image;
  final String description;
  final String categoryId;
  final String categoryName;
  final bool isFeatured;
  final bool isNew;
  final bool isOnSale;
  final int discount;
  final int stock;
  final bool noTax;
  final String? expiryDate;
  final List<String> allCategoryIds;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const ProductModel({
    required this.id,
    required this.name,
    required this.price,
    required this.image,
    this.description = '',
    this.categoryId = '',
    this.categoryName = '',
    this.isFeatured = false,
    this.isNew = false,
    this.isOnSale = false,
    this.discount = 0,
    this.stock = 0,
    this.noTax = false,
    this.expiryDate,
    this.createdAt,
    this.updatedAt,
    this.allCategoryIds = const [],
  });

  /// Get the effective sale price
  double get salePrice {
    if (isOnSale && discount > 0) {
      return price - (price * discount / 100);
    }
    return price;
  }

  /// Get the display price
  double get displayPrice => isOnSale ? salePrice : price;

  /// Check if product has valid image
  bool get hasValidImage {
    final lower = image.toLowerCase();
    return image.isNotEmpty &&
        !lower.contains('unsplash.com') &&
        !lower.contains('placeholder') &&
        !lower.contains('generic') &&
        image.trim().isNotEmpty;
  }

  /// Dietary helpers
  bool get isFreeSugar => allCategoryIds.contains('free-sugar') || description.contains('خالي من السكر');
  bool get isFreeGluten => allCategoryIds.contains('free-gluten') || description.contains('خالي من الجلوتين');

  /// Check if product is available for customers
  bool get isAvailableForCustomer =>
      price > 0 &&
      hasValidImage &&
      stock >= 1 &&
      !description.contains('[DRAFT]');

  factory ProductModel.fromJson(Map<String, dynamic> json, {bool isAdmin = false, int? branchId}) {
    // Extract stock based on branch
    int effectiveStock = (json['stock'] as num?)?.toInt() ?? 0;
    if (branchId != null) {
      final branchStocks = json['product_branch_stock'] as List<dynamic>? ?? [];
      final branchRecord = branchStocks.cast<Map<String, dynamic>>().where(
        (s) => s['branch_id'] == branchId,
      ).firstOrNull;
      effectiveStock = (branchRecord?['stock'] as num?)?.toInt() ?? 0;
    }

    // Process category name
    String categoryName = json['category_name']?.toString() ?? '';
    String categoryId = json['category_id']?.toString() ?? '';
    List<String> allCategoryIds = [];

    // Extract multi-category IDs [IDS:cat1,cat2,cat3]
    final idMatch = RegExp(r'\[IDS:(.*?)\]').firstMatch(categoryName);
    if (idMatch != null && idMatch.group(1) != null) {
      allCategoryIds = idMatch.group(1)!.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
      if (allCategoryIds.isNotEmpty) {
        categoryId = allCategoryIds.first;
      }
    } else if (categoryId.isNotEmpty) {
      allCategoryIds = [categoryId];
    }

    // Clean display name
    categoryName = categoryName
        .replaceAll(RegExp(r'\s*\[IDS:.*?\]'), '')
        .replaceAll('[TAX_EXEMPT]', '')
        .trim();

    // Process name and description
    String name = (json['name']?.toString() ?? '').replaceAll('[TAX_EXEMPT]', '').trim();
    String description = (json['description']?.toString() ?? '')
        .replaceAll('[TAX_EXEMPT]', '')
        .trim();

    if (!isAdmin) {
      description = description.replaceAll(RegExp(r'باركود\s*:\s*\d+'), '').trim();
    }

    // Check no-tax
    bool noTax = json['category_id'] == 'no-tax';

    // Hide internal categories for customers
    if (!isAdmin && (categoryName == 'بدون ضريبة' || 
        json['category_id'] == 'no-tax' ||
        categoryId.contains('no-tax'))) {
      categoryName = '';
    }

    // Handle expiry date
    String? expiryDate = json['expiry_date'] as String?;
    if (!isAdmin && expiryDate != null) {
      final expiry = DateTime.tryParse(expiryDate);
      if (expiry != null && expiry.isBefore(DateTime.now())) {
        expiryDate = null;
      }
    }

    return ProductModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: name,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      image: json['image']?.toString() ?? '',
      description: description,
      categoryId: categoryId,
      categoryName: categoryName,
      isFeatured: json['is_featured'] == true,
      isNew: json['is_new'] == true,
      isOnSale: json['is_on_sale'] == true,
      discount: (json['discount'] as num?)?.toInt() ?? 0,
      stock: effectiveStock,
      noTax: noTax,
      expiryDate: expiryDate,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'].toString())
          : null,
      allCategoryIds: allCategoryIds,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'price': price,
        'image': image,
        'description': description,
        'category_id': categoryId,
        'category_name': categoryName,
        'is_featured': isFeatured,
        'is_new': isNew,
        'is_on_sale': isOnSale,
        'discount': discount,
        'stock': stock,
      };

  ProductModel copyWith({
    int? id,
    String? name,
    double? price,
    String? image,
    String? description,
    String? categoryId,
    String? categoryName,
    bool? isFeatured,
    bool? isNew,
    bool? isOnSale,
    int? discount,
    int? stock,
    bool? noTax,
    String? expiryDate,
  }) {
    return ProductModel(
      id: id ?? this.id,
      name: name ?? this.name,
      price: price ?? this.price,
      image: image ?? this.image,
      description: description ?? this.description,
      categoryId: categoryId ?? this.categoryId,
      categoryName: categoryName ?? this.categoryName,
      isFeatured: isFeatured ?? this.isFeatured,
      isNew: isNew ?? this.isNew,
      isOnSale: isOnSale ?? this.isOnSale,
      discount: discount ?? this.discount,
      stock: stock ?? this.stock,
      noTax: noTax ?? this.noTax,
      expiryDate: expiryDate ?? this.expiryDate,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
