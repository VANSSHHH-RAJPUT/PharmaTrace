import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AnimatedBackground extends StatefulWidget {
  const AnimatedBackground({super.key});

  @override
  State<AnimatedBackground> createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late List<_Node> _nodes;
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat();
    _nodes = List.generate(60, (_) => _Node(_random));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) {
        for (final n in _nodes) {
          n.update(MediaQuery.of(context).size);
        }
        return CustomPaint(
          painter: _NetworkPainter(_nodes),
          size: Size.infinite,
        );
      },
    );
  }
}

class _Node {
  double x, y, vx, vy, radius, pulse;
  Color color;

  static const _colors = [
    Color(0xFF00D4FF),
    Color(0xFF7C3AED),
    Color(0xFF00FF88),
    Color(0xFFF59E0B),
    Color(0xFFEC4899),
  ];

  _Node(Random r)
      : x = r.nextDouble(),
        y = r.nextDouble(),
        vx = (r.nextDouble() - 0.5) * 0.0008,
        vy = (r.nextDouble() - 0.5) * 0.0008,
        radius = 1.5 + r.nextDouble() * 2,
        pulse = r.nextDouble() * pi * 2,
        color = _colors[r.nextInt(_colors.length)];

  void update(Size size) {
    x += vx;
    y += vy;
    pulse += 0.025;
    if (x < 0 || x > 1) vx *= -1;
    if (y < 0 || y > 1) vy *= -1;
    x = x.clamp(0.0, 1.0);
    y = y.clamp(0.0, 1.0);
  }

  Offset offset(Size size) => Offset(x * size.width, y * size.height);
}

class _NetworkPainter extends CustomPainter {
  final List<_Node> nodes;
  _NetworkPainter(this.nodes);

  @override
  void paint(Canvas canvas, Size size) {
    const maxDist = 150.0;

    for (int i = 0; i < nodes.length; i++) {
      for (int j = i + 1; j < nodes.length; j++) {
        final a = nodes[i].offset(size);
        final b = nodes[j].offset(size);
        final dist = (a - b).distance;
        if (dist < maxDist) {
          final opacity = (1 - dist / maxDist) * 0.35;
          final paint = Paint()
            ..shader = LinearGradient(colors: [
              nodes[i].color.withOpacity(opacity),
              nodes[j].color.withOpacity(opacity),
            ]).createShader(Rect.fromPoints(a, b))
            ..strokeWidth = 0.8
            ..style = PaintingStyle.stroke;
          canvas.drawLine(a, b, paint);
        }
      }
    }

    for (final n in nodes) {
      final pos = n.offset(size);
      final glow = 0.6 + 0.4 * sin(n.pulse);

      // Glow halo
      final haloPaint = Paint()
        ..shader = RadialGradient(colors: [
          n.color.withOpacity(0.25 * glow),
          Colors.transparent,
        ]).createShader(Rect.fromCircle(center: pos, radius: n.radius * 5))
        ..style = PaintingStyle.fill;
      canvas.drawCircle(pos, n.radius * 5, haloPaint);

      // Core dot
      final dotPaint = Paint()
        ..color = n.color.withOpacity(0.85 * glow)
        ..style = PaintingStyle.fill
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, 2);
      canvas.drawCircle(pos, n.radius, dotPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => true;
}
