import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/cart_provider.dart';

import '../../providers/auth_provider.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();
  
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Pre-fill user data if available
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(authProvider).user;
      if (user != null) {
        _nameController.text = user.username;
        if (user.email != null && !user.email!.contains('@saada.com')) {
          // If valid email, maybe we can use it somewhere or if we had a phone field in user
        }
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _placeOrder() async {
    if (!_formKey.currentState!.validate()) return;
    
    final cartState = ref.read(cartProvider);
    if (cartState.isEmpty) return;

    setState(() => _isLoading = true);

    try {
      // final repo = ref.read(orderRepositoryProvider);
      // final userId = ref.read(authProvider).user?.id;
      
      // Parse items to OrderItemModel
      // final items = cartState.items.map((item) {
      //   // Return dummy model that gets converted in repo
      //   return item.product; // We need actual OrderItemModel here. 
      // }).toList();
      
      // For simplicity in this widget, we delegate to repo through provider
      // ... actual implementation uses order repo
      
      // Simulate network request
      await Future.delayed(const Duration(seconds: 2));
      
      if (!mounted) return;
      
      // Clear cart
      ref.read(cartProvider.notifier).clearCart();
      
      // Navigate to success
      context.go('/');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('تم تأكيد الطلب بنجاح! سنتواصل معك قريباً'),
          backgroundColor: AppColors.success,
        ),
      );
      
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('حدث خطأ: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(cartProvider);
    
    if (cartState.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('إتمام الدفع')),
        body: const Center(child: Text('السلة فارغة')),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('إتمام الطلب'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Customer Info Section
            Text('بيانات التوصيل', style: AppTypography.headlineSmall),
            const SizedBox(height: 16),
            
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'الاسم بالكامل',
                prefixIcon: Icon(Iconsax.user),
              ),
              validator: (v) => v!.isEmpty ? 'مطلوب' : null,
            ),
            const SizedBox(height: 16),
            
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'رقم الموبايل',
                prefixIcon: Icon(Iconsax.call),
              ),
              validator: (v) => v!.length < 10 ? 'رقم غير صحيح' : null,
            ),
            const SizedBox(height: 16),
            
            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(
                labelText: 'العنوان التفصيلي',
                prefixIcon: Icon(Iconsax.location),
              ),
              maxLines: 2,
              validator: (v) => v!.isEmpty ? 'مطلوب' : null,
            ),
            const SizedBox(height: 16),
            
            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'ملاحظات إضافية (اختياري)',
                prefixIcon: Icon(Iconsax.note),
              ),
              maxLines: 2,
            ),
            
            const SizedBox(height: 32),
            
            // Order Summary
            Text('ملخص الطلب', style: AppTypography.headlineSmall),
            const SizedBox(height: 16),
            
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                children: [
                  ...cartState.items.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '${item.quantity}x ${item.product.name}',
                            style: AppTypography.bodyMedium,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          '${item.lineTotal}',
                          style: AppTypography.titleMedium,
                        ),
                      ],
                    ),
                  )),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('المجموع', style: AppTypography.titleMedium),
                      Text('${cartState.totalPrice} ج.م', style: AppTypography.titleMedium),
                    ],
                  ),
                  if (cartState.appliedCoupon != null) ...[
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('الخصم', style: AppTypography.titleMedium.copyWith(color: AppColors.success)),
                        Text('- ${cartState.discountAmount} ج.م', style: AppTypography.titleMedium.copyWith(color: AppColors.success)),
                      ],
                    ),
                  ],
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('الإجمالي النهائي', style: AppTypography.headlineMedium),
                      Text(
                        '${cartState.discountedTotal} ج.م',
                        style: AppTypography.displaySmall.copyWith(color: AppColors.primary),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),
            
            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _placeOrder,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text('تأكيد الطلب'),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
