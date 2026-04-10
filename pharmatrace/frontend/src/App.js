import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
import QRCode from 'react-qr-code';  // Fixed import
import './App.css';

const CONTRACT_ADDRESS = '0x7dA30Ff218814Ef57E8EBb37cE014F022a24dDb9';
const CONTRACT_ABI = [
  "function registerActor(address wallet, uint8 role, string name)",
  "function createProduct(string name, string batchNumber, uint256 manufactureDate, uint256 expiryDate, string metadataHash)",
  "function transferProduct(uint256 productId, address to, uint8 newStage, string remarks)",
  "function markAsSold(uint256 productId)",
  "function getProduct(uint256 id)",
  "function getActor(address wallet)",
  "function getProductHistory(uint256 id)",
  "function productCount()",
  "event ProductCreated(uint256 indexed productId, string name, string batchNumber, address manufacturer)",
  "event ProductTransferred(uint256 indexed productId, address from, address to, uint8 stage, uint256 timestamp)"
];

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <h1>PharmaTrace</h1>
          <div className="nav-links">
            <Link to="/">Products</Link>
            <Link to="/verify">Verify</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/verify" element={<VerifyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

function ProductsPage() {
  const [account, setAccount] = useState('');
  const [products, setProducts] = useState([]);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState('Manufacturer');

  useEffect(() => {
    initWeb3();
    fetchProducts();
  }, []);

  const initWeb3 = async () => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov);
      const signer = await prov.getSigner();
      setAccount(await signer.getAddress());
      
      const cont = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(cont);
    }
  };

  const connectWallet = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    initWeb3();
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const createProduct = async () => {
    if (!contract) return;
    
    try {
      const tx = await contract.createProduct(
        'Paracetamol 500mg',
        `BATCH${Date.now()}`,
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + 31536000, // 1 year expiry
        'metadata-hash'
      );
      await tx.wait();
      fetchProducts();
      alert('Product created!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const transferProduct = async (productId) => {
    if (!contract) return;
    
    try {
      const tx = await contract.transferProduct(
        productId,
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // test address
        2, // AtDistributor
        'Shipped to distributor'
      );
      await tx.wait();
      alert('Product transferred!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="products-page">
      <div className="header">
        <button onClick={connectWallet} className="connect-btn">
          {account ? `Connected: ${account.slice(0,6)}...` : 'Connect Wallet'}
        </button>
        <button onClick={createProduct} className="action-btn">
          Create Product
        </button>
      </div>
      
      <div className="products-grid">
        {products.map(product => (
          <div key={product.contractId} className="product-card">
            <h3>{product.name}</h3>
            <p>Batch: {product.batchNumber}</p>
            <p>Mfg: {new Date(product.manufactureDate * 1000).toLocaleDateString()}</p>
            <p>Exp: {new Date(product.expiryDate * 1000).toLocaleDateString()}</p>
            <button onClick={() => transferProduct(product.contractId)}>
              Transfer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerifyPage() {
  const [batchId, setBatchId] = useState('');
  const [product, setProduct] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const verifyProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products?id=${batchId}`);
      setProduct(response.data[0]);
      setQrDataUrl(`http://localhost:3000/verify?batchId=${batchId}`);
    } catch (error) {
      alert('Product not found');
    }
  };

  return (
    <div className="verify-page">
      <h2>Verify Product</h2>
      <input
        type="text"
        placeholder="Enter batch number"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
        className="input"
      />
      <button onClick={verifyProduct} className="action-btn">Verify</button>
      
      {product && (
        <div className="verify-result">
          <h3>{product.name}</h3>
          <p>Batch: {product.batchNumber}</p>
          <p>Mfg Date: {new Date(product.manufactureDate * 1000).toLocaleDateString()}</p>
          <p>Exp Date: {new Date(product.expiryDate * 1000).toLocaleDateString()}</p>
          
          <div className="qr-section">
            <QRCode value={qrDataUrl} size={200} />
            <p>Share this QR for verification</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;