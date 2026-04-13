# PharmaTrace Project Overview

## 1. Project Summary

PharmaTrace is a blockchain-based medicine authenticity and traceability project. Its goal is to help track pharmaceutical products across the supply chain and make it easier to verify whether a medicine is genuine.

The repository is organized into three main parts:

- `frontend/`: React user interface for admins, supply-chain actors, and product verification
- `backend/`: Express + MongoDB API for storing off-chain actor/product metadata
- `blockchain/`: Hardhat workspace containing the `PharmaTrace` smart contract and deployment script

At a high level, the project is designed to work like this:

1. An admin registers supply-chain actors such as manufacturers, distributors, and retailers.
2. A manufacturer creates a medicine/product record on-chain.
3. The product is transferred across the supply chain, and each transfer is recorded on-chain.
4. A retailer marks the product as sold.
5. A user can verify the product and inspect its history.

## 2. Repository Structure

```text
pharmatrace/
  backend/
    controllers/
    models/
    routes/
    index.js
  blockchain/
    contracts/
      PharmaTrace.sol
    scripts/
      deploy.js
    hardhat.config.js
  frontend/
    src/
      components/
      pages/
      utils/
```

## 3. Core Idea of the System

This project combines:

- `Ethereum smart contract`: stores actor registration, products, ownership, stage, and transfer history
- `Frontend dApp`: lets users connect MetaMask and interact with the contract
- `MongoDB backend`: intended to store extra metadata that may not be ideal to keep on-chain, such as descriptions and image URLs

This is a useful hybrid model for medicine authenticity:

- On-chain data gives immutability and traceability.
- Off-chain data gives flexibility for richer product information.

## 4. Blockchain Layer

### Smart Contract

File: `blockchain/contracts/PharmaTrace.sol`

The contract stores the main supply-chain state.

### Enums

#### `Role`

- `None`
- `Admin`
- `Manufacturer`
- `Distributor`
- `Retailer`

#### `Stage`

- `Manufactured`
- `ShippedToDistributor`
- `AtDistributor`
- `ShippedToRetailer`
- `AtRetailer`
- `Sold`

### Structs

#### `Actor`

- `wallet`
- `name`
- `role`
- `exists`

#### `Product`

- `id`
- `name`
- `batchNumber`
- `manufacturerName`
- `manufactureDate`
- `expiryDate`
- `currentOwner`
- `currentStage`
- `metadataHash`
- `exists`

#### `Transfer`

- `from`
- `to`
- `stage`
- `timestamp`
- `remarks`

### State Variables

- `admin`: deployer address, treated as the system admin
- `productCount`: running counter for created products
- `actors`: mapping of wallet address to actor
- `products`: mapping of product ID to product
- `productHistory`: mapping of product ID to an array of transfer records

### Events

- `ActorRegistered`
- `ProductCreated`
- `ProductTransferred`

### Main Contract Functions

#### `registerActor(address _wallet, string memory _name, Role _role)`

- Only admin can call it.
- Registers a wallet as Manufacturer, Distributor, or Retailer.
- Prevents duplicate registration.

#### `getActor(address _wallet)`

- Returns actor data for a wallet.

#### `createProduct(string _name, string _batchNumber, uint256 _manufactureDate, uint256 _expiryDate, string _metadataHash)`

- Only a registered Manufacturer can call it.
- Creates a new product.
- Sets initial owner as the manufacturer.
- Sets initial stage as `Manufactured`.
- Adds the first history entry automatically.

#### `transferProduct(uint256 _productId, address _to, Stage _newStage, string _remarks)`

- Only the current owner can transfer a product.
- Recipient must be a registered actor.
- Updates current owner and current stage.
- Appends a transfer record to history.

#### `markAsSold(uint256 _productId)`

- Only a registered Retailer who currently owns the product can call it.
- Marks the product stage as `Sold`.
- Adds a final history entry.

#### `getProduct(uint256 _productId)`

- Returns the product struct.

#### `getProductHistory(uint256 _productId)`

- Returns the full transfer history array.

#### `getProductCount()`

- Returns total number of products created.

### Contract Strengths

