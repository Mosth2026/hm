import 'dart:math';
import '../datasources/supabase_service.dart';
import '../models/branch_model.dart';

/// Repository for branch data
class BranchRepository {
  /// Fetch active branches
  Future<List<BranchModel>> getBranches() async {
    final response = await SupabaseService.from('branches')
        .select()
        .eq('is_active', true);

    return (response as List<dynamic>)
        .map((json) => BranchModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Find nearest branch to given coordinates
  BranchModel? findNearestBranch(
    double lat,
    double lng,
    List<BranchModel> branches,
  ) {
    if (branches.isEmpty) return null;

    BranchModel nearest = branches.first;
    double minDistance = _calculateDistance(
      lat, lng, nearest.latitude, nearest.longitude,
    );

    for (final branch in branches) {
      final dist = _calculateDistance(
        lat, lng, branch.latitude, branch.longitude,
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearest = branch;
      }
    }

    return nearest;
  }

  /// Haversine distance calculation (in km)
  double _calculateDistance(
    double lat1, double lon1,
    double lat2, double lon2,
  ) {
    const R = 6371.0; // Earth radius in km
    final dLat = _toRadians(lat2 - lat1);
    final dLon = _toRadians(lon2 - lon1);
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_toRadians(lat1)) *
            cos(_toRadians(lat2)) *
            sin(dLon / 2) *
            sin(dLon / 2);
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return R * c;
  }

  double _toRadians(double degrees) => degrees * pi / 180;
}
