import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import Admin from './pages/Admin';
import Register from './pages/Register';
import AnimatedBackground from './components/AnimatedBackground';
import IntroLoader from './components/IntroLoader';
import Toast, { useToast } from './components/Toast';
import { CONTRACT_ADDRESS, CONTRACT_ABI, EXPECTED_CHAIN_ID, EXPECTED_CHAIN_HEX, NETWORK_NAME } from './utils/contract';
import './App.css';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ProtectedAdminRoute = ({ account, role, children }) => {
  if (!account) return <Navigate to="/" replace />;
  if (role !== 4) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState(0);
  const [actorName, setActorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  // ✅ Fallback: force intro complete after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setIntroComplete(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const checkNetwork = async () => {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setWrongNetwork(parseInt(chainId, 16) !== EXPECTED_CHAIN_ID);
    };
    const handleChainChanged = (chainId) => {
      setWrongNetwork(parseInt(chainId, 16) !== EXPECTED_CHAIN_ID);
      window.location.reload();
    };
    const handleAccountsChanged = () => window.location.reload();
    checkNetwork();
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EXPECTED_CHAIN_HEX }],
      });
    } catch (e) {
      if (e.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: EXPECTED_CHAIN_HEX,
            chainName: 'Sepolia Test Network',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask!');
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
        setWrongNetwork(true);
        setLoading(false);
        return;
      }
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const ct = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setAccount(address);
      setContract(ct);
      setWrongNetwork(false);
      try {
        const actor = await ct.getActor(address);
        setRole(Number(actor.role));
        setActorName(actor.name);
        if (Number(actor.role) === 0) {
          const [, , reqStatus, reqExists] = await ct.getRegistrationRequest(address);
          if (reqExists && Number(reqStatus) === 0) {
            addToast('Registration pending admin approval', 'pending');
          } else {
            addToast('Wallet connected — not registered as actor', 'pending');
          }
        } else {
          addToast(`Connected as ${actor.name || address.slice(0, 6)}`, 'success');
        }
      } catch (e) {
        setRole(0); setActorName('');
        addToast('Wallet connected', 'pending');
      }
    } catch (e) {
      console.error(e);
      addToast('Failed to connect wallet', 'error');
    }
    setLoading(false);
  };

  const disconnect = () => {
    setAccount(null); setContract(null); setRole(0); setActorName('');
    addToast('Wallet disconnected', 'pending');
  };

  return (
    <Router>
      {!introComplete && <IntroLoader onComplete={() => setIntroComplete(true)} />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 1 }}
        style={{ pointerEvents: introComplete ? 'all' : 'none' }}
      >
        <div className="bg-grid" />
        <AnimatedBackground />

        {wrongNetwork && (
          <motion.div initial={{ y: -60 }} animate={{ y: 0 }} style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
            background: 'rgba(245,158,11,0.95)', backdropFilter: 'blur(10px)',
            padding: '12px 24px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 12,
          }}>
            <AlertTriangle size={16} color="#000" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>
              Wrong network. Please switch to {NETWORK_NAME}.
            </span>
            <button onClick={switchToSepolia} style={{
              background: '#000', color: '#f59e0b', border: 'none',
              padding: '6px 16px', borderRadius: 6, cursor: 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
              Switch to {NETWORK_NAME}
            </button>
          </motion.div>
        )}

        <div className="content" style={{ paddingTop: wrongNetwork ? 48 : 0 }}>
          <Navbar
            account={account} role={role} actorName={actorName}
            onConnect={connectWallet} onDisconnect={disconnect} loading={loading}
          />
          <Routes>
            <Route path="/" element={<Landing account={account} onConnect={connectWallet} />} />
            <Route path="/dashboard" element={
              <Dashboard contract={contract} account={account} role={role} addToast={addToast} />
            } />
            <Route path="/verify" element={<Verify contract={contract} addToast={addToast} />} />
            <Route path="/register" element={
              <Register contract={contract} account={account} role={role} addToast={addToast} onConnect={connectWallet} />
            } />
            <Route path="/admin" element={
              <ProtectedAdminRoute account={account} role={role}>
                <Admin contract={contract} account={account} addToast={addToast} />
              </ProtectedAdminRoute>
            } />
          </Routes>
        </div>

        <Toast toasts={toasts} removeToast={removeToast} />
      </motion.div>
    </Router>
  );
}

export default App;