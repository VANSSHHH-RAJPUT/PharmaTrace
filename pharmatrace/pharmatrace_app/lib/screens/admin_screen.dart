import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../utils/contract_utils.dart';
import '../utils/web3_service.dart';
import '../main.dart';

class AdminScreen extends StatefulWidget {
  final String? account;
  final int role;
  const AdminScreen({super.key, required this.account, required this.role});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.account == null) {
      return Center(
        child: Text('Connect wallet to access Admin',
            style: GoogleFonts.inter(color: AppColors.textSecondary)),
      );
    }

    if (widget.role != 4) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.lock_rounded,
                color: Colors.redAccent.withOpacity(0.6), size: 56),
            const SizedBox(height: 16),
            Text('Admin Access Only',
                style: GoogleFonts.spaceGrotesk(
                    color: AppColors.textPrimary,
                    fontSize: 20,
                    fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text('You must be registered as Admin to access this page.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                    color: AppColors.textSecondary, fontSize: 14)),
          ]),
        ),
      );
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Admin Panel',
                  style: GoogleFonts.spaceGrotesk(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary)),
              const SizedBox(height: 4),
              Text('Manage actors and system settings',
                  style: GoogleFonts.inter(
                      color: AppColors.textSecondary, fontSize: 13)),
              const SizedBox(height: 16),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.bgSecondary,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cyan.withOpacity(0.1)),
                ),
                child: TabBar(
                  controller: _tabs,
                  indicatorColor: AppColors.cyan,
                  indicatorSize: TabBarIndicatorSize.tab,
                  labelColor: AppColors.cyan,
                  unselectedLabelColor: AppColors.textSecondary,
                  labelStyle: GoogleFonts.inter(
                      fontWeight: FontWeight.w600, fontSize: 13),
                  tabs: const [
                    Tab(text: 'Register Actor'),
                    Tab(text: 'Lookup Actor'),
                  ],
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabs,
            children: [
              _RegisterTab(),
              _LookupTab(),
            ],
          ),
        ),
      ],
    );
  }
}

class _RegisterTab extends StatefulWidget {
  @override
  State<_RegisterTab> createState() => _RegisterTabState();
}

class _RegisterTabState extends State<_RegisterTab> {
  final _wallet = TextEditingController();
  final _name = TextEditingController();
  int _role = 1;
  bool _loading = false;
  String _msg = '';

  Future<void> _register() async {
    if (_wallet.text.isEmpty || _name.text.isEmpty) {
      setState(() => _msg = 'Please fill all fields');
      return;
    }
    setState(() {
      _loading = true;
      _msg = '';
    });
    try {
      await web3Service.registerActor(
          _wallet.text.trim(), _name.text.trim(), _role);
      setState(() => _msg = '✅ Actor registered successfully!');
      _wallet.clear();
      _name.clear();
    } catch (e) {
      setState(() => _msg = '❌ ${e.toString().split(']').last}');
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: glassDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppColors.cyan.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                      border:
                          Border.all(color: AppColors.cyan.withOpacity(0.3)),
                    ),
                    child: const Icon(Icons.person_add_rounded,
                        color: AppColors.cyan, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Text('Register New Actor',
                      style: GoogleFonts.spaceGrotesk(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary)),
                ]),

                const SizedBox(height: 20),

                TextField(
                  controller: _wallet,
                  style: GoogleFonts.inter(
                      color: AppColors.textPrimary, fontSize: 13),
                  decoration: const InputDecoration(
                    labelText: 'Wallet Address',
                    prefixIcon: Icon(Icons.account_balance_wallet_rounded,
                        color: AppColors.cyan, size: 18),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _name,
                  style: GoogleFonts.inter(
                      color: AppColors.textPrimary, fontSize: 13),
                  decoration: const InputDecoration(
                    labelText: 'Actor Name / Company',
                    prefixIcon: Icon(Icons.business_rounded,
                        color: AppColors.cyan, size: 18),
                  ),
                ),

                const SizedBox(height: 16),
                Text('Select Role',
                    style: GoogleFonts.inter(
                        color: AppColors.textSecondary, fontSize: 13)),
                const SizedBox(height: 10),

                // Role selector
                ...roles.entries.where((e) => e.key > 0).map((e) {
                  final colors = [
                    AppColors.cyan,
                    AppColors.purple,
                    AppColors.green,
                    Colors.redAccent
                  ];
                  final c = colors[(e.key - 1).clamp(0, 3)];
                  return GestureDetector(
                    onTap: () => setState(() => _role = e.key),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: _role == e.key
                            ? c.withOpacity(0.12)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: _role == e.key
                              ? c.withOpacity(0.5)
                              : c.withOpacity(0.15),
                        ),
                      ),
                      child: Row(children: [
                        Icon(Icons.circle,
                            color: _role == e.key ? c : c.withOpacity(0.3),
                            size: 10),
                        const SizedBox(width: 12),
                        Text(e.value,
                            style: GoogleFonts.inter(
                                color: _role == e.key
                                    ? c
                                    : AppColors.textSecondary,
                                fontSize: 14,
                                fontWeight: _role == e.key
                                    ? FontWeight.w600
                                    : FontWeight.w400)),
                        if (_role == e.key) ...[
                          const Spacer(),
                          Icon(Icons.check_circle_rounded, color: c, size: 16),
                        ],
                      ]),
                    ),
                  );
                }),

                if (_msg.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _msg.startsWith('✅')
                          ? AppColors.green.withOpacity(0.08)
                          : Colors.redAccent.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: _msg.startsWith('✅')
                            ? AppColors.green.withOpacity(0.3)
                            : Colors.redAccent.withOpacity(0.3),
                      ),
                    ),
                    child: Text(_msg,
                        style: GoogleFonts.inter(
                            color: _msg.startsWith('✅')
                                ? AppColors.green
                                : Colors.redAccent,
                            fontSize: 13)),
                  ),
                ],

                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _loading ? null : _register,
                    icon: _loading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: AppColors.bg))
                        : const Icon(Icons.person_add_rounded, size: 16),
                    label: Text(_loading ? 'Registering...' : 'Register Actor'),
                  ),
                ),
              ],
            ),
          ).animate().fadeIn().slideY(begin: 0.1),
        ],
      ),
    );
  }
}

