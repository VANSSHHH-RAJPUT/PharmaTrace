# PharmaTrace 🏥

> A blockchain-based pharmaceutical supply chain tracker built on Ethereum Sepolia — ensuring drug authenticity, traceability, and transparency from manufacturer to consumer.

[
[
[

***

## 📌 Overview

PharmaTrace is a decentralized application (dApp) that tracks pharmaceutical products across the entire supply chain on the Ethereum blockchain. Every product creation, transfer, and sale is recorded immutably on-chain — making counterfeiting and tampering impossible.

***

## ✨ Features

- 🔐 **Role-Based Access Control** — Admin, Manufacturer, Distributor, Retailer
- 📦 **Product Registration** — Create products on-chain with batch number, dates, and metadata
- 🔄 **Supply Chain Transfer** — Transfer products between actors with stage tracking
- ✅ **Retailer Mark as Sold** — Final stage of supply chain completed on-chain
- 🔍 **Product Verification** — Verify any product by ID with full chain of custody
- 📱 **QR Code Generation** — Scan to verify products instantly
- 📄 **PDF Export** — Download full verification report
- 🔔 **Toast Notifications** — Real-time transaction feedback
- 🔗 **Etherscan Links** — Every transaction links directly to Sepolia Etherscan
- ⚠️ **Expiry Warnings** — Products expiring within 90 days are flagged
- 🌐 **Network Guard** — Auto-detects and prompts to switch to Sepolia
- 🔎 **Search & Filter** — Filter products by name, batch, or stage

***

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity 0.8.28 |
| Blockchain | Ethereum Sepolia Testnet |
| Development | Hardhat |
| Frontend | React.js + Ethers.js v6 |
| Wallet | MetaMask |
| Animations | Framer Motion |
| Icons | Lucide React |
| PDF Export | jsPDF |
| QR Code | react-qr-code |
| Deployment | Netlify (Frontend), Etherscan (Contract) |

***

## 📋 Supply Chain Flow

```
Admin
  └── Registers actors (Manufacturer, Distributor, Retailer)

Manufacturer
  └── Creates product → Stage: Manufactured

Manufacturer → Distributor
  └── Transfers product → Stage: Shipped to Distributor

Distributor → Distributor
  └── Receives → Stage: At Distributor

Distributor → Retailer
  └── Transfers → Stage: Shipped to Retailer

Retailer
  └── Receives → Stage: At Retailer
  └── Marks as Sold → Stage: Sold ✅

Anyone
  └── Verify product by ID → Full chain of custody
```

***

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- Sepolia testnet ETH ([faucet](https://sepoliafaucet.com))

### Clone the repository

```bash
git clone https://github.com/yourusername/pharmatrace.git
cd pharmatrace
```

### Blockchain Setup

```bash
cd blockchain
npm install
```

Create a `.env` file in the `blockchain/` folder:

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_metamask_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

Deploy the contract:

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Verify on Etherscan:

```bash
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
REACT_APP_CONTRACT_ADDRESS=0xE2CADaFb51B7eBa36F663170eaba7f7821695e5A
```

Start the development server:

```bash
npm start
```

***

## 🌐 Deployment

### Deploy Frontend to Netlify

1. Build the project:
```bash
npm run build
```

2. Ensure `public/_redirects` exists with:
```
/*    /index.html   200
```

3. Drag the `build/` folder to [netlify.com](https://netlify.com) or run:
```bash
npx netlify-cli deploy --prod --dir=build
```

***

## 📁 Project Structure

```
pharmatrace/
├── blockchain/
│   ├── contracts/
│   │   └── PharmaTrace.sol        ← Smart contract
│   ├── scripts/
│   │   └── deploy.js              ← Deployment script
│   ├── hardhat.config.js
│   └── .env
└── frontend/
    ├── public/
    │   └── _redirects             ← Netlify routing fix
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProductCard.jsx
        │   ├── TransferModal.jsx
        │   ├── StatsBar.jsx
        │   ├── Toast.jsx
        │   ├── AnimatedBackground.jsx
        │   └── IntroLoader.jsx
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Dashboard.jsx
        │   ├── Verify.jsx
        │   └── Admin.jsx
        └── utils/
            └── contract.js        ← ABI, address, constants
```

***

## 🔗 Links

| Resource | Link |
|---|---|
| Live App | https://pharmatrace-app.netlify.app |
| Verified Contract | https://sepolia.etherscan.io/address/0xE2CADaFb51B7eBa36F663170eaba7f7821695e5A#code |
| Sepolia Faucet | https://sepoliafaucet.com |

***

## 📸 Demo Flow

For a full demonstration:

1. Connect **Admin** wallet → Register a Manufacturer, Distributor, and Retailer
2. Connect **Manufacturer** wallet → Create a new product
3. Connect **Distributor** wallet → Transfer the product forward
4. Connect **Retailer** wallet → Mark the product as sold
5. Open **Verify** page → Enter the Product ID → View full history, QR code, export PDF

***

## 👨‍💻 Author

**Vansh Rajput**
MCA Student | Blockchain Developer | Full-Stack Developer | Mobile Developer

***

## 📄 License

This project is licensed under the MIT License.