- Clear role-based supply-chain workflow
- Good use of enums and structs
- Full on-chain audit trail for medicine movement
- Manufacturer-only creation and retailer-only final sale are good business rules

### Contract Limitations

- No `actorCount` function, even though the frontend expects one
- No validation that stage transitions follow a strict allowed sequence
- No duplicate batch validation
- No per-role transfer restrictions beyond ownership
- No explicit product authenticity flag beyond existence/history
- No QR-specific or consumer-specific verification helper

## 5. Blockchain Deployment Setup

### Hardhat Config

File: `blockchain/hardhat.config.js`

Configured networks:

- `localhost`: `http://127.0.0.1:8545`
- `sepolia`: uses `ALCHEMY_RPC_URL` and `PRIVATE_KEY`

Environment variables expected:

- `ALCHEMY_RPC_URL`
- `PRIVATE_KEY`

Important note:

- The config currently prints `Key length check:` to the console. That looks like temporary debugging and should be removed before production use.

### Deployment Script

File: `blockchain/scripts/deploy.js`

What it does:

- Gets the deployer signer
- Deploys the `PharmaTrace` contract
- Waits for deployment
- Prints deployed contract address and admin address

## 6. Backend Layer

The backend is an Express server connected to MongoDB through Mongoose.

Main file: `backend/index.js`

### What the backend currently does

- Enables CORS
- Parses JSON requests
- Connects to MongoDB using `MONGO_URI`
- Exposes actor and product routes
- Exposes a basic `/` health response

### Environment Variable

- `MONGO_URI`

### Backend Data Models

#### Actor Model

File: `backend/models/Actor.js`

Fields:

- `wallet` - unique wallet address
- `name`
- `role`
- `createdAt`

This acts as an off-chain registry mirror for actor details.

#### Product Model

File: `backend/models/Product.js`

Fields:

- `contractId`
- `name`
- `batchNumber`
- `manufacturerName`
- `manufactureDate`
- `expiryDate`
- `imageUrl`
- `description`
- `metadataHash`
- Mongoose timestamps

This is intended for richer off-chain product metadata.

### Backend Controllers

#### Actor Controller

File: `backend/controllers/actorController.js`

Functions:

- `createActor`
  - Creates a new actor or updates an existing one by wallet address
- `getActor`
  - Returns actor data by wallet

#### Product Controller

File: `backend/controllers/productController.js`

Functions:

- `createProduct`
  - Saves product metadata in MongoDB
- `getProduct`
  - Fetches one product by `contractId`
- `getAllProducts`
  - Returns all products sorted by newest first

### Backend Routes

#### Actor Routes

File: `backend/routes/actors.js`

- `POST /api/actors`
- `GET /api/actors/:wallet`

#### Product Routes

File: `backend/routes/products.js`

- `POST /api/products`
- `GET /api/products/:id`
- `GET /api/products`

### Backend Observations

- The backend is simple and readable.
- It is currently more like a metadata service than a full blockchain indexer.
- There is no sync mechanism that automatically listens to contract events and writes them into MongoDB.
- There is no validation that backend records and on-chain records stay consistent.
- The frontend currently does not appear to call these API endpoints.

## 7. Frontend Layer

The frontend is a React app created with Create React App and uses:

- `ethers`
- `react-router-dom`
- `framer-motion`
- `lucide-react`
- `react-qr-code`

Main files:

- `frontend/src/App.js`
- `frontend/src/utils/contract.js`
- `frontend/src/pages/*`
- `frontend/src/components/*`

### Frontend Routing

Routes defined in `frontend/src/App.js`:

- `/` -> Landing page
- `/dashboard` -> actor dashboard
- `/verify` -> product verification
- `/admin` -> admin panel

### Wallet / Contract Connection

In `App.js`, the app:

- connects to MetaMask using `ethers.BrowserProvider`
- assumes Hardhat network with chain ID `31337`
- creates a contract instance from `CONTRACT_ADDRESS` and `CONTRACT_ABI`
- loads actor info using `getActor(address)`

### Contract Utility File

File: `frontend/src/utils/contract.js`

Contains:

- contract address
- minimal ABI
- role labels
- stage labels
- badge color maps
- helper functions like `formatDate()` and `shortAddress()`

