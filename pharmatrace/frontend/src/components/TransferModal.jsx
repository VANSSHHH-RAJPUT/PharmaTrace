import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, AlertCircle } from 'lucide-react';
import { STAGES } from '../utils/contract';

const TransferModal = ({ product, onClose, onTransfer, submitting }) => {
  const [toAddress, setToAddress] = useState('');
  const [stage, setStage] = useState(product ? (product.currentStage + 1 <= 4 ? product.currentStage + 1 : 4) : 1);
  const [remarks, setRemarks] = useState('');

  if (!product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!toAddress) return;
    onTransfer(product.id, toAddress, Number(stage), remarks || 'Custody handoff executed via PharmaTrace');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(21, 19, 26, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Transfer Custody Handoff
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Batch #{product.id} • {product.name} ({product.batchNumber})
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Recipient Ethereum Wallet Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              required
              className="input-field font-mono"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="field-label">New Supply Chain Custody Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              {[1, 2, 3, 4].map((s) => (
                <option key={s} value={s} style={{ background: '#ffffff', color: 'var(--text-primary)' }}>
                  Stage {s}: {STAGES[s]}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label className="field-label">Carrier & Temperature Telemetry Notes (Optional)</label>
            <textarea
              placeholder="e.g. FedEx ColdChain Flight #840, Core Temp 3.4°C verified at transfer..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="input-field"
              rows={3}
              style={{ resize: 'none' }}
            />
          </div>

          <div
            style={{
              background: 'rgba(43, 68, 255, 0.06)',
              border: '1px solid rgba(43, 68, 255, 0.2)',
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
              display: 'flex',
              gap: 10,
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}
          >
            <AlertCircle size={16} color="#2b44ff" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              This will submit a verified state transition on Ethereum Sepolia. Once confirmed, ownership transfers irrevocably to the recipient address.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn-outline" style={{ padding: '9px 18px' }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-emerald" style={{ padding: '9px 22px' }}>
              <Send size={14} />
              {submitting ? 'Submitting Tx...' : 'Sign Custody Handoff'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TransferModal;
