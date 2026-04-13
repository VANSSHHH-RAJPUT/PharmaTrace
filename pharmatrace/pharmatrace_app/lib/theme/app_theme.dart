import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const bg = Color(0xFF020817);
  static const bgSecondary = Color(0xFF0A1628);
  static const cyan = Color(0xFF00D4FF);
  static const purple = Color(0xFF7C3AED);
  static const green = Color(0xFF00FF88);
  static const amber = Color(0xFFF59E0B);
  static const pink = Color(0xFFEC4899);
  static const textPrimary = Color(0xFFF0F4FF);
  static const textSecondary = Color(0xFF8892A4);
  static const cardBg = Color(0xCC0A1628);
}

class AppTheme {
  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.bg,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.cyan,
          secondary: AppColors.purple,
          surface: AppColors.bgSecondary,
        ),
        textTheme: GoogleFonts.interTextTheme(
          ThemeData.dark().textTheme,
        ).copyWith(
          displayLarge: GoogleFonts.spaceGrotesk(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w800,
          ),
          displayMedium: GoogleFonts.spaceGrotesk(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
          headlineLarge: GoogleFonts.spaceGrotesk(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
          headlineMedium: GoogleFonts.spaceGrotesk(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
          bodyLarge: GoogleFonts.inter(color: AppColors.textPrimary),
          bodyMedium: GoogleFonts.inter(color: AppColors.textSecondary),
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          titleTextStyle: GoogleFonts.spaceGrotesk(
            color: AppColors.cyan,
            fontWeight: FontWeight.w700,
            fontSize: 20,
          ),
          iconTheme: const IconThemeData(color: AppColors.cyan),
        ),
        // ✅ Fixed: CardThemeData instead of CardTheme
        cardTheme: CardThemeData(
          color: AppColors.cardBg,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: AppColors.cyan.withOpacity(0.15)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white.withOpacity(0.04),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: AppColors.cyan.withOpacity(0.15)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: AppColors.cyan.withOpacity(0.15)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: AppColors.cyan),
          ),
          hintStyle:
              GoogleFonts.inter(color: AppColors.textSecondary, fontSize: 14),
          labelStyle:
              GoogleFonts.inter(color: AppColors.textSecondary, fontSize: 13),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.cyan,
            foregroundColor: AppColors.bg,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            textStyle:
                GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 15),
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: AppColors.bgSecondary,
          selectedItemColor: AppColors.cyan,
          unselectedItemColor: AppColors.textSecondary,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
        ),
      );
}

// Reusable glass card decoration
BoxDecoration glassDecoration({Color? borderColor, double radius = 16}) =>
    BoxDecoration(
      color: AppColors.cardBg,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(
        color: borderColor ?? AppColors.cyan.withOpacity(0.15),
        width: 1,
      ),
      boxShadow: [
        BoxShadow(
          color: AppColors.cyan.withOpacity(0.05),
          blurRadius: 20,
          spreadRadius: 0,
        ),
      ],
    );