Important observation:

The role and stage mappings in this file do not match the Solidity enum order.

#### Solidity role order

- `0`: None
- `1`: Admin
- `2`: Manufacturer
- `3`: Distributor
- `4`: Retailer

#### Frontend role map currently uses

- `0`: Unregistered
- `1`: Manufacturer
- `2`: Distributor
- `3`: Retailer
- `4`: Admin

This causes a major mismatch in role display and role-based UI behavior.

### Landing Page

File: `frontend/src/pages/Landing.jsx`

Purpose:

- marketing-style homepage
- explains benefits like immutability, real-time tracking, compliance, and verification
- provides CTA buttons for wallet connection, dashboard, and verification

The UI design is modern and polished, with animation and a strong product presentation.

### Dashboard Page

File: `frontend/src/pages/Dashboard.jsx`

Intended purpose:

- show user products
- allow manufacturers to create products
- allow owners to transfer products
- show network/product stats

What it currently does:

- loads products from the contract by iterating from `1` to `productCount`
- filters products by owner unless role is admin
- shows create form to role `1`
- opens transfer modal for eligible owners

Important issues:

- It checks `role === 1` for manufacturers, but in Solidity `1` is Admin
- It reads product fields that do not exist on-chain, such as `description` and `isActive`
- It sends `form.description` into `createProduct(...)`, but the contract expects `metadataHash`

So the dashboard reflects the intended workflow, but its contract integration is currently inconsistent.

### Admin Page

File: `frontend/src/pages/Admin.jsx`

Intended purpose:

- register new actors
- lookup actor details by wallet

Important issues:

- `registerActor` is called with wrong parameter order in the frontend
- Current frontend call:
  - `registerActor(wallet, role, name)`
- Actual contract signature:
  - `registerActor(wallet, name, role)`
- Actor lookup checks `actor.isRegistered`, but the Solidity struct field is `exists`
- The role selector includes `Admin`, but the contract explicitly rejects registering `Role.Admin`

### Verify Page

File: `frontend/src/pages/Verify.jsx`

Intended purpose:

- verify authenticity of a product by ID
- show product details
- display QR code
- display chain of custody

Important issues:

- Expects `description` and `isActive` on product, but the contract does not return those
- Expects history in `owners` and `timestamps` arrays, but the contract returns an array of `Transfer` structs

This page has the right business idea, but its current data parsing does not match the contract shape.

### Reusable Components

#### `Navbar.jsx`

- top navigation
- wallet status
- role badge
- actor display name/address

#### `ProductCard.jsx`

- displays medicine/product summary
- shows expiry state
- links to verification
- allows transfer action

#### `StatsBar.jsx`

- intended to show total products and total actors
- currently calls `contract.actorCount()`, but that function does not exist in the contract

#### `TransferModal.jsx`

- intended to transfer a product to another actor

Important issue:

- Calls `transferProduct(product.id, toAddress)` with only two arguments.
- Actual contract signature requires:
  - product ID
  - destination address
  - new stage
  - remarks

## 8. Current End-to-End Workflow Intention

The intended business flow appears to be:

1. Admin deploys the contract.
2. Admin registers supply-chain actors.
3. Manufacturer creates a medicine record.
4. Product moves to distributor.
5. Product moves to retailer.
6. Retailer sells the medicine.
7. Consumer or stakeholder verifies the product using ID or QR code.

This is a solid and practical medicine authenticity workflow.

## 9. Main Technical Gaps Found

This section is especially important because it explains why some parts may not work correctly right now.

### Frontend and Smart Contract Mismatches

- Role numbers in frontend do not match Solidity role enum order.
- Stage labels in frontend do not match Solidity stage enum order.
- Frontend expects `description`, `isActive`, `actorCount`, `owners`, `timestamps`, and `isRegistered`, but these are not present in the contract.
- Frontend passes wrong argument order for `registerActor`.
- Frontend passes wrong argument count for `transferProduct`.
- Product creation uses a description string where contract expects a `metadataHash`.

### Backend Integration Gap

- Frontend does not currently use the backend API even though the backend stores useful metadata.
- No logic syncs contract-created products into MongoDB.
- No logic merges on-chain product data with backend product descriptions/images.

