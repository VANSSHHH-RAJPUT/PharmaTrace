import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Shield, Package, Clock, AlertTriangle, CheckCircle, ExternalLink, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import { formatDate, shortAddress, STAGES, STAGE_COLORS } from '../utils/contract';

const Verify = ({ contract, addToast }) => {
  const [searchParams] = useSearchParams();
  const [productId, setProductId] = useState(searchParams.get('id') || '');
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = useCallback(async () => {
    if (!contract) return setError('Connect your wallet to verify products.');
    if (!productId) return setError('Please enter a Product ID.');
    setLoading(true); setError(''); setProduct(null); setHistory([]);
    try {
      const p = await contract.getProduct(productId);
      const h = await contract.getProductHistory(productId);
      setProduct({
        id: Number(p.id),
        name: p.name,
        batchNumber: p.batchNumber,
        manufacturerName: p.manufacturerName,
        manufactureDate: p.manufactureDate,
        expiryDate: p.expiryDate,
        currentOwner: p.currentOwner,
        currentStage: Number(p.currentStage),
        metadataHash: p.metadataHash,
      });
      setHistory(Array.from(h));
      addToast?.('Product verified successfully!', 'success');
    } catch (e) {
      setError('Product not found or invalid ID.');
      addToast?.('Product not found', 'error');
    }
    setLoading(false);
  }, [contract, productId, addToast]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (searchParams.get('id') && contract) handleVerify(); }, [contract]);

  const isExpired = product && Number(product.expiryDate) * 1000 < Date.now();
  const daysToExpiry = product
    ? Math.floor((Number(product.expiryDate) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isNearExpiry = daysToExpiry !== null && daysToExpiry > 0 && daysToExpiry <= 90;
  const qrValue = product ? `${window.location.origin}/verify?id=${productId}` : '';

  // ✅ PDF export
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFillColor(8, 12, 28);
    doc.rect(0, 0, pageW, 40, 'F');
    doc.setTextColor(0, 212, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PharmaTrace', 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(180, 180, 200);
    doc.text('Pharmaceutical Supply Chain Verification Report', 14, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Product Details', 14, 56);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const details = [
      ['Product Name', product.name],
      ['Batch Number', product.batchNumber],
      ['Manufacturer', product.manufacturerName],
      ['Manufacture Date', formatDate(product.manufactureDate)],
      ['Expiry Date', formatDate(product.expiryDate)],
      ['Current Stage', STAGES[product.currentStage]],
      ['Current Owner', product.currentOwner],
      ['Notes', product.metadataHash || 'N/A'],
    ];

    let y = 66;
    details.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 120);
      doc.text(label + ':', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(String(val), 70, y);
      y += 9;
    });

    y += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Chain of Custody', 14, y);
    y += 10;

    history.forEach((h, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFillColor(240, 245, 255);
      doc.rect(14, y - 5, pageW - 28, 22, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 100, 160);
      doc.text(`${i + 1}. ${STAGES[Number(h.stage)] || 'Unknown'}`, 18, y + 2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 80);
      const from = h.from === '0x0000000000000000000000000000000000000000' ? 'Created' : h.from;
      const to = h.to === '0x0000000000000000000000000000000000000000' ? 'Consumer' : h.to;
      doc.text(`From: ${from}`, 18, y + 9);
      doc.text(`To: ${to}  |  ${new Date(Number(h.timestamp) * 1000).toLocaleString()}`, 18, y + 15);
      if (h.remarks) doc.text(`Remarks: ${h.remarks}`, 18, y + 21);
      y += 30;
    });

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 170);
    doc.text('Verified on Ethereum Sepolia Testnet via PharmaTrace dApp', 14, 285);
    doc.save(`PharmaTrace-Product-${productId}-Report.pdf`);
    addToast?.('PDF report downloaded!', 'success');
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 800 }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Product Verification</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Enter a Product ID to verify its authenticity and full supply chain history.
          </p>
        </motion.div>

        {/* Search */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, color: '#ff6b6b', fontSize: 13 }}>
              <AlertTriangle size={13} /> {error}
            </div>
          )}
        </motion.div>

        {product && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>

            {/* Status banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
              borderRadius: 12, marginBottom: isNearExpiry ? 12 : 24,
              background: isExpired ? 'rgba(255,59,59,0.08)' : 'rgba(0,255,136,0.08)',
              border: `1px solid ${isExpired ? 'rgba(255,59,59,0.3)' : 'rgba(0,255,136,0.3)'}`,
            }}>
              {isExpired ? <AlertTriangle size={20} color="#ff6b6b" /> : <CheckCircle size={20} color="var(--green)" />}
              <span style={{ fontWeight: 600, color: isExpired ? '#ff6b6b' : 'var(--green)', fontSize: 15 }}>
                {isExpired ? 'This product has EXPIRED' : 'Product Verified — Authentic & Active'}
              </span>
              <span className={`badge ${STAGE_COLORS[product.currentStage] || 'badge-cyan'}`} style={{ marginLeft: 'auto', fontSize: 11 }}>
                {STAGES[product.currentStage] || 'Manufactured'}
              </span>
            </div>

            {/* ✅ Near expiry warning */}
            {isNearExpiry && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                borderRadius: 10, marginBottom: 24,
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
              }}>
                <AlertTriangle size={15} color="#f59e0b" />
                <span style={{ fontSize: 13, color: '#f59e0b' }}>
                  ⚠ This product expires in <strong>{daysToExpiry} days</strong>. Handle with care.
                </span>
              </div>
            )}

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
                  { label: 'Manufacturer', val: product.manufacturerName },
                  { label: 'Mfg Date', val: formatDate(product.manufactureDate) },
                  { label: 'Exp Date', val: formatDate(product.expiryDate), danger: isExpired },
                  { label: 'Owner', val: shortAddress(product.currentOwner), mono: true },
                  { label: 'Notes', val: product.metadataHash || '—' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 14 }}>
                    <span style={{ color: 'var(--text-secondary)', minWidth: 96, flexShrink: 0 }}>{row.label}</span>
                    <span style={{
                      fontFamily: row.mono ? 'monospace' : 'inherit',
                      color: row.danger ? '#ff6b6b' : row.color || 'var(--text-primary)',
                      fontSize: row.mono ? 12 : 14, wordBreak: 'break-all',
                    }}>{row.val}</span>
                  </div>
                ))}
              </div>

              {/* QR + Actions */}
              <div className="glass" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <div style={{ background: '#fff', padding: 16, borderRadius: 12 }}>
                  <QRCode value={qrValue} size={150} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 12, textAlign: 'center' }}>
                  Scan to verify Product #{productId}
                </p>
                <Shield size={13} color="var(--cyan)" />

                {/* ✅ PDF Export button */}
                <button onClick={exportPDF} className="btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center', fontSize: 13 }}>
                  <Download size={13} /> Export PDF Report
                </button>

                {/* ✅ Etherscan contract link */}
                <a
                  href={`https://sepolia.etherscan.io/address/${product.currentOwner}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--cyan)', textDecoration: 'none' }}
                >
                  <ExternalLink size={12} /> View Owner on Etherscan
                </a>
              </div>
            </div>

            {/* Chain of Custody */}
            <div className="glass" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <Clock size={18} color="var(--cyan)" />
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Chain of Custody</h3>
                <span className="badge badge-cyan" style={{ marginLeft: 'auto', fontSize: 11 }}>
                  {history.length} event{history.length !== 1 ? 's' : ''}
                </span>
              </div>

              {history.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No transfer history found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {history.map((transfer, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: i === history.length - 1 ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)',
                          border: `2px solid ${i === history.length - 1 ? 'var(--cyan)' : 'rgba(255,255,255,0.1)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700,
                          color: i === history.length - 1 ? 'var(--cyan)' : 'var(--text-secondary)',
                        }}>{i + 1}</div>
                        {i < history.length - 1 && (
                          <div style={{ width: 1, height: 32, background: 'rgba(0,212,255,0.15)', margin: '4px 0' }} />
                        )}
                      </div>
                      <div style={{ paddingTop: 4, marginBottom: 16, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span className={`badge ${STAGE_COLORS[Number(transfer.stage)] || 'badge-cyan'}`} style={{ fontSize: 11 }}>
                            {STAGES[Number(transfer.stage)] || 'Unknown'}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            {new Date(Number(transfer.timestamp) * 1000).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 4 }}>
                          <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                            {transfer.from === '0x0000000000000000000000000000000000000000'
                              ? '🏭 Created' : shortAddress(transfer.from)}
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>→</span>
                          <span style={{ fontFamily: 'monospace', color: i === history.length - 1 ? 'var(--cyan)' : 'var(--text-primary)' }}>
                            {transfer.to === '0x0000000000000000000000000000000000000000'
                              ? '🛒 Consumer (Sold)' : shortAddress(transfer.to)}
                          </span>
                        </div>
                        {transfer.remarks && (
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            "{transfer.remarks}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Verify;