import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, AlertTriangle } from 'lucide-react';

const TransferModal = ({ product, contract, onClose, onSuccess }) => {
  const [toAddress, setToAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleTransfer = async () => {
    if (!toAddress || !toAddress.startsWith('0x')) {
      return setMsg('Please enter a valid Ethereum address.');
    }
    setLoading(true); setMsg('');
    try {
      const tx = await contract.transferProduct(product.id, toAddress);
      setMsg('⏳ Submitting transaction...');
      await tx.wait();
      setMsg('✅ Transfer successful!');
      setTimeout(onSuccess, 1500);
    } catch (e) {
      setMsg('❌ ' + (e.reason || e.message));
    }
    setLoading(false);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass" style={{ width: '100%', maxWidth: 460, padding: 32 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600 }}>Transfer Product</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{
          background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: 10, padding: 16, marginBottom: 20,
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>Transferring</p>
          <p style={{ fontWeight: 600 }}>{product.name}</p>
          <p style={{ fontSize: 12, color: 'var(--cyan)', fontFamily: 'monospace' }}>{product.batchNumber}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Recipient Wallet Address</label>
          <input className="input-field" placeholder="0x..." value={toAddress}
            onChange={e => setToAddress(e.target.value)} />
        </div>

        <div style={{
          display: 'flex', gap: 8, alignItems: 'flex-start',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 8, padding: 12, marginBottom: 20,
        }}>
          <AlertTriangle size={14} color="#f59e0b" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: '#f59e0b', lineHeight: 1.5 }}>
            This is permanent. Ensure the recipient address is correct before confirming.
          </p>
        </div>

        {msg && <p style={{ marginBottom: 14, fontSize: 13, color: msg.includes('✅') ? 'var(--green)' : msg.includes('⏳') ? 'var(--cyan)' : '#ff6b6b' }}>{msg}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-green" onClick={handleTransfer} disabled={loading}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {loading ? <span className="spinner" /> : <><ArrowRight size={14} />Confirm Transfer</>}
          </button>
          <button className="btn-outline" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
        </div>
      </motion.div>
    </div>
  );
};

export default TransferModal;
