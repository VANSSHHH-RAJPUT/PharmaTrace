// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PharmaTrace {

    // ─── Enums ───────────────────────────────────────────────
    // ✅ Order matches frontend: 0=None, 1=Manufacturer, 2=Distributor, 3=Retailer, 4=Admin
    enum Role { None, Manufacturer, Distributor, Retailer, Admin }
    enum Stage { Manufactured, ShippedToDistributor, AtDistributor, ShippedToRetailer, AtRetailer, Sold }

    // ─── Structs ─────────────────────────────────────────────
    struct Actor {
        address wallet; // ✅ removed typo 'F'
        string name;
        Role role;
        bool exists;
    }

    struct Product {
        uint256 id;
        string name;
        string batchNumber;
        string manufacturerName;
        uint256 manufactureDate;
        uint256 expiryDate;
        address currentOwner;
        Stage currentStage;
        string metadataHash;
        bool exists;
    }

    struct Transfer {
        address from;
        address to;
        Stage stage;
        uint256 timestamp;
        string remarks;
    }

    // ─── State Variables ──────────────────────────────────────
    address public admin;
    uint256 public productCount;

    mapping(address => Actor) public actors;
    mapping(uint256 => Product) public products;
    mapping(uint256 => Transfer[]) public productHistory;

    // ─── Events ───────────────────────────────────────────────
    event ActorRegistered(address indexed wallet, string name, Role role);
    event ProductCreated(uint256 indexed productId, string name, string batchNumber, address manufacturer);
    event ProductTransferred(uint256 indexed productId, address from, address to, Stage stage, uint256 timestamp);

    // ─── Modifiers ────────────────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyRegistered() {
        require(actors[msg.sender].exists, "Actor not registered");
        _;
    }

    modifier productExists(uint256 _id) {
        require(products[_id].exists, "Product does not exist");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────
    constructor() {
        admin = msg.sender;
        // ✅ Deployer auto-registered as Admin (role 4)
        actors[msg.sender] = Actor(msg.sender, "Admin", Role.Admin, true);
    }

    // ─── Actor Functions ──────────────────────────────────────
    function registerActor(
        address _wallet,
        string memory _name,
        Role _role
    ) public onlyAdmin {
        require(_wallet != address(0), "Invalid wallet address");
        require(!actors[_wallet].exists, "Actor already registered");
        require(_role != Role.None, "Invalid role"); // ✅ Admin CAN be registered
        actors[_wallet] = Actor(_wallet, _name, _role, true);
        emit ActorRegistered(_wallet, _name, _role);
    }

    function getActor(address _wallet) public view returns (Actor memory) {
        return actors[_wallet];
    }

    // ─── Product Functions ────────────────────────────────────
    function createProduct(
        string memory _name,
        string memory _batchNumber,
        uint256 _manufactureDate,
        uint256 _expiryDate,
        string memory _metadataHash
    ) public onlyRegistered {
        require(actors[msg.sender].role == Role.Manufacturer, "Only manufacturer can create products");

        productCount++;
        products[productCount] = Product(
            productCount,
            _name,
            _batchNumber,
            actors[msg.sender].name,
            _manufactureDate,
            _expiryDate,
            msg.sender,
            Stage.Manufactured,
            _metadataHash,
            true
        );

        productHistory[productCount].push(Transfer(
            address(0),
            msg.sender,
            Stage.Manufactured,
            block.timestamp,
            "Product created by manufacturer"
        ));

        emit ProductCreated(productCount, _name, _batchNumber, msg.sender);
    }

    function transferProduct(
        uint256 _productId,
        address _to,
        Stage _newStage,
        string memory _remarks
    ) public onlyRegistered productExists(_productId) {
        Product storage product = products[_productId];
        require(product.currentOwner == msg.sender, "You are not the current owner");
        require(actors[_to].exists, "Recipient is not a registered actor");

        address from = product.currentOwner;
        product.currentOwner = _to;
        product.currentStage = _newStage;

        productHistory[_productId].push(Transfer(
            from,
            _to,
            _newStage,
            block.timestamp,
            _remarks
        ));

        emit ProductTransferred(_productId, from, _to, _newStage, block.timestamp);
    }

    function markAsSold(uint256 _productId) public onlyRegistered productExists(_productId) {
        Product storage product = products[_productId];
        require(product.currentOwner == msg.sender, "You are not the current owner");
        require(actors[msg.sender].role == Role.Retailer, "Only retailer can mark as sold");

        product.currentStage = Stage.Sold;

        productHistory[_productId].push(Transfer(
            msg.sender,
            address(0),
            Stage.Sold,
            block.timestamp,
            "Product sold to consumer"
        ));
    }

    // ─── Query Functions ──────────────────────────────────────
    function getProduct(uint256 _productId) public view productExists(_productId) returns (Product memory) {
        return products[_productId];
    }

    function getProductHistory(uint256 _productId) public view productExists(_productId) returns (Transfer[] memory) {
        return productHistory[_productId];
    }

    function getProductCount() public view returns (uint256) {
        return productCount;
    }
}