import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Shield, Package, Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import QRCode from 'react-qr-code';
import { formatDate, shortAddress, ROLES } from '../utils/contract';

const Verify = ({ contract }) => {
  const [searchParams] = useSearchParams();
  const [productId, setProductId] = useState(searchParams.get('id') || '');
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!contract) return setError('Connect your wallet to verify products.');
    if (!productId) return setError('Please enter a Product ID.');
    setLoading(true); setError(''); setProduct(null); setHistory(null);
    try {
      const p = await contract.getProduct(productId);
      const h = await contract.getProductHistory(productId);
      setProduct({ name: p.name, batchNumber: p.batchNumber, currentOwner: p.currentOwner,
        manufactureDate: p.manufactureDate, expiryDate: p.expiryDate, isActive: p.isActive, description: p.description });
      setHistory({ owners: h.owners, timestamps: h.timestamps });
    } catch (e) { setError('Product not found or invalid ID.'); }
    setLoading(false);
  };

  useEffect(() => { if (searchParams.get('id') && contract) handleVerify(); }, [contract]);

  const isExpired = product && Number(product.expiryDate) * 1000 < Date.now();
  const qrValue = product ? `${window.location.origin}/verify?id=${productId}` : '';

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 800 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Product Verification</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Enter a Product ID to verify its authenticity and full supply chain history.</p>
        </motion.div>

        {/* Search bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass" style={{ padding: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input className="input-field" placeholder="Enter Product ID (e.g. 1, 2, 3...)"
              value={productId} onChange={e => setProductId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              style={{ fontSize: 15 }} />
            <button className="btn-primary" onClick={handleVerify} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 24px', whiteSpace: 'nowrap' }}>
              {loading ? <span className="spinner" /> : <><Search size={14} /> Verify</>}
            </button>
          </div>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
              color: '#ff6b6b', fontSize: 13 }}>
              <AlertTriangle size={13} /> {error}
            </div>
          )}
        </motion.div>

        {/* Result */}
        {product && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>

            {/* Status banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, marginBottom: 24,
              background: isExpired ? 'rgba(255,59,59,0.08)' : 'rgba(0,255,136,0.08)',
              border: `1px solid ${isExpired ? 'rgba(255,59,59,0.3)' : 'rgba(0,255,136,0.3)'}`,
            }}>
              {isExpired
                ? <AlertTriangle size={20} color="#ff6b6b" />
                : <CheckCircle size={20} color="var(--green)" />
              }
              <span style={{ fontWeight: 600, color: isExpired ? '#ff6b6b' : 'var(--green)', fontSize: 15 }}>
                {isExpired ? 'This product has EXPIRED' : 'Product Verified — Authentic & Active'}
              </span>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
              {/* Product Details */}
              <div className="glass" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <Package size={18} color="var(--cyan)" />
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>Product Details</h3>
                </div>
                {[
                  { label: 'Name', val: product.name },
                  { label: 'Batch No.', val: product.batchNumber, mono: true, color: 'var(--cyan)' },
                  { label: 'Mfg Date', val: formatDate(product.manufactureDate) },
                  { label: 'Exp Date', val: formatDate(product.expiryDate), danger: isExpired },
                  { label: 'Current Owner', val: shortAddress(product.currentOwner), mono: true },
                  { label: 'Description', val: product.description },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 14 }}>
                    <span style={{ color: 'var(--text-secondary)', minWidth: 96, flexShrink: 0 }}>{row.label}</span>
                    <span style={{
                      fontFamily: row.mono ? 'monospace' : 'inherit',
                      color: row.danger ? '#ff6b6b' : row.color || 'var(--text-primary)',
                      fontSize: row.mono ? 12 : 14, wordBreak: 'break-all'
                    }}>{row.val}</span>
                  </div>
                ))}
              </div>

              {/* QR Code */}
              <div className="glass" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                  <QRCode value={qrValue} size={160} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
                  Scan to verify Product #{productId} on PharmaTrace
                </p>
              </div>
            </div>

            {/* Chain of Custody */}
            {history && (
              <div className="glass" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <Clock size={18} color="var(--cyan)" />
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>Chain of Custody</h3>
                  <span className="badge badge-cyan" style={{ marginLeft: 'auto', fontSize: 11 }}>
                    {history.owners.length} transfer{history.owners.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {history.owners.map((owner, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: i === history.owners.length - 1 ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.05)',
                          border: `2px solid ${i === history.owners.length - 1 ? 'var(--cyan)' : 'rgba(255,255,255,0.1)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700,
                          color: i === history.owners.length - 1 ? 'var(--cyan)' : 'var(--text-secondary)',
                        }}>{i + 1}</div>
                        {i < history.owners.length - 1 && (
                          <div style={{ width: 1, height: 28, background: 'rgba(0,212,255,0.15)', margin: '4px 0' }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: i < history.owners.length - 1 ? 0 : 0, paddingTop: 4, marginBottom: 8 }}>
                        <p style={{ fontFamily: 'monospace', fontSize: 13, color: i === history.owners.length - 1 ? 'var(--cyan)' : 'var(--text-primary)', marginBottom: 2 }}>
                          {owner}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {new Date(Number(history.timestamps[i]) * 1000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Verify;
