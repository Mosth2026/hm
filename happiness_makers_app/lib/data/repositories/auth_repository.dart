import '../datasources/supabase_service.dart';

/// User role types
enum UserRole { admin, editor, customer }

/// Simple user model
class AppUser {
  final String id;
  final String username;
  final String? email;
  final UserRole role;

  const AppUser({
    required this.id,
    required this.username,
    this.email,
    this.role = UserRole.customer,
  });
}

/// Repository for authentication operations
class AuthRepository {
  /// Login with email/password
  Future<({bool success, AppUser? user, String? error})> login(
    String emailRaw,
    String password,
  ) async {
    try {
      final email = emailRaw.trim().toLowerCase();
      final siteEmail = email.contains('@') ? email : '$email@saada.com';

      final response = await SupabaseService.auth.signInWithPassword(
        email: siteEmail,
        password: password,
      );

      if (response.user != null) {
        final user = _mapUser(response.user!);
        return (success: true, user: user, error: null);
      }

      return (success: false, user: null, error: 'حدث خطأ غير متوقع');
    } catch (e) {
      return (success: false, user: null, error: e.toString());
    }
  }

  /// Register a new user
  Future<({bool success, AppUser? user, String? error})> register(
    String email,
    String password,
    String username,
  ) async {
    try {
      final response = await SupabaseService.auth.signUp(
        email: email,
        password: password,
        data: {'username': username},
      );

      if (response.user != null) {
        final user = AppUser(
          id: response.user!.id,
          username: username,
          email: response.user!.email,
          role: UserRole.customer,
        );
        return (success: true, user: user, error: null);
      }

      return (success: false, user: null, error: 'خطأ أثناء التسجيل');
    } catch (e) {
      return (success: false, user: null, error: e.toString());
    }
  }

  /// Logout
  Future<void> logout() async {
    await SupabaseService.auth.signOut();
  }

  /// Get current user from session
  AppUser? getCurrentUser() {
    final supaUser = SupabaseService.currentUser;
    if (supaUser == null) return null;
    return _mapUser(supaUser);
  }

  /// Map Supabase user to AppUser
  AppUser _mapUser(dynamic supaUser) {
    final email = supaUser.email ?? '';
    final usernamePart = email.split('@').first;

    UserRole role = UserRole.customer;
    if (usernamePart.contains('admin')) {
      role = UserRole.admin;
    } else if (usernamePart.contains('editor')) {
      role = UserRole.editor;
    }

    return AppUser(
      id: supaUser.id,
      username: supaUser.userMetadata?['username'] ?? usernamePart,
      email: email,
      role: role,
    );
  }
}
