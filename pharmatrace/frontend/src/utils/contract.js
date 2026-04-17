export const CONTRACT_ADDRESS = '0xE2CADaFb51B7eBa36F663170eaba7f7821695e5A';
export const EXPECTED_CHAIN_ID = 11155111;
export const EXPECTED_CHAIN_HEX = '0xaa36a7';
export const NETWORK_NAME = 'Sepolia';

export const CONTRACT_ABI = [
  "function registerActor(address _wallet, string memory _name, uint8 _role) external",
  "function getActor(address _wallet) external view returns (tuple(address wallet, string name, uint8 role, bool exists))",
  "function createProduct(string memory _name, string memory _batchNumber, uint256 _manufactureDate, uint256 _expiryDate, string memory _metadataHash) external",
  "function transferProduct(uint256 _productId, address _to, uint8 _newStage, string memory _remarks) external",
  "function getProduct(uint256 _productId) external view returns (tuple(uint256 id, string name, string batchNumber, string manufacturerName, uint256 manufactureDate, uint256 expiryDate, address currentOwner, uint8 currentStage, string metadataHash, bool exists))",
  "function getProductHistory(uint256 _productId) external view returns (tuple(address from, address to, uint8 stage, uint256 timestamp, string remarks)[])",
  "function productCount() external view returns (uint256)",
  "function getProductCount() external view returns (uint256)",
  "function markAsSold(uint256 _productId) external",
  "event ActorRegistered(address indexed wallet, string name, uint8 role)",
  "event ProductCreated(uint256 indexed productId, string name, string batchNumber, address manufacturer)",
  "event ProductTransferred(uint256 indexed productId, address from, address to, uint8 stage, uint256 timestamp)"
];

// ✅ Matches contract: enum Role { None, Manufacturer, Distributor, Retailer, Admin }
export const ROLES = {
  0: 'Unregistered',
  1: 'Manufacturer',
  2: 'Distributor',
  3: 'Retailer',
  4: 'Admin',
};

export const ROLE_COLORS = {
  0: 'badge-red',      // Unregistered
  1: 'badge-cyan',     // Manufacturer
  2: 'badge-purple',   // Distributor
  3: 'badge-green',    // Retailer
  4: 'badge-yellow',   // ✅ Admin — distinct from Unregistered
};

// ✅ Matches contract: enum Stage { Manufactured, ShippedToDistributor, AtDistributor, ShippedToRetailer, AtRetailer, Sold }
export const STAGES = {
  0: 'Manufactured',
  1: 'Shipped to Distributor',  // ✅ was 'In Transit'
  2: 'At Distributor',
  3: 'Shipped to Retailer',     // ✅ was 'At Retailer'
  4: 'At Retailer',             // ✅ was 'Sold'
  5: 'Sold',                    // ✅ missing entirely before
};

export const STAGE_COLORS = {
  0: 'badge-cyan',    // Manufactured
  1: 'badge-yellow',  // Shipped to Distributor
  2: 'badge-purple',  // At Distributor
  3: 'badge-yellow',  // Shipped to Retailer
  4: 'badge-purple',  // At Retailer
  5: 'badge-green',   // ✅ Sold
};

export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const shortAddress = (addr) => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};