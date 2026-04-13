import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../utils/contract_utils.dart';
import '../utils/web3_service.dart';
import '../main.dart';

class DashboardScreen extends StatefulWidget {
  final String? account;
  final int role;
  const DashboardScreen({super.key, required this.account, required this.role});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<Map<String, dynamic>> _products = [];
  bool _loading = false;
  String _msg = '';

  @override
  void initState() {
    super.initState();
    if (widget.account != null) _loadProducts();
  }

  @override
  void didUpdateWidget(DashboardScreen old) {
    super.didUpdateWidget(old);
    if (old.account != widget.account && widget.account != null) {
      _loadProducts();
    }
  }

  Future<void> _loadProducts() async {
    setState(() => _loading = true);
    try {
      final count = await web3Service.getProductCount();
      final list = <Map<String, dynamic>>[];
      for (int i = 1; i <= count; i++) {
        try {
          final p = await web3Service.getProduct(i);
          final isOwner = (p['currentOwner'] as String).toLowerCase() ==
              widget.account?.toLowerCase();
          if (widget.role == 4 || isOwner) list.add(p);
        } catch (_) {}
      }
      setState(() => _products = list);
    } catch (e) {
      setState(() => _msg = 'Error loading products: $e');
    }
    setState(() => _loading = false);
  }

  void _showCreateProduct() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgSecondary,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _CreateProductSheet(onCreated: _loadProducts),
    );
  }

  void _showTransfer(Map<String, dynamic> product) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgSecondary,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) =>
          _TransferSheet(product: product, onTransferred: _loadProducts),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.account == null) {
      return _NotConnected();
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: (widget.role == 1 || widget.role == 4)
          ? FloatingActionButton.extended(
              onPressed: _showCreateProduct,
              backgroundColor: AppColors.cyan,
              foregroundColor: AppColors.bg,
              icon: const Icon(Icons.add_rounded),
              label: Text('New Product',
                  style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
            )
          : null,
      body: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(24, 20, 24, 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Dashboard',
                      style: GoogleFonts.spaceGrotesk(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary)),
                  Text('${_products.length} products found',
                      style: GoogleFonts.inter(
                          color: AppColors.textSecondary, fontSize: 13)),
                ]),
                Row(children: [
                  _RoleBadge(role: widget.role),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _loadProducts,
                    icon: _loading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: AppColors.cyan))
                        : const Icon(Icons.refresh_rounded,
                            color: AppColors.cyan, size: 20),
                  ),
                ]),
              ],
            ),
          ),

          if (_msg.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.redAccent.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
                ),
                child: Text(_msg,
                    style: GoogleFonts.inter(
                        color: Colors.redAccent, fontSize: 13)),
              ),
            ),

          // Product list
          Expanded(
            child: _loading && _products.isEmpty
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.cyan))
                : _products.isEmpty
                    ? _EmptyState(role: widget.role)
                    : RefreshIndicator(
                        color: AppColors.cyan,
                        onRefresh: _loadProducts,
                        child: ListView.builder(
                          padding: const EdgeInsets.fromLTRB(24, 0, 24, 100),
                          itemCount: _products.length,
                          itemBuilder: (_, i) => _ProductCard(
                            product: _products[i],
                            account: widget.account!,
                            onTransfer: () => _showTransfer(_products[i]),
                          )
                              .animate()
                              .fadeIn(delay: (i * 80).ms)
                              .slideY(begin: 0.1),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

class _RoleBadge extends StatelessWidget {
  final int role;
  const _RoleBadge({required this.role});

  Color get _color => [
        Colors.grey,
        AppColors.cyan,
        AppColors.purple,
        AppColors.green,
        Colors.redAccent
      ][role.clamp(0, 4)];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _color.withOpacity(0.3)),
      ),
      child: Text(roles[role] ?? 'Unknown',
          style: GoogleFonts.inter(
              color: _color, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  final String account;
  final VoidCallback onTransfer;
  const _ProductCard({
    required this.product,
    required this.account,
    required this.onTransfer,
  });

  Color get _stageColor => [
        AppColors.cyan,
        AppColors.amber,
        AppColors.purple,
        AppColors.green,
        Colors.redAccent,
      ][(product['currentStage'] as int).clamp(0, 4)];

  @override
  Widget build(BuildContext context) {
    final stage = product['currentStage'] as int;
    final isOwner = (product['currentOwner'] as String).toLowerCase() ==
        account.toLowerCase();

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: glassDecoration(borderColor: _stageColor.withOpacity(0.2)),
      child: Column(
        children: [
          // Top row
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.cyan.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cyan.withOpacity(0.2)),
                ),
                child: const Icon(Icons.medication_rounded,
                    color: AppColors.cyan, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                  child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product['name'] as String,
                      style: GoogleFonts.spaceGrotesk(
                          color: AppColors.textPrimary,
                          fontSize: 15,
                          fontWeight: FontWeight.w600)),
                  Text('Batch: ${product['batchNumber']}',
                      style: GoogleFonts.inter(
                          color: AppColors.textSecondary, fontSize: 12)),
                ],
              )),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _stageColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _stageColor.withOpacity(0.3)),
                ),
                child: Text(stages[stage] ?? 'Unknown',
                    style: GoogleFonts.inter(
                        color: _stageColor,
                        fontSize: 11,
                        fontWeight: FontWeight.w600)),
              ),
            ]),
          ),

          // Details
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(children: [
              _InfoRow(Icons.person_rounded, 'Manufacturer',
                  product['manufacturerName'] as String),
              const SizedBox(height: 6),
              _InfoRow(Icons.account_balance_wallet_rounded, 'Owner',
                  shortAddress(product['currentOwner'] as String)),
              const SizedBox(height: 6),
              _InfoRow(Icons.calendar_today_rounded, 'Expires',
                  formatTimestamp(product['expiryDate'] as BigInt)),
            ]),
          ),

          // Transfer button
          if (isOwner && stage < 4)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: onTransfer,
                  icon: const Icon(Icons.swap_horiz_rounded,
                      color: AppColors.cyan, size: 16),
                  label: Text('Transfer Product',
                      style: GoogleFonts.inter(
                          color: AppColors.cyan, fontWeight: FontWeight.w600)),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: AppColors.cyan.withOpacity(0.3)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _InfoRow(this.icon, this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Icon(icon, color: AppColors.textSecondary, size: 13),
      const SizedBox(width: 6),
      Text('$label: ',
          style:
              GoogleFonts.inter(color: AppColors.textSecondary, fontSize: 12)),
      Text(value,
          style: GoogleFonts.inter(
              color: AppColors.textPrimary,
              fontSize: 12,
              fontWeight: FontWeight.w500)),
    ]);
  }
}

