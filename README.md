# PharmaTrace 🏥 🛡️ 🔗

> **PharmaTrace** is a premium, decentralized hybrid application (dApp) designed to secure, track, and verify the pharmaceutical supply chain. By combining the trust and immutability of the **Ethereum Sepolia Testnet** with the flexibility of a **Node.js/Express & MongoDB** backend, PharmaTrace eliminates counterfeit drugs and provides end-to-end transparency from manufacturer to the end consumer.

---

## 📌 Table of Contents

- [🏛️ System Architecture](#-system-architecture)
- [✨ Key Features](#-key-features)
  - [🔒 Smart Contract (On-Chain)](#-smart-contract-on-chain)
  - [🚀 Backend API (Off-Chain)](#-backend-api-off-chain)
  - [🎨 Frontend Dashboard (Client)](#-frontend-dashboard-client)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Supply Chain Lifecycle & Flow](#-supply-chain-lifecycle--flow)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start & Installation](#-quick-start--installation)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone the Repository](#2-clone-the-repository)
  - [3. Smart Contract Configuration (Blockchain)](#3-smart-contract-configuration-blockchain)
  - [4. Express Server & Database Configuration (Backend)](#4-express-server--database-configuration-backend)
  - [5. React Client Configuration (Frontend)](#5-react-client-configuration-frontend)
- [📡 API Endpoints](#-api-endpoints)
  - [Products Controller (`/api/products`)](#products-controller-apiproducts)
  - [Actors Controller (`/api/actors`)](#actors-controller-apiactors)
- [📸 Live Demonstration Workflow](#-live-demonstration-workflow)
- [👨‍💻 Author & Contributions](#-author--contributions)
- [📄 License](#-license)

---

## 🏛️ System Architecture

PharmaTrace utilizes a **hybrid blockchain-database architecture** designed for high scalability, auditability, and efficiency.
- **On-Chain (Solidity + Hardhat + Sepolia Testnet)**: Maintains role-based access control, cryptographic verification records, stage-tracking, ownership transfers, and complete chain-of-custody logs.
- **Off-Chain (Express + Node.js + MongoDB Mongoose)**: Stores rich, high-resolution media, image URLs, descriptions, and advanced metadata linked to the blockchain contract via unique Product IDs (`contractId`) and actor wallets.

```
                  ┌─────────────────────────────────────────┐
                  │          MetaMask Wallet (Client)       │
                  └──────────────┬────────────────────┬─────┘
                                 │                    │
                  (Read/Write Smart Contract)    (REST API Calls)
                                 │                    │
                                 ▼                    ▼
     ┌───────────────────────────────────────┐   ┌─────────────────────────────────────┐
     │      Ethereum Sepolia Blockchain      │   │          Node/Express API           │
     │   ┌───────────────────────────────┐   │   │   ┌─────────────────────────────┐   │
     │   │   PharmaTrace.sol Contract    │   │   │   │     Mongoose Models         │   │
     │   └───────────────────────────────┘   │   │   └──────────────┬──────────────┘   │
     └───────────────────────────────────────┘   └──────────────────┼──────────────────┘
                                                                    ▼
                                                         ┌─────────────────────┐
                                                         │       MongoDB       │
                                                         └─────────────────────┘
```

---

## ✨ Key Features

### 🔒 Smart Contract (On-Chain)
- **Role-Based Access Control (RBAC)**: Integrates `Admin`, `Manufacturer`, `Distributor`, `Retailer`, and `None` states.
- **Self-Registration Requests**: Actors can request to register as a specific role; the Admin reviews, approves, or rejects requests via on-chain state updates.
- **Strict Supply Chain Constraints**: Products can only be transferred between legitimate registered parties.
- **Immutable Transfer History**: Logs every transaction (`from`, `to`, `stage`, `timestamp`, `remarks`) automatically into the block history.
- **Consumer Protections**: Prevents resale of sold products, and permits only a registered `Retailer` to mark a product as `Sold` to a consumer.

### 🚀 Backend API (Off-Chain)
- **Actor Syncing**: Synchronizes wallet address, roles, and company names off-chain for lightning-fast lookups.
- **Rich Metadata Store**: Saves extra information (like image URLs, description blurbs) not practical to store on-chain due to gas optimization.
- **Aggregated Queries**: Instantly lists products sorted by registration date.

### 🎨 Frontend Dashboard (Client)
- **Auto-Switch Network Guard**: Prompts and assists users to switch MetaMask automatically to the Sepolia Network.
- **Interactive Timeline**: Real-time multi-stage visual tracking showing current and past holders, timestamps, and custom remarks.
- **Dynamic Stats Bar**: Displays active products, registered actors, transfer count, and pending requests in real-time.
- **QR Code Generation**: Instantly renders standard-compliant QR codes for quick mobile-based product authentication.
- **PDF Report Exporter**: Automatically generates premium PDF certificates featuring the complete supply chain history and verification QR code.
- **Expiry Warn System**: Visual indicators alert users if products are expiring within 90 days.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Smart Contract** | `Solidity ^0.8.28` | Multi-role blockchain logic |
| **Blockchain Engine** | `Hardhat` | Development, compilation, testing & deployment suite |
| **Testnet Network** | `Ethereum Sepolia` | Public testnet execution environment |
| **Web Server** | `Node.js + Express 5` | RESTful API engine |
| **Database** | `MongoDB + Mongoose 9` | Schema-driven off-chain metadata store |
| **Web Client** | `React.js` | Single-page modern interactive dashboard |
| **Web3 Provider** | `Ethers.js v6` | Type-safe wallet and contract interaction layer |
| **Animations** | `Framer Motion` | Modern, high-performance UI transitions |
| **Icons & Elements** | `Lucide React` | Clean, responsive modern vector icons |
| **Export Engines** | `jsPDF` + `react-qr-code` | Dynamic certificate generation & scanner codes |

---

## 📦 Supply Chain Lifecycle & Flow

```
   ┌────────────────────────────────────────────────────────────┐
   │                       Admin Wallet                         │
   │           Approves Registration of supply chain actors      │
   └─────────────┬──────────────────────────┬───────────────────┘
                 │                          │
                 ▼                          ▼
      ┌──────────────────────┐   ┌──────────────────────┐
      │  Manufacturer Role   │   │   Distributor Role   │
      └──────────┬───────────┘   └──────────┬───────────┘
                 │                          │
                 │ (Create Product)         │
                 ▼                          │
         [ Manufactured ]                   │
                 │                          │
                 │ (Transfer)               │
                 ▼                          │
      [ ShippedToDistributor ]              │
                 │                          │
                 └─────────────────────────►│ (Receive/Acknowledge)
                                            ▼
                                     [ AtDistributor ]
                                            │
                                            │ (Transfer)
                                            ▼
                                   [ ShippedToRetailer ]
                                            │
                                            │
                 ┌──────────────────────────┘
                 ▼
      ┌──────────────────────┐
      │    Retailer Role     │
      └──────────┬───────────┘
                 │ (Receive/Acknowledge)
                 ▼
          [ AtRetailer ]
                 │
                 │ (Sell to Consumer)
                 ▼
            [ Sold 🏁 ]
```

---

## 📁 Project Structure

```
pharmatrace/
├── backend/                       ← Off-chain Express Server
│   ├── controllers/               ← Business controllers (products, actors)
│   ├── models/                    ← Mongoose DB Schemas (Product, Actor)
│   ├── routes/                    ← Express REST endpoints
│   ├── .env                       ← Backend configuration
│   └── index.js                   ← Main entry point
├── blockchain/                    ← Ethereum Smart Contracts
│   ├── contracts/
│   │   └── PharmaTrace.sol        ← Solidity contract (Enums, Structs, Roles)
│   ├── scripts/
│   │   └── deploy.js              ← Hardhat deployment script
│   ├── hardhat.config.js          ← Compilers, networks, Etherscan keys
│   └── .env                       ← Blockchain RPC URLs & secrets
└── frontend/                      ← React Dashboard client
    ├── public/
    │   └── _redirects             ← Deployment redirects (Netlify compatibility)
    └── src/
        ├── components/            ← Shared modular layouts, cards & loaders
        ├── pages/                 ← Routed layout states (Dashboard, Verify, Admin)
        └── utils/
            └── contract.js        ← Smart Contract ABIs & connections
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js** v18 or later
- **MetaMask** browser extension installed
- A tiny amount of **Sepolia Testnet ETH** (Get some from a faucet: [Sepolia Faucet](https://sepoliafaucet.com) or [PublicNode Faucet](https://ethereum-sepolia-rpc.publicnode.com))

### 2. Clone the Repository
```bash
git clone https://github.com/VANSSHHH-RAJPUT/PharmaTrace.git
cd PharmaTrace/pharmatrace
```

### 3. Smart Contract Configuration (Blockchain)
1. Navigate to the blockchain directory:
   ```bash
   cd blockchain
   npm install
   ```
2. Create a `.env` file in `blockchain/` folder:
   ```env
   SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   PRIVATE_KEY=your_metamask_wallet_private_key
   ETHERSCAN_API_KEY=your_etherscan_explorer_api_key
   ```
3. Compile the Solidity Smart Contract:
   ```bash
   npx hardhat compile
   ```
4. Deploy to Sepolia:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
5. *(Optional)* Verify the contract source code on Etherscan:
   ```bash
   npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
   ```

### 4. Express Server & Database Configuration (Backend)
1. Navigate to the backend directory:
   ```bash
   cd ../backend
   npm install
   ```
2. Create a `.env` file in `backend/` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pharmatrace
   ```
3. Start the node server:
   ```bash
   node index.js
   ```
   *(Server will spin up on `http://localhost:5000`)*

### 5. React Client Configuration (Frontend)
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   npm install
   ```
2. Create a `.env` file in `frontend/` folder:
   ```env
   REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   *(The app will open automatically on `http://localhost:3000`)*

---

## 📡 API Endpoints

### Products Controller (`/api/products`)

| Method | Endpoint | Description | Request Body Parameters |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/products` | Registers product metadata off-chain | `contractId`, `name`, `batchNumber`, `manufacturerName`, `manufactureDate`, `expiryDate`, `imageUrl`, `description`, `metadataHash` |
| **GET** | `/api/products/:id` | Returns single product details | URL parameters |
| **GET** | `/api/products` | Lists all indexed products (sorted desc) | *None* |

### Actors Controller (`/api/actors`)

| Method | Endpoint | Description | Request Body Parameters |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/actors` | Saves/Updates actor credentials off-chain | `wallet`, `name`, `role` |
| **GET** | `/api/actors/:wallet` | Returns single registered actor profile | Wallet address URL parameter |

---

## 📸 Live Demonstration Workflow

To test the entire decentralized supply chain successfully, follow these standard steps:

1. **Setup System Admin**:
   - Connect the wallet that deployed the contract. By default, it is the **System Admin**.
   - Navigate to the **Admin Dashboard** and approve registration requests or register actors (e.g. Manufacturer wallet, Distributor wallet, Retailer wallet).

2. **Manufacture a Product**:
   - Switch your MetaMask address to the registered **Manufacturer** wallet.
   - Go to the Dashboard and click **Create Product**. Specify batch details, manufacture/expiry dates, upload a mock image, and submit. The product metadata gets recorded on-chain and off-chain.

3. **Ship to Distributor**:
   - From the **Manufacturer** wallet, click **Transfer Product**, select the **Distributor** wallet address, change the stage to `ShippedToDistributor`, and enter remarks (e.g., *"Cold chain temperature logged at -4°C"*).

4. **Acknowledge Delivery at Distributor**:
   - Switch MetaMask to the **Distributor** wallet. 
   - Acknowledge delivery by changing the stage to `AtDistributor` with custom transit remarks.

5. **Ship to Retailer**:
   - From the **Distributor** wallet, transfer ownership to the **Retailer** wallet, shifting stage status to `ShippedToRetailer`.

6. **Mark as Sold**:
   - Switch MetaMask to the **Retailer** wallet. 
   - Receive the items (`AtRetailer`) and finally mark the product as **Sold** once purchased by a customer. This locks the smart contract state.

7. **Verify & Audit**:
   - Anyone (even non-registered public users) can navigate to the **Verify** portal.
   - Scan or input the product ID to see the full, tamper-proof history, verify signature trails, check batch dates, and export a high-fidelity **PDF Authenticity Certificate**.

---

## 👨‍💻 Author & Contributions

**Vansh Rajput**
- 🎓 MCA Student
- 🌐 Blockchain Architect & Full-Stack Developer
- 📱 Mobile Applications Designer

---

## 📄 License

This project is licensed under the **MIT License** — feel free to fork, adapt, and use it for your supply chain requirements.
