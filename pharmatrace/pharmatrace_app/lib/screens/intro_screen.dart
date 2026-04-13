import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';

class IntroScreen extends StatefulWidget {
  const IntroScreen({super.key});

  @override
  State<IntroScreen> createState() => _IntroScreenState();
}

class _IntroScreenState extends State<IntroScreen>
    with TickerProviderStateMixin {
  int _phase = 0;
  double _progress = 0;
  late AnimationController _progressController;

  @override
  void initState() {
    super.initState();
    _progressController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..addListener(() => setState(() => _progress = _progressController.value));
    _startSequence();
  }

  void _startSequence() async {
    await Future.delayed(800.ms);
    if (!mounted) return;
    setState(() => _phase = 1); // logo appears

    await Future.delayed(1200.ms);
    if (!mounted) return;
    setState(() => _phase = 2); // text appears

    await Future.delayed(1200.ms);
    if (!mounted) return;
    setState(() => _phase = 3); // tagline + loading bar
    _progressController.forward();

    await Future.delayed(1200.ms);
    if (!mounted) return;
    setState(() => _phase = 4); // fly to top

    await Future.delayed(900.ms);
    if (!mounted) return;
    _navigateHome();
  }

  void _navigateHome() {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const HomeScreen(),
        transitionDuration: const Duration(milliseconds: 800),
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
      ),
    );
  }

  @override
  void dispose() {
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Stack(
        children: [
          // Grid background
          CustomPaint(painter: _GridPainter(), size: Size.infinite),

          // Glow orb
          Center(
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [
                  AppColors.cyan.withOpacity(0.12),
                  Colors.transparent,
                ]),
              ),
            ),
          ).animate(onPlay: (c) => c.repeat(reverse: true)).scale(
              begin: const Offset(1, 1),
              end: const Offset(1.2, 1.2),
              duration: 2500.ms),

          // Main content — flies up when phase == 4
          AnimatedAlign(
            duration: const Duration(milliseconds: 800),
            curve: Curves.easeInOutCubic,
            alignment:
                _phase >= 4 ? const Alignment(-0.95, -0.95) : Alignment.center,
            child: AnimatedScale(
              scale: _phase >= 4 ? 0.38 : 1.0,
              duration: const Duration(milliseconds: 800),
              curve: Curves.easeInOutCubic,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Logo
                  AnimatedOpacity(
                    opacity: _phase >= 1 ? 1.0 : 0.0,
                    duration: 700.ms,
                    child: AnimatedScale(
                      scale: _phase >= 1 ? 1.0 : 0.4,
                      duration: 700.ms,
                      curve: Curves.elasticOut,
                      child: Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppColors.cyan, AppColors.purple],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.cyan.withOpacity(0.5),
                              blurRadius: 30,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: const Icon(Icons.shield_rounded,
                            color: Colors.white, size: 48),
                      ),
                    ).animate(onPlay: (c) => c.repeat(reverse: true)).custom(
                          duration: 2.seconds,
                          builder: (context, value, child) => Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(24),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.cyan
                                      .withOpacity(0.3 + value * 0.4),
                                  blurRadius: 20 + value * 20,
                                ),
                              ],
                            ),
                            child: child,
                          ),
                        ),
                  ),

                  const SizedBox(height: 20),

                  // PharmaTrace text
                  AnimatedOpacity(
                    opacity: _phase >= 2 ? 1.0 : 0.0,
                    duration: 700.ms,
                    child: AnimatedSlide(
                      offset: _phase >= 2 ? Offset.zero : const Offset(0, 0.3),
                      duration: 700.ms,
                      curve: Curves.easeOut,
                      child: ShaderMask(
                        shaderCallback: (bounds) => const LinearGradient(
                          colors: [AppColors.cyan, Color(0xFFa78bfa)],
                        ).createShader(bounds),
                        child: Text(
                          'PharmaTrace',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 42,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Tagline
          if (_phase == 3 || _phase == 2)
            Positioned(
              bottom: size.height * 0.38,
              left: 0,
              right: 0,
              child: AnimatedOpacity(
                opacity: _phase >= 2 ? 1.0 : 0.0,
                duration: 500.ms,
                child: Text(
                  'Securing Pharma Supply Chains on Blockchain',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    color: AppColors.cyan.withOpacity(0.5),
                    fontSize: 13,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
            ),

          // Loading bar
          Positioned(
            bottom: size.height * 0.32,
            left: size.width * 0.3,
            right: size.width * 0.3,
            child: AnimatedOpacity(
              opacity: _phase >= 3 ? 1.0 : 0.0,
              duration: 400.ms,
              child: Column(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: LinearProgressIndicator(
                      value: _progress,
                      minHeight: 2,
                      backgroundColor: AppColors.cyan.withOpacity(0.1),
                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.cyan),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Status text
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: AnimatedOpacity(
              opacity: _phase >= 2 && _phase < 4 ? 1.0 : 0.0,
              duration: 400.ms,
              child: Text(
                _phase == 2
                    ? 'INITIALIZING BLOCKCHAIN CONNECTION...'
                    : 'LOADING SMART CONTRACTS...',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  color: AppColors.cyan.withOpacity(0.35),
                  fontSize: 11,
                  letterSpacing: 3,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.cyan.withOpacity(0.04)
      ..strokeWidth = 1;
    const step = 60.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}