class _LookupTab extends StatefulWidget {
  @override
  State<_LookupTab> createState() => _LookupTabState();
}

class _LookupTabState extends State<_LookupTab> {
  final _ctrl = TextEditingController();
  Map<String, dynamic>? _actor;
  bool _loading = false;
  String _msg = '';

  Future<void> _lookup() async {
    if (_ctrl.text.isEmpty) {
      setState(() => _msg = 'Enter a wallet address');
      return;
    }
    setState(() {
      _loading = true;
      _msg = '';
      _actor = null;
    });
    try {
      final a = await web3Service.getActor(_ctrl.text.trim());
      if (!(a['exists'] as bool)) {
        setState(() => _msg = '⚠️ This wallet is not registered.');
      } else {
        setState(() => _actor = a);
      }
    } catch (e) {
      setState(() => _msg = '❌ ${e.toString().split(']').last}');
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: glassDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppColors.purple.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                      border:
                          Border.all(color: AppColors.purple.withOpacity(0.3)),
                    ),
                    child: const Icon(Icons.search_rounded,
                        color: AppColors.purple, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Text('Lookup Actor',
                      style: GoogleFonts.spaceGrotesk(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary)),
                ]),
                const SizedBox(height: 20),
                TextField(
                  controller: _ctrl,
                  style: GoogleFonts.inter(
                      color: AppColors.textPrimary, fontSize: 13),
                  decoration: const InputDecoration(
                    labelText: 'Wallet Address',
                    prefixIcon: Icon(Icons.account_balance_wallet_rounded,
                        color: AppColors.purple, size: 18),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _loading ? null : _lookup,
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.purple),
                    icon: _loading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.search_rounded, size: 16),
                    label: Text(_loading ? 'Searching...' : 'Lookup'),
                  ),
                ),
              ],
            ),
          ),
          if (_msg.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.08),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange.withOpacity(0.3)),
              ),
              child: Text(_msg,
                  style: GoogleFonts.inter(color: Colors.orange, fontSize: 13)),
            ),
          ],
          if (_actor != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: glassDecoration(
                  borderColor: AppColors.green.withOpacity(0.3)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    const Icon(Icons.verified_user_rounded,
                        color: AppColors.green, size: 20),
                    const SizedBox(width: 8),
                    Text('Actor Found',
                        style: GoogleFonts.spaceGrotesk(
                            color: AppColors.green,
                            fontSize: 15,
                            fontWeight: FontWeight.w600)),
                  ]),
                  const SizedBox(height: 16),
                  _InfoTile(
                      Icons.person_rounded, 'Name', _actor!['name'] as String),
                  _InfoTile(Icons.account_balance_wallet_rounded, 'Wallet',
                      shortAddress(_actor!['wallet'] as String)),
                  _InfoTile(Icons.badge_rounded, 'Role',
                      roles[_actor!['role']] ?? 'Unknown'),
                ],
              ),
            ).animate().fadeIn().slideY(begin: 0.1),
          ],
        ],
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _InfoTile(this.icon, this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(children: [
        Icon(icon, color: AppColors.textSecondary, size: 15),
        const SizedBox(width: 10),
        Text('$label: ',
            style: GoogleFonts.inter(
                color: AppColors.textSecondary, fontSize: 13)),
        Text(value,
            style: GoogleFonts.inter(
                color: AppColors.textPrimary,
                fontSize: 13,
                fontWeight: FontWeight.w600)),
      ]),
    );
  }
}
