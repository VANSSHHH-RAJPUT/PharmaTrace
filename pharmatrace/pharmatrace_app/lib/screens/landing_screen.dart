import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class LandingScreen extends StatelessWidget {
  final String? account;
  final VoidCallback onConnect;

  const LandingScreen({
    super.key,
    required this.account,
    required this.onConnect,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: [
          _HeroSection(account: account, onConnect: onConnect),
          _FeaturesSection(),
          _HowItWorksSection(),
          _CTASection(account: account, onConnect: onConnect),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  final String? account;
  final VoidCallback onConnect;
  const _HeroSection({required this.account, required this.onConnect});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(24, 60, 24, 60),
      child: Column(
        children: [
          // Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.cyan.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.bolt_rounded, color: AppColors.cyan, size: 14),
              const SizedBox(width: 6),
              Text('Powered by Ethereum Blockchain',
                  style: GoogleFonts.inter(
                      color: AppColors.cyan,
                      fontSize: 12,
                      fontWeight: FontWeight.w500)),
            ]),
          ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.3),

          const SizedBox(height: 28),

          // Headline
          ShaderMask(
            shaderCallback: (b) => const LinearGradient(
              colors: [Colors.white, Color(0xFFCDD5E0)],
            ).createShader(b),
            child: Text(
              'The Future of',
              textAlign: TextAlign.center,
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 38,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  height: 1.1),
            ),
          ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.3),

          ShaderMask(
            shaderCallback: (b) => const LinearGradient(
              colors: [AppColors.cyan, Color(0xFFa78bfa), AppColors.green],
            ).createShader(b),
            child: Text(
              'Pharma Supply Chains',
              textAlign: TextAlign.center,
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  height: 1.2),
            ),
          ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.3),

          const SizedBox(height: 20),

          // Description
          Text(
            'PharmaTrace brings enterprise-grade blockchain traceability to pharmaceutical supply chains. Track every product from lab to shelf with cryptographic certainty.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
                color: AppColors.textSecondary, fontSize: 15, height: 1.7),
          ).animate().fadeIn(delay: 300.ms),

          const SizedBox(height: 32),

          // Buttons
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            ElevatedButton.icon(
              onPressed: onConnect,
              icon: const Icon(Icons.account_balance_wallet_rounded, size: 16),
              label: Text(account != null ? 'Dashboard' : 'Connect Wallet'),
            ),
            const SizedBox(width: 12),
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.qr_code_scanner_rounded,
                  color: AppColors.cyan, size: 16),
              label: Text('Verify',
                  style: GoogleFonts.inter(color: AppColors.cyan)),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: AppColors.cyan.withOpacity(0.4)),
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ]).animate().fadeIn(delay: 400.ms).slideY(begin: 0.3),
        ],
      ),
    );
  }
}

class _FeaturesSection extends StatelessWidget {
  final _features = const [
    _Feature(Icons.lock_rounded, 'Immutable Records', AppColors.cyan,
        'Every product event permanently recorded on Ethereum — tamper-proof and verified.'),
    _Feature(Icons.flash_on_rounded, 'Real-Time Tracking', AppColors.green,
        'Monitor supply chain in real time from manufacturer to pharmacy shelf.'),
    _Feature(Icons.public_rounded, 'Global Compliance', Color(0xFFa78bfa),
        'Meets FDA DSCSA, EU FMD and WHO pharmaceutical traceability standards.'),
    _Feature(
        Icons.admin_panel_settings_rounded,
        'Role-Based Access',
        AppColors.amber,
        'Granular permissions for Manufacturers, Distributors, and Retailers.'),
  ];

  const _FeaturesSection();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 40),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.purple.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.purple.withOpacity(0.3)),
            ),
            child: Text('Platform Features',
                style: GoogleFonts.inter(
                    color: AppColors.purple,
                    fontSize: 12,
                    fontWeight: FontWeight.w500)),
          ),
          const SizedBox(height: 16),
          Text('Built for Enterprise.\nSecured by Blockchain.',
              textAlign: TextAlign.center,
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 26,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  height: 1.3)),
          const SizedBox(height: 24),
          ..._features.map((f) => _FeatureCard(feature: f)
              .animate()
              .fadeIn(duration: 500.ms)
              .slideX(begin: -0.1)),
        ],
      ),
    );
  }
}

