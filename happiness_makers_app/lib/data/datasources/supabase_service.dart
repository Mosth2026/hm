import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/constants/app_constants.dart';

/// Supabase client singleton
class SupabaseService {
  SupabaseService._();

  static SupabaseClient get client => Supabase.instance.client;

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: AppConstants.supabaseUrl,
      anonKey: AppConstants.supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
    );
  }

  /// Quick access to auth
  static GoTrueClient get auth => client.auth;

  /// Quick access to DB
  static SupabaseQueryBuilder from(String table) => client.from(table);

  /// Current user session
  static Session? get currentSession => client.auth.currentSession;

  /// Current user
  static User? get currentUser => client.auth.currentUser;

  /// Is authenticated
  static bool get isAuthenticated => currentSession != null;
}
