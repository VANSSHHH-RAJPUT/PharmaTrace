import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ethers } from 'ethers';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import Admin from './pages/Admin';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './utils/contract';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState(0);
  const [actorName, setActorName] = useState('');
  const [loading, setLoading] = useState(false);

const connectWallet = async () => {
  if (!window.ethereum) return alert('Please install MetaMask!');
  setLoading(true);
  try {
    // ✅ Add network config to fix ENS error
    const provider = new ethers.BrowserProvider(window.ethereum, {
      chainId: 31337,
      name: 'hardhat'
    });

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
    } catch (e) { setRole(0); }
  } catch (e) { console.error(e); }
  setLoading(false);
};

  const disconnect = () => {
    setAccount(null); setContract(null); setRole(0); setActorName('');
  };

  return (
    <Router>
      <div className="bg-grid" />
      <div className="content">
        <Navbar
          account={account} role={role} actorName={actorName}
          onConnect={connectWallet} onDisconnect={disconnect} loading={loading}
        />
        <Routes>
          <Route path="/" element={<Landing account={account} onConnect={connectWallet} />} />
          <Route path="/dashboard" element={<Dashboard contract={contract} account={account} role={role} />} />
          <Route path="/verify" element={<Verify contract={contract} />} />
          <Route path="/admin" element={<Admin contract={contract} account={account} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
