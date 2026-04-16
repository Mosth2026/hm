import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// Premium typography system for Happiness Makers (Vision 2050)
/// Uses Outfit for a modern, geometric, and clean tech-forward look
class AppTypography {
  AppTypography._();

  // ─── Geometric Font Family ───
  static final String fontFamily = GoogleFonts.outfit().fontFamily!;
  static final String arabicFontFamily = GoogleFonts.cairo().fontFamily!;

  // ─── Base Styles ───
  static TextStyle get _baseStyle => TextStyle(
        fontFamily: fontFamily,
        color: AppColors.textPrimary,
        height: 1.2,
      );

  // ─── Display Styles ───
  static TextStyle get displayLarge => _baseStyle.copyWith(
        fontSize: 34,
        fontWeight: FontWeight.w800,
        letterSpacing: -1,
      );

  static TextStyle get displayMedium => _baseStyle.copyWith(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
      );

  static TextStyle get displaySmall => _baseStyle.copyWith(
        fontSize: 24,
        fontWeight: FontWeight.w700,
      );

  // ─── Headline Styles ───
  static TextStyle get headlineLarge => _baseStyle.copyWith(
        fontSize: 22,
        fontWeight: FontWeight.w700,
      );

  static TextStyle get headlineMedium => _baseStyle.copyWith(
        fontSize: 20,
        fontWeight: FontWeight.w700,
      );

  static TextStyle get headlineSmall => _baseStyle.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w600,
      );

  // ─── Title Styles ───
  static TextStyle get titleLarge => _baseStyle.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w600,
      );

  static TextStyle get titleMedium => _baseStyle.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w600,
      );

  static TextStyle get titleSmall => _baseStyle.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
      );

  // ─── Body Styles ───
  static TextStyle get bodyLarge => _baseStyle.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w400,
      );

  static TextStyle get bodyMedium => _baseStyle.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w400,
      );

  static TextStyle get bodySmall => _baseStyle.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w400,
      );

  // ─── Label Styles ───
  static TextStyle get labelLarge => _baseStyle.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
      );

  static TextStyle get labelMedium => _baseStyle.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w500,
      );

  static TextStyle get labelSmall => _baseStyle.copyWith(
        fontSize: 10,
        fontWeight: FontWeight.w400,
        letterSpacing: 1.5,
      );

  // ─── Button Styles ───
  static TextStyle get button => _baseStyle.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
      );

  static TextStyle get buttonSmall => _baseStyle.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
      );

  // ─── Price Styles ───
  static TextStyle get priceLarge => _baseStyle.copyWith(
        fontSize: 22,
        fontWeight: FontWeight.w800,
        color: AppColors.primary,
      );

  static TextStyle get priceMedium => _baseStyle.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: AppColors.primary,
      );

  static TextStyle get priceOld => _baseStyle.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: AppColors.textTertiary,
        decoration: TextDecoration.lineThrough,
      );

  static TextStyle get priceSmall => _baseStyle.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w700,
        color: AppColors.primary,
      );

  static TextStyle get currency => _baseStyle.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: AppColors.textSecondary,
      );

  // ─── Badge Styles ───
  static TextStyle get badge => _baseStyle.copyWith(
        fontSize: 10,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      );

  // ─── Futuristic Outlined Style ───
  static TextStyle get futuristicLabel => _baseStyle.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w800,
        letterSpacing: 1.5,
        color: AppColors.accent,
      );
}
