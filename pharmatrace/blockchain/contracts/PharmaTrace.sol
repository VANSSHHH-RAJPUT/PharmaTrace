// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PharmaTrace {

    // ─── Enums ───────────────────────────────────────────────
    enum Role { None, Manufacturer, Distributor, Retailer, Admin }
    enum Stage { Manufactured, ShippedToDistributor, AtDistributor, ShippedToRetailer, AtRetailer, Sold }
    enum RequestStatus { Pending, Approved, Rejected }

    // ─── Structs ─────────────────────────────────────────────
    struct Actor {
        address wallet;
        string name;
        Role role;
        bool exists;
    }

    struct RegistrationRequest {
        address wallet;
        string companyName;
        Role role;
        RequestStatus status;
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
    mapping(address => RegistrationRequest) public registrationRequests;
    address[] public requestList;

    mapping(uint256 => Product) public products;
    mapping(uint256 => Transfer[]) public productHistory;

    // ─── Events ───────────────────────────────────────────────
    event ActorRegistered(address indexed wallet, string name, Role role);
    event RegistrationRequested(address indexed wallet, string companyName, Role role);
    event RegistrationApproved(address indexed wallet);
    event RegistrationRejected(address indexed wallet);
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
        actors[msg.sender] = Actor(msg.sender, "Admin", Role.Admin, true);
    }

    // ─── Registration Request Functions ───────────────────────

    // Anyone can call this to request registration
    function requestRegistration(string memory _companyName, Role _role) public {
        require(_role != Role.None && _role != Role.Admin, "Invalid role");
        require(!actors[msg.sender].exists, "Already registered");
        require(!registrationRequests[msg.sender].exists, "Request already submitted");

        registrationRequests[msg.sender] = RegistrationRequest(
            msg.sender,
            _companyName,
            _role,
            RequestStatus.Pending,
            true
        );
        requestList.push(msg.sender);

        emit RegistrationRequested(msg.sender, _companyName, _role);
    }

    // Admin approves a request → auto registers the actor
    function approveRegistration(address _wallet) public onlyAdmin {
        require(registrationRequests[_wallet].exists, "No request found");
        require(registrationRequests[_wallet].status == RequestStatus.Pending, "Already processed");

        registrationRequests[_wallet].status = RequestStatus.Approved;

        RegistrationRequest memory req = registrationRequests[_wallet];
        actors[_wallet] = Actor(_wallet, req.companyName, req.role, true);

        emit RegistrationApproved(_wallet);
        emit ActorRegistered(_wallet, req.companyName, req.role);
    }

    // Admin rejects a request
    function rejectRegistration(address _wallet) public onlyAdmin {
        require(registrationRequests[_wallet].exists, "No request found");
        require(registrationRequests[_wallet].status == RequestStatus.Pending, "Already processed");

        registrationRequests[_wallet].status = RequestStatus.Rejected;

        emit RegistrationRejected(_wallet);
    }

    // Get all request addresses
    function getRequestList() public view returns (address[] memory) {
        return requestList;
    }

    // Get a single request details
    function getRegistrationRequest(address _wallet) public view returns (
        string memory companyName,
        uint8 role,
        uint8 status,
        bool exists
    ) {
        RegistrationRequest memory r = registrationRequests[_wallet];
        return (r.companyName, uint8(r.role), uint8(r.status), r.exists);
    }

    // ─── Actor Functions (kept for manual admin registration) ─
    function registerActor(
        address _wallet,
        string memory _name,
        Role _role
    ) public onlyAdmin {
        require(_wallet != address(0), "Invalid wallet address");
        require(!actors[_wallet].exists, "Actor already registered");
        require(_role != Role.None, "Invalid role");
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