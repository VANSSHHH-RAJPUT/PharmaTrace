import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, QrCode, Send, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, shortAddress, STAGES, STAGE_COLORS } from '../utils/contract';

const ProductCard = ({ product, index, role, account, onTransfer, onMarkSold }) => {
  const [copied, setCopied] = useState(false);
  const isOwner = product.currentOwner?.toLowerCase() === account?.toLowerCase();
  const isExpired = Number(product.expiryDate) * 1000 < Date.now();
  const isSold = product.currentStage === 5;
  const canTransfer = isOwner && (role === 1 || role === 2) && !isSold;
  const canMarkSold = isOwner && role === 3 && !isSold;

  const daysToExpiry = Math.floor((Number(product.expiryDate) * 1000 - Date.now()) / (1000 * 60 * 60 * 24));

  const handleCopy = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="glass-panel"
      style={{
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                color: '#2b44ff',
                fontWeight: 600,
                display: 'block',
                marginBottom: 3,
              }}
            >
              #{product.id}
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              {product.name || 'Pharmaceutical Batch'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
              {product.manufacturerName || 'Certified Producer'}
            </p>
          </div>

          <span className={`badge ${STAGE_COLORS[product.currentStage] || 'badge-cyan'}`} style={{ fontSize: 10 }}>
            ● {STAGES[product.currentStage] || 'Manufactured'}
          </span>
        </div>

        {/* Data Box */}
        <div
          style={{
            background: 'rgba(21, 19, 26, 0.02)',
            border: '1px solid rgba(21, 19, 26, 0.06)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginBottom: 18,
            fontSize: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Batch Serial</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)', fontWeight: 600 }}>
                {product.batchNumber}
              </span>
              <button
                onClick={(e) => handleCopy(product.batchNumber, e)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                title="Copy Batch Number"
              >
                {copied ? <Check size={12} color="#0d7a4d" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Shelf-Life Expiry</span>
            <span
              style={{
                color: isExpired ? '#d62a4a' : daysToExpiry < 90 ? '#a35a00' : '#0d7a4d',
                fontWeight: 600,
              }}
            >
              {formatDate(product.expiryDate)} {isExpired ? '(Expired)' : `(${daysToExpiry}d)`}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Current Custodian</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
              {shortAddress(product.currentOwner)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link
          to={`/verify?id=${product.id}`}
          className="btn-outline"
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: 12,
            justifyContent: 'center',
          }}
        >
          <QrCode size={13} color="#2b44ff" /> Verify Dossier
        </Link>

        {canTransfer && (
          <button
            onClick={() => onTransfer?.(product)}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: 12 }}
          >
            <Send size={13} /> Transfer
          </button>
        )}

        {canMarkSold && (
          <button
            onClick={() => onMarkSold?.(product.id)}
            className="btn-emerald"
            style={{ padding: '8px 14px', fontSize: 12 }}
          >
            <CheckCircle2 size={13} /> Dispense
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
