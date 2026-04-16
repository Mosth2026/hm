import '../datasources/supabase_service.dart';
import '../models/category_model.dart';

/// Repository for category data from Supabase
class CategoryRepository {
  /// Fetch all categories
  Future<List<CategoryModel>> getCategories() async {
    final response = await SupabaseService.from('categories').select().order('label');
    final data = response as List<dynamic>;
    return data.map((json) => CategoryModel.fromJson(json as Map<String, dynamic>)).toList();
  }

  /// Create a new category
  Future<void> createCategory(CategoryModel category) async {
    await SupabaseService.from('categories').insert(category.toJson());
  }

  /// Update an existing category
  Future<void> updateCategory(CategoryModel category) async {
    await SupabaseService.from('categories').update(category.toJson()).eq('id', category.id);
  }

  /// Delete a category
  Future<void> deleteCategory(String id) async {
    await SupabaseService.from('categories').delete().eq('id', id);
  }
}
