/// Category model matching Supabase categories table
class CategoryModel {
  final String id;
  final String label;
  final String icon;
  final String? parentId;
  final String? imageUrl;

  const CategoryModel({
    required this.id,
    required this.label,
    this.icon = '📦',
    this.parentId,
    this.imageUrl,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id']?.toString() ?? '',
      label: json['label']?.toString() ?? '',
      icon: json['icon']?.toString() ?? '📦',
      parentId: json['parent_id']?.toString(),
      imageUrl: json['image_url']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'label': label,
        'icon': icon,
        'parent_id': parentId,
        'image_url': imageUrl,
      };
}
