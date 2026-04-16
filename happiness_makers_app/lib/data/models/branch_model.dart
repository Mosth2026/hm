/// Branch model matching Supabase branches table
class BranchModel {
  final int id;
  final String name;
  final String whatsappNumber;
  final double latitude;
  final double longitude;
  final bool isActive;

  const BranchModel({
    required this.id,
    required this.name,
    required this.whatsappNumber,
    required this.latitude,
    required this.longitude,
    this.isActive = true,
  });

  factory BranchModel.fromJson(Map<String, dynamic> json) {
    return BranchModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name']?.toString() ?? '',
      whatsappNumber: json['whatsapp_number']?.toString() ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      isActive: json['is_active'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'whatsapp_number': whatsappNumber,
        'latitude': latitude,
        'longitude': longitude,
        'is_active': isActive,
      };
}
