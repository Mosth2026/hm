import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/constants/app_constants.dart';

class CategoryChips extends StatelessWidget {
  final String? selectedCategoryId;
  final Function(String) onSelectCategory;

  const CategoryChips({
    super.key,
    required this.selectedCategoryId,
    required this.onSelectCategory,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: AppConstants.defaultCategories.length,
        itemBuilder: (context, index) {
          final category = AppConstants.defaultCategories[index];
          final isSelected = category['id'] == selectedCategoryId;
          
          return Padding(
            padding: const EdgeInsets.only(left: 8),
            child: ChoiceChip(
              label: Row(
                children: [
                  Text(category['icon'] ?? ''),
                  const SizedBox(width: 6),
                  Text(category['label'] ?? ''),
                ],
              ),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) {
                  onSelectCategory(category['id']!);
                }
              },
              side: isSelected 
                  ? BorderSide.none 
                  : const BorderSide(color: AppColors.borderLight),
              backgroundColor: AppColors.surfaceVariant,
              selectedColor: AppColors.accent,
              labelStyle: isSelected 
                  ? AppTypography.labelMedium.copyWith(color: AppColors.textOnAccent)
                  : AppTypography.labelMedium.copyWith(color: AppColors.textPrimary),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
          );
        },
      ),
    );
  }
}
