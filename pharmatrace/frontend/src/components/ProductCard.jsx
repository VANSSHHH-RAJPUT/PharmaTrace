import React from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, ArrowRight, Hash, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, shortAddress } from '../utils/contract';

const ProductCard = ({ product, index, role, account, onTransfer }) => {
  const isOwner = product.currentOwner?.toLowerCase() === account?.toLowerCase();
  const isExpired = Number(product.expiryDate) * 1000 < Date.now();
  const canTransfer = isOwner && (role === 1 || role === 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="glass"
      style={{ padding: 24, position: 'relative', overflow: 'hidden', cursor: 'default' }}
    >
      {/* Top color bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: isExpired
          ? 'linear-gradient(90deg, #ff6b6b, #ff3b3b)'
          : 'linear-gradient(90deg, #00d4ff, #7c3aed)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, background: 'rgba(0,212,255,0.1)',
          border: '1px solid rgba(0,212,255,0.2)', borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)',
        }}>
          <Package size={20} />
        </div>
        <span className={`badge ${isExpired ? 'badge-red' : 'badge-green'}`} style={{ fontSize: 11 }}>
          {isExpired ? '● Expired' : '● Active'}
        </span>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{product.name || 'Unknown'}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
        {product.description || 'No description.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {[
          { icon: <Hash size={12} />, label: 'Batch', val: product.batchNumber, mono: true, color: 'var(--cyan)' },
          { icon: <Calendar size={12} />, label: 'Mfg', val: formatDate(product.manufactureDate) },
          { icon: <Calendar size={12} />, label: 'Exp', val: formatDate(product.expiryDate), danger: isExpired },
          { icon: <Info size={12} />, label: 'Owner', val: shortAddress(product.currentOwner), mono: true },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>{row.icon}</span>
            <span style={{ color: 'var(--text-secondary)', minWidth: 40 }}>{row.label}:</span>
            <span style={{
              fontFamily: row.mono ? 'monospace' : 'inherit',
              color: row.danger ? '#ff6b6b' : row.color || 'inherit',
              fontSize: row.mono ? 12 : 13,
            }}>{row.val}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <Link to={`/verify?id=${product.id}`} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '9px 0', background: 'rgba(0,212,255,0.08)',
          border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8,
          color: 'var(--cyan)', textDecoration: 'none', fontSize: 13, fontWeight: 500,
        }}>
          <Info size={13} /> Details
        </Link>
        {canTransfer && (
          <button onClick={onTransfer} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 0', background: 'rgba(0,255,136,0.08)',
            border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8,
            color: 'var(--green)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}>
            <ArrowRight size={13} /> Transfer
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
