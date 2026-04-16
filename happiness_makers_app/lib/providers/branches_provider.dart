import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/repositories/branch_repository.dart';
import '../data/models/branch_model.dart';

/// Branch repository provider
final branchRepositoryProvider = Provider<BranchRepository>((ref) {
  return BranchRepository();
});

/// All branches provider
final branchesProvider = FutureProvider<List<BranchModel>>((ref) async {
  final repo = ref.read(branchRepositoryProvider);
  return repo.getBranches();
});

/// Selected branch provider
final selectedBranchProvider = StateProvider<BranchModel?>((ref) => null);
