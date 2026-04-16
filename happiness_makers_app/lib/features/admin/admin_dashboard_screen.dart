import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/glass_card.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Background Gradient Glow
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.accent.withValues(alpha: 0.1),
              ),
            ),
          ).animate().fadeIn(duration: 800.ms),

          CustomScrollView(
            slivers: [
              // ─── App Bar ───
              SliverAppBar(
                leading: IconButton(
                  icon: const Icon(Iconsax.arrow_right_3),
                  onPressed: () => context.pop(),
                ),
                title: Text('لوحة التحكم', style: AppTypography.headlineMedium),
                backgroundColor: Colors.transparent,
                centerTitle: true,
              ),

              // ─── Welcome Header ───
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'مرحباً بك في المنطقة الإدارية',
                        style: AppTypography.displaySmall,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'تحكم في المتجر الخاص بك بلمسات احترافية.',
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ),

              // ─── Admin Menu Grid ───
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.9,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                  ),
                  delegate: SliverChildListDelegate([
                    _buildAdminTile(
                      context,
                      'إدارة الأقسام',
                      'تعديل وإضافة الأقسام والهيكلية',
                      Iconsax.category_2,
                      AppColors.primary,
                      '/admin/categories',
                    ),
                    _buildAdminTile(
                      context,
                      'إدارة البانر',
                      'تثبيت المنتجات المميزة في السلايدر',
                      Iconsax.gallery_export,
                      AppColors.accentDark,
                      '/admin/banner',
                    ),
                    _buildAdminTile(
                      context,
                      'إدارة الطلبات',
                      'متابعة الطلبات الجاري تنفيذها',
                      Iconsax.document_copy,
                      Colors.blueGrey,
                      '/my-orders', // Reuse existing screen or create special admin view
                    ),
                    _buildAdminTile(
                      context,
                      'الإحصائيات',
                      'نظرة عامة على أداء المتجر',
                      Iconsax.status_up,
                      Colors.indigo,
                      '/', // Not implemented yet
                    ),
                  ]),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 50)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAdminTile(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    Color color,
    String route,
  ) {
    return GestureDetector(
      onTap: () => context.push(route),
      child: GlassCard(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const Spacer(),
              Text(
                title,
                style: AppTypography.titleLarge.copyWith(fontSize: 16),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: AppTypography.labelSmall.copyWith(color: AppColors.textTertiary, fontSize: 10),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    ).animate().scale(delay: 100.ms).fadeIn();
  }
}
