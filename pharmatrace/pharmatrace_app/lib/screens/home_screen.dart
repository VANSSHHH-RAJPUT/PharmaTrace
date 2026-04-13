import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../components/animated_background.dart';
import 'landing_screen.dart';
import 'dashboard_screen.dart';
import 'verify_screen.dart';
import 'admin_screen.dart';
import '../utils/web3_service.dart';
import '../main.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  String? _account;
  int _role = 0;
  String _actorName = '';
  bool _connecting = false;

  final List<Widget> _screens = [];

  @override
  void initState() {
    super.initState();
    _buildScreens();
  }

  void _buildScreens() {
    setState(() {});
  }

  Future<void> _connectWallet() async {
    setState(() => _connecting = true);
    _showPrivateKeyDialog();
  }

  void _showPrivateKeyDialog() {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgSecondary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                      colors: [AppColors.cyan, AppColors.purple]),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.account_balance_wallet_rounded,
                    color: Colors.white, size: 20),
              ),
              const SizedBox(width: 12),
              Text('Connect Wallet',
                  style: GoogleFonts.spaceGrotesk(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary)),
            ]),
            const SizedBox(height: 8),
            Text('Enter your Hardhat private key to connect',
                style: GoogleFonts.inter(
                    color: AppColors.textSecondary, fontSize: 13)),
            const SizedBox(height: 20),
            TextField(
              controller: controller,
              style:
                  GoogleFonts.inter(color: AppColors.textPrimary, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Private Key',
                hintText: '0xac0974bec...',
                prefixIcon: Icon(Icons.key_rounded,
                    color: AppColors.cyan.withOpacity(0.7), size: 18),
              ),
              obscureText: true,
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.amber.withOpacity(0.08),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.amber.withOpacity(0.2)),
              ),
              child: Row(children: [
                Icon(Icons.warning_rounded, color: AppColors.amber, size: 14),
                const SizedBox(width: 8),
                Expanded(
                    child: Text(
                  'Only use Hardhat test accounts. Never use real private keys.',
                  style:
                      GoogleFonts.inter(color: AppColors.amber, fontSize: 12),
                )),
              ]),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  final key = controller.text.trim();
                  if (key.isEmpty) return;
                  Navigator.pop(ctx);
                  try {
                    web3Service.setPrivateKey(key);
                    final actor = await web3Service
                        .getActor(web3Service.connectedAddress!);
                    setState(() {
                      _account = web3Service.connectedAddress;
                      _role = actor['role'] as int;
                      _actorName = actor['name'] as String;
                      _connecting = false;
                    });
                  } catch (e) {
                    setState(() {
                      _account = web3Service.connectedAddress;
                      _role = 0;
                      _connecting = false;
                    });
                  }
                },
                child: const Text('Connect'),
              ),
            ),
          ],
        ),
      ),
    ).whenComplete(() => setState(() => _connecting = false));
  }

  void _disconnect() {
    setState(() {
      _account = null;
      _role = 0;
      _actorName = '';
    });
  }

  List<Widget> get _pages => [
        LandingScreen(account: _account, onConnect: _connectWallet),
        DashboardScreen(account: _account, role: _role),
        VerifyScreen(account: _account),
        AdminScreen(account: _account, role: _role),
      ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: AppColors.bgSecondary.withOpacity(0.95),
        elevation: 0,
        title: Row(children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                  colors: [AppColors.cyan, AppColors.purple]),
              borderRadius: BorderRadius.circular(8),
            ),
            child:
                const Icon(Icons.shield_rounded, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 8),
          ShaderMask(
            shaderCallback: (b) => const LinearGradient(
              colors: [AppColors.cyan, Color(0xFFa78bfa)],
            ).createShader(b),
            child: Text('PharmaTrace',
                style: GoogleFonts.spaceGrotesk(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.white)),
          ),
        ]),
        actions: [
          if (_account != null) ...[
            Container(
              margin: const EdgeInsets.only(right: 4),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.cyan.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
              ),
              child: Text(
                _actorName.isNotEmpty
                    ? _actorName
                    : '${_account!.substring(0, 6)}...',
                style: GoogleFonts.inter(
                    color: AppColors.cyan,
                    fontSize: 12,
                    fontWeight: FontWeight.w500),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.logout_rounded,
                  color: Colors.redAccent, size: 18),
              onPressed: _disconnect,
            ),
          ] else
            TextButton.icon(
              onPressed: _connecting ? null : _connectWallet,
              icon: _connecting
                  ? const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: AppColors.cyan))
                  : const Icon(Icons.account_balance_wallet_rounded,
                      color: AppColors.cyan, size: 16),
              label: Text(_connecting ? 'Connecting...' : 'Connect',
                  style: GoogleFonts.inter(
                      color: AppColors.cyan,
                      fontSize: 13,
                      fontWeight: FontWeight.w600)),
            ),
          const SizedBox(width: 8),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [
                Colors.transparent,
                AppColors.cyan.withOpacity(0.2),
                Colors.transparent,
              ]),
            ),
          ),
        ),
      ),
      body: Stack(
        children: [
          const AnimatedBackground(),
          _pages[_currentIndex],
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.bgSecondary,
          border: Border(
            top: BorderSide(color: AppColors.cyan.withOpacity(0.1)),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: AppColors.cyan,
          unselectedItemColor: AppColors.textSecondary,
          selectedLabelStyle:
              GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600),
          unselectedLabelStyle: GoogleFonts.inter(fontSize: 11),
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
                icon: Icon(Icons.home_rounded), label: 'Home'),
            BottomNavigationBarItem(
                icon: Icon(Icons.dashboard_rounded), label: 'Dashboard'),
            BottomNavigationBarItem(
                icon: Icon(Icons.qr_code_scanner_rounded), label: 'Verify'),
            BottomNavigationBarItem(
                icon: Icon(Icons.admin_panel_settings_rounded), label: 'Admin'),
          ],
        ),
      ),
    );
  }
}