class _EmptyState extends StatelessWidget {
  final int role;
  const _EmptyState({required this.role});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.inventory_2_rounded,
            color: AppColors.textSecondary.withOpacity(0.4), size: 64),
        const SizedBox(height: 16),
        Text('No Products Found',
            style: GoogleFonts.spaceGrotesk(
                color: AppColors.textSecondary,
                fontSize: 18,
                fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Text(
          role == 1 || role == 4
              ? 'Tap + to create your first product'
              : 'No products assigned to your wallet',
          style: GoogleFonts.inter(
              color: AppColors.textSecondary.withOpacity(0.6), fontSize: 14),
        ),
      ]),
    );
  }
}

class _NotConnected extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.cyan.withOpacity(0.1),
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
            ),
            child: const Icon(Icons.account_balance_wallet_rounded,
                color: AppColors.cyan, size: 36),
          ),
          const SizedBox(height: 20),
          Text('Wallet Not Connected',
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary)),
          const SizedBox(height: 8),
          Text('Connect your wallet to view and manage products.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                  color: AppColors.textSecondary, fontSize: 14)),
        ]),
      ),
    );
  }
}

class _CreateProductSheet extends StatefulWidget {
  final VoidCallback onCreated;
  const _CreateProductSheet({required this.onCreated});

  @override
  State<_CreateProductSheet> createState() => _CreateProductSheetState();
}

class _CreateProductSheetState extends State<_CreateProductSheet> {
  final _name = TextEditingController();
  final _batch = TextEditingController();
  final _meta = TextEditingController();
  DateTime? _mfgDate;
  DateTime? _expDate;
  bool _loading = false;
  String _msg = '';

