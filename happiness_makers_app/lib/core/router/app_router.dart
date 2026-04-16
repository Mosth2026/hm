import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/categories/category_products_screen.dart';
import '../../features/product_details/product_details_screen.dart';
import '../../features/cart/cart_screen.dart';
import '../../features/checkout/checkout_screen.dart';
import '../../features/orders/my_orders_screen.dart';
import '../../features/orders/order_tracking_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/search/search_screen.dart';
import '../../features/shell/app_shell.dart';
import '../../features/admin/admin_dashboard_screen.dart';
import '../../features/admin/category_manager_screen.dart';
import '../../features/admin/banner_manager_screen.dart';

/// Router provider to handle hot restarts correctly with Riverpod
final routerProvider = Provider<GoRouter>((ref) {
  final rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
  final shellNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'shell');

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    routes: [
      // Splash screen (no shell)
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // Admin Routes (Hidden)
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: '/admin/categories',
        builder: (context, state) => const CategoryManagerScreen(),
      ),
      GoRoute(
        path: '/admin/banner',
        builder: (context, state) => const BannerManagerScreen(),
      ),

      // Login screen (no shell)
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),

      // Main app with bottom nav shell
      ShellRoute(
        navigatorKey: shellNavigatorKey,
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: HomeScreen(),
            ),
          ),
          GoRoute(
            path: '/search',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: SearchScreen(),
            ),
          ),
          GoRoute(
            path: '/cart',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: CartScreen(),
            ),
          ),
          GoRoute(
            path: '/my-orders',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: MyOrdersScreen(),
            ),
          ),
        ],
      ),

      // Full-screen routes (no bottom nav)
      GoRoute(
        path: '/category/:categoryId',
        builder: (context, state) => CategoryProductsScreen(
          categoryId: state.pathParameters['categoryId'] ?? '',
        ),
      ),
      GoRoute(
        path: '/product/:productId',
        builder: (context, state) => ProductDetailsScreen(
          productId: int.tryParse(state.pathParameters['productId'] ?? '') ?? 0,
        ),
      ),
      GoRoute(
        path: '/checkout',
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: '/order-tracking/:orderId',
        builder: (context, state) => OrderTrackingScreen(
          orderId: int.tryParse(state.pathParameters['orderId'] ?? '') ?? 0,
        ),
      ),
    ],
  );
});
