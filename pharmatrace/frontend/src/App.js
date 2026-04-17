import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import Admin from './pages/Admin';
import AnimatedBackground from './components/AnimatedBackground';
import IntroLoader from './components/IntroLoader';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './utils/contract';
import './App.css';
import { motion } from 'framer-motion';

// ✅ Protected Route component
const ProtectedAdminRoute = ({ account, role, children }) => {
  if (!account) {
    return <Navigate to="/" replace />;
  }
  if (role !== 4) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState(0);
  const [actorName, setActorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = () => window.location.reload();
    const handleAccountsChanged = () => window.location.reload();

    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask!');
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const ct = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setAccount(address);
      setContract(ct);
      try {
        const actor = await ct.getActor(address);
        setRole(Number(actor.role));
        setActorName(actor.name);
      } catch (e) {
        setRole(0);
        setActorName('');
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const disconnect = () => {
    setAccount(null);
    setContract(null);
    setRole(0);
    setActorName('');
  };

  return (
    <Router>
      {!introComplete && (
        <IntroLoader onComplete={() => setIntroComplete(true)} />
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 1 }}
        style={{ pointerEvents: introComplete ? 'all' : 'none' }}
      >
        <div className="bg-grid" />
        <AnimatedBackground />
        <div className="content">
          <Navbar
            account={account} role={role} actorName={actorName}
            onConnect={connectWallet} onDisconnect={disconnect} loading={loading}
          />
          <Routes>
            <Route path="/" element={<Landing account={account} onConnect={connectWallet} />} />
            <Route path="/dashboard" element={<Dashboard contract={contract} account={account} role={role} />} />
            <Route path="/verify" element={<Verify contract={contract} />} />

            {/* ✅ Admin route — only role 4 can access */}
            <Route path="/admin" element={
              <ProtectedAdminRoute account={account} role={role}>
                <Admin contract={contract} account={account} />
              </ProtectedAdminRoute>
            } />
          </Routes>
        </div>
      </motion.div>
    </Router>
  );
}

export default App;