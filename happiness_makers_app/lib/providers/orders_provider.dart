import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/repositories/order_repository.dart';
import '../data/models/order_model.dart';
import 'auth_provider.dart';

/// Order repository provider
final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  return OrderRepository();
});

/// My orders provider
final myOrdersProvider = FutureProvider<List<OrderModel>>((ref) async {
  final auth = ref.watch(authProvider);
  if (auth.user == null) return [];

  final repo = ref.read(orderRepositoryProvider);
  return repo.getMyOrders(auth.user!.id);
});
