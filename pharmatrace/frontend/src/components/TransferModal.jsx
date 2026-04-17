import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, AlertTriangle, ExternalLink } from 'lucide-react';
import { STAGES } from '../utils/contract';

const TransferModal = ({ product, contract, onClose, onSuccess, role, addToast }) => {
  const [toAddress, setToAddress] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [txHash, setTxHash] = useState('');

  const getNextStage = () => {
    if (role === 1) return 1;
    if (role === 2) return 3;
    return 1;
  };

  const getNextStageLabel = () => {
    if (role === 1) return 'Shipped to Distributor';
    if (role === 2) return 'Shipped to Retailer';
    return '';
  };

  const handleTransfer = async () => {
    if (!toAddress || !toAddress.startsWith('0x') || toAddress.length !== 42) {
      return setMsg('❌ Please enter a valid 42-character Ethereum address.');
    }
    setLoading(true); setMsg(''); setTxHash('');
    try {
      const tx = await contract.transferProduct(
        product.id,
        toAddress,
        getNextStage(),
        remarks.trim() || getNextStageLabel()
      );
      setMsg('⏳ Submitting transaction...');
      addToast?.('Transaction submitted...', 'pending', 10000);
      const receipt = await tx.wait();
      const hash = receipt.hash;
      setTxHash(hash);
      setMsg('✅ Transfer successful!');
      addToast?.('Product transferred successfully!', 'success');
      setTimeout(onSuccess, 2000);
    } catch (e) {
      if (e?.message?.includes('network changed')) {
        setMsg('✅ Transfer likely succeeded. Reloading...');
        setTimeout(() => window.location.reload(), 2000);
        return;
      }
      const err = e.reason || e.message || 'Transaction failed';
      setMsg('❌ ' + err);
      addToast?.(err, 'error');
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

        {/* Product info */}
        <div style={{
          background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: 10, padding: 16, marginBottom: 20,
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>Transferring</p>
          <p style={{ fontWeight: 600 }}>{product.name}</p>
          <p style={{ fontSize: 12, color: 'var(--cyan)', fontFamily: 'monospace' }}>{product.batchNumber}</p>
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

        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Recipient Wallet Address</label>
          <input className="input-field" placeholder="0x..." value={toAddress}
            onChange={e => setToAddress(e.target.value)} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Remarks (optional)</label>
          <input className="input-field" placeholder={getNextStageLabel()}
            value={remarks} onChange={e => setRemarks(e.target.value)} />
        </div>

        <div style={{
          display: 'flex', gap: 8, alignItems: 'flex-start',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 8, padding: 12, marginBottom: 20,
        }}>
          <AlertTriangle size={14} color="#f59e0b" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: '#f59e0b', lineHeight: 1.5 }}>
            This action is permanent and cannot be undone. Verify the recipient address.
          </p>
        </div>

        {msg && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 13, color: msg.includes('✅') ? 'var(--green)' : msg.includes('⏳') ? 'var(--cyan)' : '#ff6b6b' }}>
              {msg}
            </p>
            {/* ✅ Etherscan link after success */}
            {txHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--cyan)', marginTop: 4 }}
              >
                <ExternalLink size={11} /> View on Etherscan
              </a>
            )}
          </div>
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