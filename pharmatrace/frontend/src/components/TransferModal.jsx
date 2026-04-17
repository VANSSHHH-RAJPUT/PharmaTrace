import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, AlertTriangle } from 'lucide-react';
import { STAGES } from '../utils/contract';

const TransferModal = ({ product, contract, onClose, onSuccess, role }) => {
  const [toAddress, setToAddress] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // ✅ Auto-determine next stage based on current role
  const getNextStage = () => {
    if (role === 1) return 1; // Manufacturer → ShippedToDistributor
    if (role === 2) return 3; // Distributor → ShippedToRetailer
    return 1;
  };

  const getNextStageLabel = () => {
    if (role === 1) return 'Shipped to Distributor';
    if (role === 2) return 'Shipped to Retailer';
    return '';
  };

  const handleTransfer = async () => {
    if (!toAddress || !toAddress.startsWith('0x')) {
      return setMsg('❌ Please enter a valid Ethereum address.');
    }
    if (toAddress.length !== 42) {
      return setMsg('❌ Address must be 42 characters long.');
    }
    setLoading(true); setMsg('');
    try {
      const nextStage = getNextStage();
      const transferRemarks = remarks.trim() || getNextStageLabel();

      // ✅ All 4 arguments: productId, toAddress, newStage, remarks
      const tx = await contract.transferProduct(
        product.id,
        toAddress,
        nextStage,
        transferRemarks
      );
      setMsg('⏳ Submitting transaction...');
      await tx.wait();
      setMsg('✅ Transfer successful!');
      setTimeout(onSuccess, 1500);
    } catch (e) {
      if (e?.message?.includes('network changed')) {
        setMsg('✅ Transfer likely succeeded. Reloading...');
        setTimeout(() => window.location.reload(), 2000);
        return;
      }
      setMsg('❌ ' + (e.reason || e.message || e.toString()));
    }
    setLoading(false);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass" style={{ width: '100%', maxWidth: 460, padding: 32 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600 }}>Transfer Product</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Product Info */}
        <div style={{
          background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: 10, padding: 16, marginBottom: 20,
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>Transferring</p>
          <p style={{ fontWeight: 600 }}>{product.name}</p>
          <p style={{ fontSize: 12, color: 'var(--cyan)', fontFamily: 'monospace' }}>{product.batchNumber}</p>
          {/* ✅ Show current and next stage */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4 }}>
              {STAGES[product.currentStage] || 'Manufactured'}
            </span>
            <ArrowRight size={12} color="var(--cyan)" />
            <span style={{ fontSize: 11, color: 'var(--cyan)', background: 'rgba(0,212,255,0.1)', padding: '3px 8px', borderRadius: 4 }}>
              {getNextStageLabel()}
            </span>
          </div>
        </div>

        {/* Recipient Address */}
        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Recipient Wallet Address</label>
          <input
            className="input-field"
            placeholder="0x..."
            value={toAddress}
            onChange={e => setToAddress(e.target.value)}
          />
        </div>

        {/* Remarks */}
        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Remarks (optional)</label>
          <input
            className="input-field"
            placeholder={getNextStageLabel()}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
        </div>

        {/* Warning */}
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

        {msg && (
          <p style={{
            marginBottom: 14, fontSize: 13,
            color: msg.includes('✅') ? 'var(--green)' : msg.includes('⏳') ? 'var(--cyan)' : '#ff6b6b'
          }}>{msg}</p>
        )}

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