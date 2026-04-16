import 'package:flutter/material.dart';

/// Premium color palette for Happiness Makers
/// Inspired by the brand's chocolate & gold identity
class AppColors {
  AppColors._();

  // ─── Brand Primary (Dark elegant from logo) ───
  static const Color primary = Color(0xFF1A1A2E);
  static const Color primaryDark = Color(0xFF0F0F1A);
  static const Color primaryLight = Color(0xFF16213E);

  // ─── Brand Accent (Warm gold/chocolate tones) ───
  static const Color accent = Color(0xFFD4A574);
  static const Color accentLight = Color(0xFFF5E6D3);
  static const Color accentDark = Color(0xFFB8864A);
  static const Color chocolate = Color(0xFF6B3A2A);
  static const Color chocolateLight = Color(0xFF8B5E3C);

  // ─── Brand Red (from logo wrapper) ───
  static const Color brandRed = Color(0xFFE53935);
  static const Color brandRedLight = Color(0xFFFF6F60);

  // ─── Background (Cream/Off-white luxury feel) ───
  static const Color background = Color(0xFFFAF8F5);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF5F0EB);
  static const Color cardBackground = Color(0xFFFFFFFF);

  // ─── Text ───
  static const Color textPrimary = Color(0xFF1A1A2E);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textTertiary = Color(0xFF9CA3AF);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnAccent = Color(0xFF1A1A2E);

  // ─── Status Colors ───
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFD1FAE5);
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color info = Color(0xFF3B82F6);

  // ─── Badge Colors ───
  static const Color newBadge = Color(0xFF10B981);
  static const Color saleBadge = Color(0xFFFF6B35);
  static const Color featuredBadge = Color(0xFFD4A574);

  // ─── UI Elements ───
  static const Color divider = Color(0xFFE5E7EB);
  static const Color border = Color(0xFFE5E7EB);
  static const Color borderLight = Color(0xFFF3F4F6);
  static const Color shadow = Color(0x0A000000);
  static const Color shimmerBase = Color(0xFFF3F4F6);
  static const Color shimmerHighlight = Color(0xFFFFFFFF);
  static const Color overlay = Color(0x80000000);

  // ─── Bottom Nav ───
  static const Color navActive = Color(0xFFD4A574);
  static const Color navInactive = Color(0xFF9CA3AF);
  static const Color navBackground = Color(0xFFFFFFFF);

  // ─── Glassmorphism & Futurism ───
  static Color glassWhite(double opacity) => Colors.white.withAlpha((opacity * 255).toInt());
  static Color glassBlack(double opacity) => Colors.black.withAlpha((opacity * 255).toInt());
  
  static Color glassPrimary(double opacity) => primary.withAlpha((opacity * 255).toInt());
  static Color glassAccent(double opacity) => accent.withAlpha((opacity * 255).toInt());

  static const Color glowGold = Color(0xFFFFD700);
  static const Color neonGlow = Color(0x40D4A574);

  // ─── Gradient Presets (Futuristic) ───
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF1A1A2E), Color(0xFF16213E)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [Color(0xFFD4A574), Color(0xFFB8864A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient glassGradient = LinearGradient(
    colors: [
      Color(0x33FFFFFF),
      Color(0x0FFFFFFF),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient goldGlowGradient = LinearGradient(
    colors: [
      Color(0xFFD4A574),
      Color(0xFFFFD700),
      Color(0xFFD4A574),
    ],
    stops: [0.0, 0.5, 1.0],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