### Project Cleanup Gaps

- Frontend and blockchain READMEs are mostly starter template files.
- Blockchain test file is still Hardhat sample `Lock.js` and does not test `PharmaTrace`.
- There are encoding artifacts in several files where symbols display incorrectly.
- `backend/node_modules` is present inside the repository, which is usually not ideal for version control.

## 10. What Is Already Good in This Project

- Strong real-world use case: medicine authenticity and anti-counterfeit tracking
- Good project split into frontend, backend, and blockchain layers
- Smart contract captures the core supply-chain lifecycle clearly
- UI/UX direction is modern and presentation-ready
- Off-chain metadata model is a good idea for product details and images
- Verification page and QR-code concept fit the use case very well

## 11. What Should Be Improved Next

These are the highest-value next steps for making the project fully functional.

### Priority 1: Fix Contract/UI Alignment

- Correct role mapping in `frontend/src/utils/contract.js`
- Correct stage mapping in `frontend/src/utils/contract.js`
- Fix `registerActor` call argument order
- Fix `transferProduct` call to include stage and remarks
- Update verification page to parse transfer structs properly
- Replace `isRegistered` checks with `exists`

### Priority 2: Decide On-Chain vs Off-Chain Responsibilities

Choose one of these approaches clearly:

- Keep descriptions/images only in MongoDB and fetch them from backend
- Or store a metadata hash/URI on-chain and resolve it off-chain

Right now the code mixes both ideas.

### Priority 3: Connect Frontend to Backend

- Use backend endpoints for actor/product metadata
- Save product description and image after on-chain product creation
- Merge contract product data with MongoDB product metadata in the UI

### Priority 4: Add Real Tests

- Replace `blockchain/test/Lock.js` with tests for `PharmaTrace.sol`
- Add tests for actor registration permissions
- Add tests for manufacturer-only product creation
- Add tests for transfer flow and retailer sale flow
- Add backend API tests if possible

### Priority 5: Documentation and Dev Experience

- Add proper root README
- Add `.env.example` files for backend and blockchain
- Document local startup order
- Remove debug logs and leftover starter code

## 12. How to Run the Project Locally

Based on the current codebase, the expected local development flow is likely:

### Blockchain

In `blockchain/`:

```bash
npx hardhat node
node scripts/deploy.js
```

Or with Hardhat:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

After deployment, update the frontend contract address if needed.

### Backend

In `backend/`:

```bash
npm install
node index.js
```

Needs:

- `MONGO_URI` in `.env`

### Frontend

In `frontend/`:

```bash
npm install
npm start
```

Needs:

- MetaMask
- Local Hardhat network or matching deployed network
- Correct contract address in `src/utils/contract.js`

## 13. Overall Evaluation

PharmaTrace is a meaningful blockchain healthcare project with a good problem statement: stopping counterfeit medicines and improving supply-chain transparency.

The contract foundation is solid enough for a student project, prototype, or demo. The frontend design is strong and clearly aims at a professional product feel. The main work now is integration cleanup: the frontend, backend, and smart contract are not fully aligned yet, so some pages are likely incomplete or broken in their current state.

Once those integration issues are fixed, this project can become a very good end-to-end medicine authenticity demo with real blockchain value.

## 14. Most Important Files

- `blockchain/contracts/PharmaTrace.sol`
- `blockchain/scripts/deploy.js`
- `blockchain/hardhat.config.js`
- `backend/index.js`
- `backend/models/Actor.js`
- `backend/models/Product.js`
- `backend/controllers/actorController.js`
- `backend/controllers/productController.js`
- `frontend/src/App.js`
- `frontend/src/utils/contract.js`
- `frontend/src/pages/Landing.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Admin.jsx`
- `frontend/src/pages/Verify.jsx`
- `frontend/src/components/TransferModal.jsx`
- `frontend/src/components/StatsBar.jsx`

## 15. Final Note

This project already shows a clear product vision:

- blockchain for trust
- backend for flexible metadata
- frontend for actor operations and public verification

The biggest opportunity is not redesigning the app from scratch. It is aligning the existing pieces so they work together consistently.
