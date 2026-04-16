
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_typography.dart';
import '../../../data/models/category_tree_model.dart';
import '../../../providers/categories_provider.dart';

class FastCategoryCard extends ConsumerWidget {
  final CategoryNode category;
  final VoidCallback onTap;
  final bool isAllProducts;

  const FastCategoryCard({
    super.key,
    required this.category,
    required this.onTap,
    this.isAllProducts = false,
  });

  // Arabic Normalization for robust matching
  static String _norm(String input) {
    var text = input.trim();
    text = text.replaceAll(RegExp(r'[أإآ]'), 'ا');
    text = text.replaceAll('ة', 'ه');
    text = text.replaceAll('ى', 'ي');
    text = text.replaceAll(RegExp(r'[^\u0621-\u064A]'), ''); 
    return text;
  }

  static const _categoryStyles = {
    'مشروب': {'bg': Color(0xFFE0F2FE), 'icon': 'https://pngimg.com/uploads/can/can_PNG34.png'},
    'نودلز': {'bg': Color(0xFFFFE4E6), 'icon': 'https://pngimg.com/uploads/noodle/noodle_PNG24.png'},
    'مكسرات': {'bg': Color(0xFFFEF3C7), 'icon': 'https://pngimg.com/uploads/almond/almond_PNG1.png'},
    'كيك': {'bg': Color(0xFFFAE8FF), 'icon': 'https://pngimg.com/uploads/cake/cake_PNG13123.png'},
    'كوكيز': {'bg': Color(0xFFFEF9C3), 'icon': 'https://pngimg.com/uploads/cookie/cookie_PNG52.png'},
    'شوكولا': {'bg': Color(0xFFF3E8FF), 'icon': 'https://pngimg.com/uploads/chocolate/chocolate_PNG97.png'},
    'شيبس': {'bg': Color(0xFFF1F5F9), 'icon': 'https://pngimg.com/uploads/potato_chips/potato_chips_PNG38.png'},
    'حلو': {'bg': Color(0xFFFCE7F3), 'icon': 'https://pngimg.com/uploads/candy/candy_PNG3.png'},
    'هدايا': {'bg': Color(0xFFF1F5F9), 'icon': 'https://pngimg.com/uploads/gift_box/gift_box_PNG92.png'},
    'بسكوت': {'bg': Color(0xFFFFF7ED), 'icon': 'https://pngimg.com/uploads/biscuit/biscuit_PNG97.png'},
    'عنايه': {'bg': Color(0xFFEEF2FF), 'icon': 'https://pngimg.com/uploads/shampoo/shampoo_PNG5.png'},
    'دايت': {'bg': Color(0xFFF0FDF4), 'icon': 'https://pngimg.com/uploads/apple/apple_PNG12458.png'},
    'اسبريد': {'bg': Color(0xFFFFF7ED), 'icon': 'https://pngimg.com/uploads/honey/honey_PNG35.png'},
    'نوتيلا': {'bg': Color(0xFFFFF7ED), 'icon': 'https://pngimg.com/uploads/honey/honey_PNG35.png'},
    'كريم': {'bg': Color(0xFFE0F2FE), 'icon': 'https://pngimg.com/uploads/ice_cream/ice_cream_PNG5094.png'},
    'قهوه': {'bg': Color(0xFFF8FAF5), 'icon': 'https://pngimg.com/uploads/coffee_beans/coffee_beans_PNG9273.png'},
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final searchLabel = _norm(category.label);

    Map<String, dynamic>? selectedStyle;
    for (var entry in _categoryStyles.entries) {
      if (searchLabel.contains(_norm(entry.key))) {
        selectedStyle = entry.value;
        break;
      }
    }

    final style = selectedStyle ?? {
      'bg': const Color(0xFFF8FAFC),
      'icon': 'https://pngimg.com/uploads/shopping_cart/shopping_cart_PNG42.png'
    };

    bool isPersonalCare = searchLabel.contains(_norm('عنايه')) || searchLabel.contains(_norm('جمال'));

    // Fetch first product image as fallback
    final descendantIds = category.allDescendantIds.join(',');
    final previewImages = ref.watch(categoryPreviewImagesProvider(descendantIds)).valueOrNull;
    final firstProductImage = previewImages?.isNotEmpty == true ? previewImages!.first : null;

    final displayIcon = (category.image != null && category.image!.isNotEmpty)
        ? category.image!
        : firstProductImage ??
            (isPersonalCare ? 'assets/images/cosmetics.png' : style['icon'] as String);

    bool isAsset = displayIcon.startsWith('assets/');

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: style['bg'] as Color,
          borderRadius: BorderRadius.circular(20), // Premium Rounded
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          alignment: Alignment.topCenter,
          children: [
            // 1. LABEL - Top Centered (Breadfast Layout)
            Positioned(
              top: 10,
              left: 4,
              right: 4,
              child: Text(
                category.label,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.titleMedium.copyWith(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  fontFamily: AppTypography.arabicFontFamily,
                  color: const Color(0xFF334155), // Slate 700
                  height: 1.1,
                ),
              ),
            ),

            // 2. PRODUCT IMAGE - Massive and Centered (Breadfast Look)
            Positioned(
              left: 4,
              right: 4,
              bottom: 4,
              top: 35, // Clear space for text
              child: isAsset 
                  ? Image.asset(
                      displayIcon,
                      fit: BoxFit.contain,
                      alignment: Alignment.center,
                      errorBuilder: (context, error, stackTrace) => const Icon(Icons.category, color: Colors.black12, size: 40),
                    )
                  : CachedNetworkImage(
                      imageUrl: displayIcon,
                      fit: BoxFit.contain,
                      alignment: Alignment.center,
                      placeholder: (context, url) => const SizedBox(),
                      errorWidget: (context, url, error) => const Icon(Icons.category, color: Colors.black12, size: 40),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