  Future<void> _pickDate(bool isMfg) async {
    final d = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2035),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.dark(primary: AppColors.cyan),
        ),
        child: child!,
      ),
    );
    if (d != null) setState(() => isMfg ? _mfgDate = d : _expDate = d);
  }

  Future<void> _submit() async {
    if (_name.text.isEmpty ||
        _batch.text.isEmpty ||
        _mfgDate == null ||
        _expDate == null) {
      setState(() => _msg = 'Please fill all fields');
      return;
    }
    setState(() {
      _loading = true;
      _msg = '';
    });
    try {
      await web3Service.createProduct(
        name: _name.text.trim(),
        batchNumber: _batch.text.trim(),
        manufactureDate: _mfgDate!.millisecondsSinceEpoch ~/ 1000,
        expiryDate: _expDate!.millisecondsSinceEpoch ~/ 1000,
        metadataHash: _meta.text.trim(),
      );
      setState(() => _msg = '✅ Product created!');
      await Future.delayed(1.seconds);
      if (mounted) {
        Navigator.pop(context);
        widget.onCreated();
      }
    } catch (e) {
      setState(() => _msg = '❌ ${e.toString().split(']').last}');
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Create Product',
                style: GoogleFonts.spaceGrotesk(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary)),
            const SizedBox(height: 20),
            TextField(
                controller: _name,
                decoration: const InputDecoration(labelText: 'Product Name')),
            const SizedBox(height: 12),
            TextField(
                controller: _batch,
                decoration: const InputDecoration(labelText: 'Batch Number')),
            const SizedBox(height: 12),
            TextField(
                controller: _meta,
                decoration:
                    const InputDecoration(labelText: 'Metadata / Description')),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(
                  child: _DateButton(
                label: _mfgDate == null
                    ? 'Manufacture Date'
                    : '${_mfgDate!.day}/${_mfgDate!.month}/${_mfgDate!.year}',
                onTap: () => _pickDate(true),
              )),
              const SizedBox(width: 12),
              Expanded(
                  child: _DateButton(
                label: _expDate == null
                    ? 'Expiry Date'
                    : '${_expDate!.day}/${_expDate!.month}/${_expDate!.year}',
                onTap: () => _pickDate(false),
              )),
            ]),
            if (_msg.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(_msg,
                  style: GoogleFonts.inter(
                      color: _msg.startsWith('✅')
                          ? AppColors.green
                          : Colors.redAccent,
                      fontSize: 13)),
            ],
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: AppColors.bg))
                    : const Text('Create Product'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DateButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const _DateButton({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.cyan.withOpacity(0.15)),
        ),
        child: Row(children: [
          Icon(Icons.calendar_today_rounded, color: AppColors.cyan, size: 14),
          const SizedBox(width: 8),
          Expanded(
              child: Text(label,
                  style: GoogleFonts.inter(
                      color: AppColors.textSecondary, fontSize: 12),
                  overflow: TextOverflow.ellipsis)),
        ]),
      ),
    );
  }
}

class _TransferSheet extends StatefulWidget {
  final Map<String, dynamic> product;
  final VoidCallback onTransferred;
  const _TransferSheet({required this.product, required this.onTransferred});

  @override
  State<_TransferSheet> createState() => _TransferSheetState();
}

class _TransferSheetState extends State<_TransferSheet> {
  final _toCtrl = TextEditingController();
  final _remarksCtrl = TextEditingController();
  int _newStage = 1;
  bool _loading = false;
  String _msg = '';

  Future<void> _submit() async {
    if (_toCtrl.text.isEmpty) {
      setState(() => _msg = 'Enter recipient address');
      return;
    }
    setState(() {
      _loading = true;
      _msg = '';
    });
    try {
      await web3Service.transferProduct(
        productId: widget.product['id'] as int,
        to: _toCtrl.text.trim(),
        newStage: _newStage,
        remarks: _remarksCtrl.text.trim(),
      );
      setState(() => _msg = '✅ Transfer successful!');
      await Future.delayed(1.seconds);
      if (mounted) {
        Navigator.pop(context);
        widget.onTransferred();
      }
    } catch (e) {
      setState(() => _msg = '❌ ${e.toString().split(']').last}');
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Transfer Product',
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          Text(widget.product['name'] as String,
              style: GoogleFonts.inter(color: AppColors.cyan, fontSize: 13)),
          const SizedBox(height: 20),
          TextField(
            controller: _toCtrl,
            style:
                GoogleFonts.inter(color: AppColors.textPrimary, fontSize: 13),
            decoration: const InputDecoration(
              labelText: 'Recipient Address',
              prefixIcon: Icon(Icons.account_balance_wallet_rounded,
                  color: AppColors.cyan, size: 18),
            ),
          ),
          const SizedBox(height: 12),
          // Stage selector
          Text('New Stage',
              style: GoogleFonts.inter(
                  color: AppColors.textSecondary, fontSize: 13)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: stages.entries
                .where((e) => e.key > 0)
                .map((e) => ChoiceChip(
                      label: Text(e.value,
                          style: GoogleFonts.inter(
                              color: _newStage == e.key
                                  ? AppColors.bg
                                  : AppColors.textSecondary,
                              fontSize: 12)),
                      selected: _newStage == e.key,
                      selectedColor: AppColors.cyan,
                      backgroundColor: AppColors.bgSecondary,
                      onSelected: (_) => setState(() => _newStage = e.key),
                    ))
                .toList(),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _remarksCtrl,
            decoration: const InputDecoration(labelText: 'Remarks (optional)'),
          ),
          if (_msg.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(_msg,
                style: GoogleFonts.inter(
                    color: _msg.startsWith('✅')
                        ? AppColors.green
                        : Colors.redAccent,
                    fontSize: 13)),
          ],
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: AppColors.bg))
                  : const Text('Transfer'),
            ),
          ),
        ],
      ),
    );
  }
}
