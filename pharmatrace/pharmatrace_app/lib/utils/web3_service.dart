import 'package:web3dart/web3dart.dart';
import 'package:http/http.dart' as http;
import 'contract_utils.dart';

class Web3Service {
  late Web3Client _client;
  late DeployedContract _contract;
  late EthPrivateKey _credentials;
  String? connectedAddress;

  Web3Service() {
    _client = Web3Client(rpcUrl, http.Client());
    _contract = DeployedContract(
      ContractAbi.fromJson(contractABI, 'PharmaTrace'),
      EthereumAddress.fromHex(contractAddress),
    );
  }

  void setPrivateKey(String privateKey) {
    _credentials = EthPrivateKey.fromHex(privateKey);
    connectedAddress = _credentials.address.hex;
  }

  // Get actor info
  Future<Map<String, dynamic>> getActor(String address) async {
    final fn = _contract.function('getActor');
    final result = await _client.call(
      contract: _contract,
      function: fn,
      params: [EthereumAddress.fromHex(address)],
    );
    final data = result[0] as List;
    return {
      'wallet': (data[0] as EthereumAddress).hex,
      'name': data[1] as String,
      'role': (data[2] as BigInt).toInt(),
      'exists': data[3] as bool,
    };
  }

  // Register actor
  Future<String> registerActor(String wallet, String name, int role) async {
    final fn = _contract.function('registerActor');
    final txHash = await _client.sendTransaction(
      _credentials,
      Transaction.callContract(
        contract: _contract,
        function: fn,
        parameters: [EthereumAddress.fromHex(wallet), name, BigInt.from(role)],
      ),
      chainId: 31337,
    );
    return txHash;
  }

  // Create product
  Future<String> createProduct({
    required String name,
    required String batchNumber,
    required int manufactureDate,
    required int expiryDate,
    required String metadataHash,
  }) async {
    final fn = _contract.function('createProduct');
    final txHash = await _client.sendTransaction(
      _credentials,
      Transaction.callContract(
        contract: _contract,
        function: fn,
        parameters: [
          name,
          batchNumber,
          BigInt.from(manufactureDate),
          BigInt.from(expiryDate),
          metadataHash,
        ],
      ),
      chainId: 31337,
    );
    return txHash;
  }

  // Get product
  Future<Map<String, dynamic>> getProduct(int productId) async {
    final fn = _contract.function('getProduct');
    final result = await _client.call(
      contract: _contract,
      function: fn,
      params: [BigInt.from(productId)],
    );
    final data = result[0] as List;
    return {
      'id': (data[0] as BigInt).toInt(),
      'name': data[1] as String,
      'batchNumber': data[2] as String,
      'manufacturerName': data[3] as String,
      'manufactureDate': data[4] as BigInt,
      'expiryDate': data[5] as BigInt,
      'currentOwner': (data[6] as EthereumAddress).hex,
      'currentStage': (data[7] as BigInt).toInt(),
      'metadataHash': data[8] as String,
      'exists': data[9] as bool,
    };
  }

  // Get product count
  Future<int> getProductCount() async {
    final fn = _contract.function('productCount');
    final result = await _client.call(
      contract: _contract,
      function: fn,
      params: [],
    );
    return (result[0] as BigInt).toInt();
  }

  // Transfer product
  Future<String> transferProduct({
    required int productId,
    required String to,
    required int newStage,
    required String remarks,
  }) async {
    final fn = _contract.function('transferProduct');
    final txHash = await _client.sendTransaction(
      _credentials,
      Transaction.callContract(
        contract: _contract,
        function: fn,
        parameters: [
          BigInt.from(productId),
          EthereumAddress.fromHex(to),
          BigInt.from(newStage),
          remarks,
        ],
      ),
      chainId: 31337,
    );
    return txHash;
  }

  void dispose() => _client.dispose();
}
