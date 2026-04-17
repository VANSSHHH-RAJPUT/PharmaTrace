import React from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, ArrowRight, Hash, Info, User, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, shortAddress, STAGES, STAGE_COLORS } from '../utils/contract';

const ProductCard = ({ product, index, role, account, onTransfer, onMarkSold }) => {
  const isOwner = product.currentOwner?.toLowerCase() === account?.toLowerCase();
  const isExpired = Number(product.expiryDate) * 1000 < Date.now();
  const isSold = product.currentStage === 5;
  const canTransfer = isOwner && (role === 1 || role === 2) && !isSold;
  const canMarkSold = isOwner && role === 3 && !isSold; // ✅ Retailer only

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
        background: isSold
          ? 'linear-gradient(90deg, #00ff88, #00d4ff)'
          : isExpired
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
        <span className={`badge ${STAGE_COLORS[product.currentStage] || 'badge-cyan'}`} style={{ fontSize: 11 }}>
          ● {STAGES[product.currentStage] || 'Manufactured'}
        </span>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{product.name || 'Unknown'}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 16 }}>
        By {product.manufacturerName || 'Unknown Manufacturer'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {[
          { icon: <Hash size={12} />, label: 'Batch', val: product.batchNumber, mono: true, color: 'var(--cyan)' },
          { icon: <Calendar size={12} />, label: 'Mfg', val: formatDate(product.manufactureDate) },
          { icon: <Calendar size={12} />, label: 'Exp', val: formatDate(product.expiryDate), danger: isExpired },
          { icon: <User size={12} />, label: 'Owner', val: shortAddress(product.currentOwner), mono: true },
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

        {/* ✅ Transfer button for Manufacturer / Distributor */}
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

        {/* ✅ Mark as Sold button for Retailer */}
        {canMarkSold && (
          <button onClick={onMarkSold} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 0', background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8,
            color: '#f59e0b', cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}>
            <ShoppingBag size={13} /> Mark Sold
          </button>
        )}

        {/* ✅ Sold badge — no actions available */}
        {isSold && (
          <span style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 0', background: 'rgba(0,255,136,0.05)',
            border: '1px solid rgba(0,255,136,0.15)', borderRadius: 8,
            color: 'var(--green)', fontSize: 13, fontWeight: 500,
          }}>
            ✓ Sold
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;