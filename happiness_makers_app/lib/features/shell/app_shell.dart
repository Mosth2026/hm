import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/cart_provider.dart';

/// The main application shell with bottom navigation
class AppShell extends StatelessWidget {
  final Widget child;

  const AppShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    
    // Determine selected index
    int currentIndex = _calculateSelectedIndex(location);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: AppColors.shadow.withValues(alpha: 0.05),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          child: BottomNavigationBar(
            currentIndex: currentIndex,
            onTap: (index) => _onItemTapped(index, context),
            items: [
              const BottomNavigationBarItem(
                icon: Icon(Iconsax.home),
                activeIcon: Icon(Iconsax.home_15),
                label: 'الرئيسية',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Iconsax.search_normal),
                activeIcon: Icon(Iconsax.search_normal_15),
                label: 'البحث',
              ),
              BottomNavigationBarItem(
                icon: Consumer(
                  builder: (context, ref, _) {
                    final cartCount = ref.watch(cartProvider.select((state) => state.itemCount));
                    return Badge(
                      label: Text(cartCount.toString()),
                      isLabelVisible: cartCount > 0,
                      backgroundColor: AppColors.brandRed,
                      child: const Icon(Iconsax.shopping_cart),
                    );
                  },
                ),
                activeIcon: Consumer(
                  builder: (context, ref, _) {
                    final cartCount = ref.watch(cartProvider.select((state) => state.itemCount));
                    return Badge(
                      label: Text(cartCount.toString()),
                      isLabelVisible: cartCount > 0,
                      backgroundColor: AppColors.brandRed,
                      child: const Icon(Iconsax.shopping_cart5),
                    );
                  },
                ),
                label: 'السلة',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Iconsax.receipt_2),
                activeIcon: Icon(Iconsax.receipt_25),
                label: 'المشتريات',
              ),
            ],
          ),
        ),
      ),
    );
  }

  static int _calculateSelectedIndex(String location) {
    if (location.startsWith('/search')) return 1;
    if (location.startsWith('/cart')) return 2;
    if (location.startsWith('/my-orders')) return 3;
    return 0; // Default to home
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/search');
        break;
      case 2:
        context.go('/cart');
        break;
      case 3:
        context.go('/my-orders');
        break;
    }
  }
}
