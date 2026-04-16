import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/products_provider.dart';
import '../../shared/product_card.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final searchAsync = ref.watch(searchProductsProvider(_searchQuery));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('البحث'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: TextField(
              controller: _searchController,
              autofocus: true,
              onChanged: (val) {
                // simple debounce or just update directly if small set
                setState(() => _searchQuery = val);
              },
              decoration: InputDecoration(
                hintText: 'ابحث عن شوكولاتة، كوكيز...',
                prefixIcon: const Icon(Iconsax.search_normal),
                suffixIcon: _searchQuery.isNotEmpty 
                  ? IconButton(
                      icon: const Icon(Iconsax.close_circle),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
              ),
            ),
          ),
        ),
      ),
      body: _searchQuery.trim().isEmpty
        ? Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Iconsax.search_normal, size: 64, color: AppColors.textTertiary.withValues(alpha: 0.5)),
                const SizedBox(height: 16),
                Text('ما الذي تبحث عنه؟', style: AppTypography.titleMedium.copyWith(color: AppColors.textSecondary)),
              ],
            ),
          )
        : searchAsync.when(
            data: (products) {
              if (products.isEmpty) {
                return Center(
                  child: Text('لم يتم العثور على نتائج لـ "$_searchQuery"', style: AppTypography.bodyMedium),
                );
              }
              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: products.length,
                itemBuilder: (context, index) {
                  return ProductCard(
                    product: products[index],
                    isList: true, // Use the horizontal list design for search results
                  );
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => Center(child: Text('خطأ: $err')),
          ),
    );
  }
}
