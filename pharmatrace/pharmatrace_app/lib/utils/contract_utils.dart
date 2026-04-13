import 'package:web3dart/web3dart.dart';

const String contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const String rpcUrl = 'http://10.0.2.2:8545'; // Android emulator → localhost
const String wsUrl = 'ws://10.0.2.2:8545';

// Use 127.0.0.1 for real device on same network

const String contractABI = '''[
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[{"internalType":"address","name":"_wallet","type":"address"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"uint8","name":"_role","type":"uint8"}],"name":"registerActor","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"getActor","outputs":[{"components":[{"internalType":"address","name":"wallet","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"uint8","name":"role","type":"uint8"},{"internalType":"bool","name":"exists","type":"bool"}],"internalType":"struct PharmaTrace.Actor","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_batchNumber","type":"string"},{"internalType":"uint256","name":"_manufactureDate","type":"uint256"},{"internalType":"uint256","name":"_expiryDate","type":"uint256"},{"internalType":"string","name":"_metadataHash","type":"string"}],"name":"createProduct","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_productId","type":"uint256"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint8","name":"_newStage","type":"uint8"},{"internalType":"string","name":"_remarks","type":"string"}],"name":"transferProduct","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_productId","type":"uint256"}],"name":"getProduct","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"batchNumber","type":"string"},{"internalType":"string","name":"manufacturerName","type":"string"},{"internalType":"uint256","name":"manufactureDate","type":"uint256"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"address","name":"currentOwner","type":"address"},{"internalType":"uint8","name":"currentStage","type":"uint8"},{"internalType":"string","name":"metadataHash","type":"string"},{"internalType":"bool","name":"exists","type":"bool"}],"internalType":"struct PharmaTrace.Product","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_productId","type":"uint256"}],"name":"getProductHistory","outputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint8","name":"stage","type":"uint8"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"remarks","type":"string"}],"internalType":"struct PharmaTrace.Transfer[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"productCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
]''';

const Map<int, String> roles = {
  0: 'Unregistered',
  1: 'Manufacturer',
  2: 'Distributor',
  3: 'Retailer',
  4: 'Admin',
};

const Map<int, String> stages = {
  0: 'Manufactured',
  1: 'In Transit',
  2: 'At Distributor',
  3: 'At Retailer',
  4: 'Sold',
};

String shortAddress(String addr) {
  if (addr.length < 10) return addr;
  return '${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}';
}

String formatTimestamp(BigInt timestamp) {
  final dt = DateTime.fromMillisecondsSinceEpoch(timestamp.toInt() * 1000);
  return '${dt.day} ${_months[dt.month - 1]} ${dt.year}';
}

const List<String> _months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
