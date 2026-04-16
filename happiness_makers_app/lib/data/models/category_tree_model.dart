/// A tree node representing a category in the hierarchy.
/// Supports N-level depth. "الكل" is injected automatically when children exist.
class CategoryNode {
  final String id;
  final String label;
  final String icon;
  final String? imageUrl;
  final String? image; // New official field
  final List<CategoryNode> children;

  const CategoryNode({
    required this.id,
    required this.label,
    required this.icon,
    this.imageUrl,
    this.image,
    this.children = const [],
  });

  bool get hasChildren => children.isNotEmpty;

  CategoryNode copyWith({
    String? id,
    String? label,
    String? icon,
    String? imageUrl,
    String? image,
    List<CategoryNode>? children,
  }) {
    return CategoryNode(
      id: id ?? this.id,
      label: label ?? this.label,
      icon: icon ?? this.icon,
      imageUrl: imageUrl ?? this.imageUrl,
      image: image ?? this.image,
      children: children ?? this.children,
    );
  }

  /// Get children with "الكل" prepended automatically
  List<CategoryNode> get childrenWithAll {
    if (!hasChildren) return [];
    return [
      CategoryNode(id: id, label: 'الكل', icon: '🏠'),
      ...children,
    ];
  }

  /// Recursively collect all descendant IDs (for "الكل" filtering)
  List<String> get allDescendantIds {
    final ids = <String>[id];
    for (final child in children) {
      ids.addAll(child.allDescendantIds);
    }
    return ids;
  }

  /// Build from a Map (from AppConstants.categoryHierarchy)
  factory CategoryNode.fromMap(Map<String, dynamic> map) {
    final subs = map['subcategories'] as List<dynamic>? ?? [];
    return CategoryNode(
      id: map['id'] as String,
      label: map['label'] as String,
      icon: map['icon'] as String? ?? '📦',
      imageUrl: map['imageUrl'] as String?,
      image: map['image'] as String?, // Mapping from Supabase
      children: subs.map((s) => CategoryNode.fromMap(s as Map<String, dynamic>)).toList(),
    );
  }

  /// Find a node by ID in this tree
  CategoryNode? findById(String targetId) {
    if (id == targetId) return this;
    for (final child in children) {
      final found = child.findById(targetId);
      if (found != null) return found;
    }
    return null;
  }
}
