import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../theme/app_theme.dart';
import '../utils/contract_utils.dart';
import '../utils/web3_service.dart';
import '../main.dart';

class VerifyScreen extends StatefulWidget {
  final String? account;
  const VerifyScreen({super.key, required this.account});

  @override
  State<VerifyScreen> createState() => _VerifyScreenState();
}

class _VerifyScreenState extends State<VerifyScreen> {
  final _ctrl = TextEditingController();
  Map<String, dynamic>? _product;
  List<dynamic> _history = [];
  bool _loading = false;
  bool _scanning = false;
  String _msg = '';

  Future<void> _verify(String idStr) async {
    final id = int.tryParse(idStr.trim());
    if (id == null) {
      setState(() => _msg = 'Enter a valid product ID');
      return;
    }
    setState(() {
      _loading = true;
      _msg = '';
      _product = null;
      _history = [];
    });
    try {
      final p = await web3Service.getProduct(id);
      if (!(p['exists'] as bool)) {
        setState(() => _msg = '⚠️ Product not found on blockchain');
      } else {
        setState(() => _product = p);
      }
    } catch (e) {
      setState(() => _msg = '❌ ${e.toString().split(']').last}');
    }
    setState(() => _loading = false);
  }

  void _startScan() => setState(() => _scanning = true);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: _scanning
          ? _ScannerView(
              onDetected: (code) {
                setState(() => _scanning = false);
                _ctrl.text = code;
                _verify(code);
              },
              onCancel: () => setState(() => _scanning = false),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Verify Product',
                          style: GoogleFonts.spaceGrotesk(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary))
                      .animate()
                      .fadeIn(),

                  const SizedBox(height: 4),
                  Text('Enter product ID or scan QR code',
                          style: GoogleFonts.inter(
                              color: AppColors.textSecondary, fontSize: 14))
                      .animate()
                      .fadeIn(delay: 100.ms),

                  const SizedBox(height: 24),

                  // Search bar
                  Row(children: [
                    Expanded(
                      child: TextField(
                        controller: _ctrl,
                        keyboardType: TextInputType.number,
                        style: GoogleFonts.inter(color: AppColors.textPrimary),
                        decoration: InputDecoration(
                          hintText: 'Product ID (e.g. 1)',
                          prefixIcon: const Icon(Icons.search_rounded,
                              color: AppColors.cyan, size: 18),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.qr_code_scanner_rounded,
                                color: AppColors.cyan),
                            onPressed: _startScan,
                          ),
                        ),
                        onSubmitted: _verify,
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: _loading ? null : () => _verify(_ctrl.text),
                      style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 16)),
                      child: _loading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: AppColors.bg))
                          : const Text('Verify'),
                    ),
                  ]).animate().fadeIn(delay: 200.ms),

                  if (_msg.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border:
                            Border.all(color: Colors.orange.withOpacity(0.3)),
                      ),
                      child: Text(_msg,
                          style: GoogleFonts.inter(
                              color: Colors.orange, fontSize: 13)),
                    ),
                  ],

                  if (_product != null) ...[
                    const SizedBox(height: 24),
                    _ProductResult(product: _product!)
                        .animate()
                        .fadeIn()
                        .slideY(begin: 0.1),
                  ],
                ],
              ),
            ),
    );
  }
}

class _ProductResult extends StatelessWidget {
  final Map<String, dynamic> product;
  const _ProductResult({required this.product});

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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Verified badge
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.green.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.green.withOpacity(0.3)),
          ),
          child: Row(children: [
            const Icon(Icons.verified_rounded,
                color: AppColors.green, size: 28),
            const SizedBox(width: 12),
            Expanded(
                child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Product Verified ✓',
                    style: GoogleFonts.spaceGrotesk(
                        color: AppColors.green,
                        fontSize: 16,
                        fontWeight: FontWeight.w700)),
                Text('Authentic product found on blockchain',
                    style: GoogleFonts.inter(
                        color: AppColors.green.withOpacity(0.7), fontSize: 12)),
              ],
            )),
          ]),
        ),

        const SizedBox(height: 16),

        // Details card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: glassDecoration(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _Row('Product ID', '#${product['id']}'),
              _Row('Name', product['name'] as String),
              _Row('Batch No.', product['batchNumber'] as String),
              _Row('Manufacturer', product['manufacturerName'] as String),
              _Row('Current Stage', stages[stage] ?? 'Unknown',
                  valueColor: _stageColor),
              _Row('Current Owner',
                  shortAddress(product['currentOwner'] as String)),
              _Row('Manufacture Date',
                  formatTimestamp(product['manufactureDate'] as BigInt)),
              _Row('Expiry Date',
                  formatTimestamp(product['expiryDate'] as BigInt)),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // QR Code
        Container(
          padding: const EdgeInsets.all(20),
          decoration: glassDecoration(),
          child: Column(children: [
            Text('Product QR Code',
                style: GoogleFonts.spaceGrotesk(
                    color: AppColors.textPrimary,
                    fontSize: 15,
                    fontWeight: FontWeight.w600)),
            const SizedBox(height: 16),
            Center(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: QrImageView(
                  data: '${product['id']}',
                  size: 160,
                  backgroundColor: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text('Scan to verify product ID: ${product['id']}',
                style: GoogleFonts.inter(
                    color: AppColors.textSecondary, fontSize: 12)),
          ]),
        ),
      ],
    );
  }
}

class _Row extends StatelessWidget {
  final String label, value;
  final Color? valueColor;
  const _Row(this.label, this.value, {this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text('$label:',
                style: GoogleFonts.inter(
                    color: AppColors.textSecondary, fontSize: 13)),
          ),
          Expanded(
              child: Text(value,
                  style: GoogleFonts.inter(
                      color: valueColor ?? AppColors.textPrimary,
                      fontSize: 13,
                      fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }
}

class _ScannerView extends StatelessWidget {
  final Function(String) onDetected;
  final VoidCallback onCancel;
  const _ScannerView({required this.onDetected, required this.onCancel});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        MobileScanner(
          onDetect: (capture) {
            final code = capture.barcodes.first.rawValue;
            if (code != null) onDetected(code);
          },
        ),
        // Overlay
        Container(color: Colors.black.withOpacity(0.5)),
        Center(
          child: Container(
            width: 250,
            height: 250,
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.cyan, width: 2),
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
        Positioned(
          top: 50,
          left: 0,
          right: 0,
          child: Text('Scan Product QR Code',
              textAlign: TextAlign.center,
              style: GoogleFonts.spaceGrotesk(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600)),
        ),
        Positioned(
          bottom: 50,
          left: 24,
          right: 24,
          child: ElevatedButton(
            onPressed: onCancel,
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            child: const Text('Cancel'),
          ),
        ),
      ],
    );
  }
}