class _Feature {
  final IconData icon;
  final String title;
  final Color color;
  final String desc;
  const _Feature(this.icon, this.title, this.color, this.desc);
}

class _FeatureCard extends StatelessWidget {
  final _Feature feature;
  const _FeatureCard({required this.feature});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: glassDecoration(borderColor: feature.color.withOpacity(0.2)),
      child: Row(children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: feature.color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: feature.color.withOpacity(0.3)),
          ),
          child: Icon(feature.icon, color: feature.color, size: 22),
        ),
        const SizedBox(width: 16),
        Expanded(
            child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(feature.title,
                style: GoogleFonts.spaceGrotesk(
                    color: AppColors.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            Text(feature.desc,
                style: GoogleFonts.inter(
                    color: AppColors.textSecondary, fontSize: 13, height: 1.5)),
          ],
        )),
      ]),
    );
  }
}

class _HowItWorksSection extends StatelessWidget {
  final _steps = const [
    _Step('01', 'Register',
        'Companies onboard with verified wallet addresses assigned roles by admin.'),
    _Step('02', 'Manufacture',
        'Manufacturers mint product entries with batch numbers on-chain.'),
    _Step('03', 'Distribute',
        'Products transfer through supply chain — every handoff recorded.'),
    _Step('04', 'Verify',
        'Retailers scan QR codes to view complete authenticated product history.'),
  ];

  const _HowItWorksSection();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 40),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.green.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.green.withOpacity(0.3)),
            ),
            child: Text('How It Works',
                style: GoogleFonts.inter(
                    color: AppColors.green,
                    fontSize: 12,
                    fontWeight: FontWeight.w500)),
          ),
          const SizedBox(height: 16),
          Text('From Factory to Pharmacy',
              textAlign: TextAlign.center,
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 26,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary)),
          const SizedBox(height: 24),
          ..._steps.asMap().entries.map((e) =>
              _StepCard(step: e.value, index: e.key, total: _steps.length)
                  .animate()
                  .fadeIn(delay: (e.key * 100).ms)
                  .slideX(begin: 0.1)),
        ],
      ),
    );
  }
}

class _Step {
  final String num, title, desc;
  const _Step(this.num, this.title, this.desc);
}

class _StepCard extends StatelessWidget {
  final _Step step;
  final int index, total;
  const _StepCard(
      {required this.step, required this.index, required this.total});

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Container(
        padding: const EdgeInsets.all(20),
        decoration: glassDecoration(),
        child: Row(children: [
          ShaderMask(
            shaderCallback: (b) => LinearGradient(colors: [
              AppColors.cyan.withOpacity(0.4),
              AppColors.purple.withOpacity(0.4),
            ]).createShader(b),
            child: Text(step.num,
                style: GoogleFonts.spaceGrotesk(
                    fontSize: 36,
                    fontWeight: FontWeight.w900,
                    color: Colors.white)),
          ),
          const SizedBox(width: 16),
          Expanded(
              child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(step.title,
                  style: GoogleFonts.spaceGrotesk(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text(step.desc,
                  style: GoogleFonts.inter(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                      height: 1.5)),
            ],
          )),
        ]),
      ),
      if (index < total - 1)
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Icon(Icons.keyboard_arrow_down_rounded,
              color: AppColors.cyan.withOpacity(0.4), size: 24),
        ),
    ]);
  }
}

class _CTASection extends StatelessWidget {
  final String? account;
  final VoidCallback onConnect;
  const _CTASection({required this.account, required this.onConnect});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 0),
      child: Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.cyan.withOpacity(0.06),
              AppColors.purple.withOpacity(0.06),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.cyan.withOpacity(0.2)),
        ),
        child: Column(children: [
          Icon(Icons.shield_rounded, color: AppColors.cyan, size: 44),
          const SizedBox(height: 16),
          Text('Ready to Secure\nYour Supply Chain?',
              textAlign: TextAlign.center,
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  height: 1.3)),
          const SizedBox(height: 12),
          Text(
            'Join pharmaceutical companies already using PharmaTrace to protect patients.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
                color: AppColors.textSecondary, fontSize: 14, height: 1.6),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onConnect,
            icon: const Icon(Icons.rocket_launch_rounded, size: 16),
            label: const Text('Launch App'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 50),
            ),
          ),
        ]),
      ).animate().fadeIn(duration: 600.ms),
    );
  }
}
