import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../data/models/category_tree_model.dart';
import '../../data/models/category_model.dart';
import '../../providers/categories_provider.dart';
import '../../shared/widgets/glass_card.dart';

class CategoryManagerScreen extends ConsumerStatefulWidget {
  const CategoryManagerScreen({super.key});

  @override
  ConsumerState<CategoryManagerScreen> createState() => _CategoryManagerScreenState();
}

class _CategoryManagerScreenState extends ConsumerState<CategoryManagerScreen> {
  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(adminCategoryTreeProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('إدارة الأقسام', style: AppTypography.headlineMedium),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Iconsax.add_circle),
            onPressed: () => _showAddCategoryDialog(),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: categoriesAsync.when(
        data: (categories) => CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Text(
                  'تعديل هيكلية الأقسام (3 مستويات)',
                  style: AppTypography.titleMedium,
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) => _buildCategoryTreeItem(categories[index], 0),
                  childCount: categories.length,
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildCategoryTreeItem(CategoryNode node, int depth) {
    return Column(
      children: [
        GestureDetector(
          onTap: () => _showEditCategoryDialog(node),
          child: Container(
            margin: EdgeInsets.only(left: 12.0 * depth, bottom: 8),
            child: GlassCard(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Text(node.icon, style: const TextStyle(fontSize: 20)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(node.label, style: AppTypography.labelLarge),
                          if (node.hasChildren)
                            Text(
                              '${node.children.length} أقسام فرعية',
                              style: AppTypography.labelSmall.copyWith(color: AppColors.textTertiary, fontSize: 10),
                            ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Iconsax.edit_2, size: 18, color: AppColors.textSecondary),
                      onPressed: () => _showEditCategoryDialog(node),
                    ),
                    IconButton(
                      icon: const Icon(Iconsax.add_circle, size: 18, color: AppColors.accent),
                      onPressed: () => _showAddCategoryDialog(parentId: node.id),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        if (node.hasChildren)
          ...node.children.map((child) => _buildCategoryTreeItem(child, depth + 1)),
      ],
    ).animate().fadeIn(delay: (depth * 50).ms).slideX(begin: 0.02);
  }

  void _showAddCategoryDialog({String? parentId}) {
    final nameController = TextEditingController();
    final iconController = TextEditingController(text: '📦');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: Text(parentId == null ? 'إضافة قسم رئيسي' : 'إضافة قسم فرعي', style: AppTypography.titleLarge),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'اسم القسم', labelStyle: TextStyle(color: Colors.white70)),
            ),
            TextField(
              controller: iconController,
              decoration: const InputDecoration(labelText: 'الأيقونة (Emoji)', labelStyle: TextStyle(color: Colors.white70)),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              final newCat = CategoryModel(
                id: nameController.text.toLowerCase().replaceAll(' ', '_'),
                label: nameController.text,
                icon: iconController.text,
                parentId: parentId,
              );
              await ref.read(categoryRepositoryProvider).createCategory(newCat);
              ref.invalidate(categoriesProvider);
              if (context.mounted) Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('إضافة'),
          ),
        ],
      ),
    );
  }

  void _showEditCategoryDialog(CategoryNode node) {
    final nameController = TextEditingController(text: node.label);
    final iconController = TextEditingController(text: node.icon);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: Text('تعديل القسم', style: AppTypography.titleLarge),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'اسم القسم', labelStyle: TextStyle(color: Colors.white70)),
            ),
            TextField(
              controller: iconController,
              decoration: const InputDecoration(labelText: 'الأيقونة (Emoji)', labelStyle: TextStyle(color: Colors.white70)),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () async {
              await ref.read(categoryRepositoryProvider).deleteCategory(node.id);
              ref.invalidate(categoriesProvider);
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('حذف', style: TextStyle(color: AppColors.brandRed)),
          ),
          const Spacer(),
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              final updatedCat = CategoryModel(
                id: node.id,
                label: nameController.text,
                icon: iconController.text,
              );
              await ref.read(categoryRepositoryProvider).updateCategory(updatedCat);
              ref.invalidate(categoriesProvider);
              if (context.mounted) Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }
}
