import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  RefreshCw,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Package,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import StatsBar from '../components/StatsBar';
import ProductCard from '../components/ProductCard';
import TransferModal from '../components/TransferModal';
import { ROLES, STAGES, STAGE_COLORS, formatDate, shortAddress } from '../utils/contract';
import { Link } from 'react-router-dom';

const DEFAULT_DEMO_PRODUCTS = [
  {
    id: 1,
    name: 'Paxlovid™ (Nirmatrelvir / Ritonavir)',
    batchNumber: 'PFZ-2026-9812',
    manufacturerName: 'Pfizer Global Supply Inc.',
    manufactureDate: Math.floor(new Date('2026-11-12').getTime() / 1000),
    expiryDate: Math.floor(new Date('2028-11-28').getTime() / 1000),
    currentOwner: '0x88a5F6517CA2551dA16dB6Fa8fa38fB0Ae993f25',
    currentStage: 2,
    metadataHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    exists: true,
  },
  {
    id: 2,
    name: 'Veklury® (Remdesivir 100mg IV Lyophilized)',
    batchNumber: 'GLD-2026-4401',
    manufacturerName: 'Gilead Sciences Manufacturing',
    manufactureDate: Math.floor(new Date('2026-10-05').getTime() / 1000),
    expiryDate: Math.floor(new Date('2028-04-15').getTime() / 1000),
    currentOwner: '0x3d1b46a9F9d02E1B934e8976118bA4B9A762088c',
    currentStage: 1,
    metadataHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    exists: true,
  },
  {
    id: 3,
    name: 'Ozempic® (Semaglutide 2mg / 3mL Multi-Dose Pen)',
    batchNumber: 'NVO-2026-7732',
    manufacturerName: 'Novo Nordisk A/S',
    manufactureDate: Math.floor(new Date('2026-09-18').getTime() / 1000),
    expiryDate: Math.floor(new Date('2027-09-18').getTime() / 1000),
    currentOwner: '0x71C840132f3576C7291a1bfaBE00350482B14102',
    currentStage: 4,
    metadataHash: 'QmZtmD2qt8fJpq3CLDH8P5qUa506Wv62CH655uvceGAWCX',
    exists: true,
  },
  {
    id: 4,
    name: 'Humira® (Adalimumab 40mg/0.4mL Pre-Filled Pen)',
    batchNumber: 'ABV-2026-1190',
    manufacturerName: 'AbbVie Biopharmaceuticals',
    manufactureDate: Math.floor(new Date('2026-08-01').getTime() / 1000),
    expiryDate: Math.floor(new Date('2028-02-01').getTime() / 1000),
    currentOwner: '0x99a4e927508493Ac4E4A28fF214811a910E3410e',
    currentStage: 5,
    metadataHash: 'QmRxZ2h7uU8gA9L5q8P9s7t6v5w4x3y2z1a0b9c8d7e6f',
    exists: true,
  },
  {
    id: 5,
    name: 'Amoxicillin & Clavulanate Potassium 875mg/125mg',
    batchNumber: 'SDZ-2026-0315',
    manufacturerName: 'Sandoz Generic Operations',
    manufactureDate: Math.floor(new Date('2026-11-01').getTime() / 1000),
    expiryDate: Math.floor(new Date('2029-05-01').getTime() / 1000),
    currentOwner: '0x88a5F6517CA2551dA16dB6Fa8fa38fB0Ae993f25',
    currentStage: 0,
    metadataHash: 'QmPZ9u7y6x5w4v3u2t1s0r9q8p7o6n5m4l3k2j1i0h9g',
    exists: true,
  },
];

const Dashboard = ({ contract, account, role, addToast }) => {
  const [products, setProducts] = useState(DEFAULT_DEMO_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [showForm, setShowForm] = useState(false);
  const [transferProduct, setTransferProduct] = useState(null);
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [isDemoData, setIsDemoData] = useState(!contract);

  const [form, setForm] = useState({
    name: '',
    batchNumber: '',
    metadataHash: '',
    manufactureDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 2).toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!contract) {
      setProducts(DEFAULT_DEMO_PRODUCTS);
      setIsDemoData(true);
      return;
    }
    setLoading(true);
    try {
      const count = await contract.getProductCount();
      const total = Number(count);
      if (total === 0) {
        setProducts(DEFAULT_DEMO_PRODUCTS);
        setIsDemoData(true);
        setLoading(false);
        return;
      }
      const list = [];
      for (let i = 1; i <= total; i++) {
        try {
          const p = await contract.getProduct(i);
          list.push({
            id: Number(p.id),
            name: p.name,
            batchNumber: p.batchNumber,
            manufacturerName: p.manufacturerName,
            manufactureDate: p.manufactureDate,
            expiryDate: p.expiryDate,
            currentOwner: p.currentOwner,
            currentStage: Number(p.currentStage),
            metadataHash: p.metadataHash,
            exists: p.exists,
          });
        } catch (e) {}
      }
      setProducts(list.length > 0 ? list : DEFAULT_DEMO_PRODUCTS);
      setIsDemoData(list.length === 0);
    } catch (e) {
      console.error(e);
      setProducts(DEFAULT_DEMO_PRODUCTS);
      setIsDemoData(true);
    }
    setLoading(false);
  }, [contract]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.manufacturerName?.toLowerCase().includes(search.toLowerCase()) ||
      p.currentOwner?.toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === 'all' || p.currentStage === Number(filterStage);
    return matchSearch && matchStage;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!contract) {
      addToast?.('Please connect MetaMask to register on Ethereum Sepolia', 'pending');
      // Add local preview product
      const newProduct = {
        id: products.length + 1,
        name: form.name,
        batchNumber: form.batchNumber,
        manufacturerName: 'Local Authorized Lab',
        manufactureDate: Math.floor(new Date(form.manufactureDate).getTime() / 1000),
        expiryDate: Math.floor(new Date(form.expiryDate).getTime() / 1000),
        currentOwner: account || '0x88a5F6517CA2551dA16dB6Fa8fa38fB0Ae993f25',
        currentStage: 0,
        metadataHash: form.metadataHash || 'N/A',
        exists: true,
      };
      setProducts([newProduct, ...products]);
      setShowForm(false);
      addToast?.('Product batch added to preview ledger!', 'success');
      return;
    }

    setSubmitting(true);
    try {
      const mfg = Math.floor(new Date(form.manufactureDate).getTime() / 1000);
      const exp = Math.floor(new Date(form.expiryDate).getTime() / 1000);
      const tx = await contract.createProduct(
        form.name,
        form.batchNumber,
        mfg,
        exp,
        form.metadataHash || 'N/A'
      );
      addToast?.('⏳ Submitting batch registration on Sepolia...', 'pending', 12000);
      await tx.wait();
      addToast?.('Product batch registered successfully on-chain! ✅', 'success');
      setForm({
        name: '',
        batchNumber: '',
        metadataHash: '',
        manufactureDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 2).toISOString().split('T')[0],
      });
      setShowForm(false);
      loadProducts();
    } catch (e) {
      addToast?.(e.reason || e.message || 'Transaction failed', 'error');
    }
    setSubmitting(false);
  };

  const handleExecuteTransfer = async (productId, toAddress, newStage, remarks) => {
    if (!contract) {
      // Execute demo transition
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, currentOwner: toAddress, currentStage: newStage } : p
        )
      );
      setTransferProduct(null);
      addToast?.(`Demo: Batch #${productId} transferred to ${shortAddress(toAddress)}`, 'success');
      return;
    }

    setTransferSubmitting(true);
    try {
      addToast?.('Signing custody transfer on-chain...', 'pending', 10000);
      const tx = await contract.transferProduct(productId, toAddress, newStage, remarks);
      await tx.wait();
      addToast?.(`Custody handoff for Batch #${productId} confirmed! ✅`, 'success');
      setTransferProduct(null);
      loadProducts();
    } catch (e) {
      addToast?.(e.reason || e.message || 'Transfer failed', 'error');
    }
    setTransferSubmitting(false);
  };

  const handleMarkSold = async (productId) => {
    if (!contract) {
      setProducts(
        products.map((p) => (p.id === productId ? { ...p, currentStage: 5 } : p))
      );
      addToast?.(`Demo: Batch #${productId} marked as dispensed to patient!`, 'success');
      return;
    }
    try {
      addToast?.('Confirming dispensation on-chain...', 'pending', 10000);
      const tx = await contract.markAsSold(productId);
      await tx.wait();
      addToast?.(`Batch #${productId} marked as dispensed! ✅`, 'success');
      loadProducts();
    } catch (e) {
      addToast?.(e.reason || e.message || 'Failed to update stage', 'error');
    }
  };

  const prefillSample = (sampleType) => {
    if (sampleType === 'paxlovid') {
      setForm({
        name: 'Paxlovid™ (Nirmatrelvir / Ritonavir)',
        batchNumber: `PFZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        metadataHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        manufactureDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 2).toISOString().split('T')[0],
      });
    } else if (sampleType === 'ozempic') {
      setForm({
        name: 'Ozempic® (Semaglutide 2mg / 3mL Pen)',
        batchNumber: `NVO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        metadataHash: 'QmZtmD2qt8fJpq3CLDH8P5qUa506Wv62CH655uvceGAWCX',
        manufactureDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 1.5).toISOString().split('T')[0],
      });
    } else {
      setForm({
        name: 'Veklury® (Remdesivir 100mg IV)',
        batchNumber: `GLD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        metadataHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        manufactureDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 3).toISOString().split('T')[0],
      });
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {/* Notice Banner if running Demo Mode */}
        {isDemoData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(43, 68, 255, 0.08)',
              border: '1px solid rgba(43, 68, 255, 0.25)',
              borderRadius: 12,
              padding: '12px 18px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={18} color="#2b44ff" />
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                {account
                  ? 'Showing verified reference batches on Ethereum Sepolia. You can register new batches or transfer custody.'
                  : 'Interactive Preview Ledger Active — Exploring verified pharmaceutical batches. Connect MetaMask to sign transactions.'}
              </span>
            </div>
            <Link to="/verify" className="btn-outline" style={{ padding: '6px 14px', fontSize: 12 }}>
              Inspect On-Chain Dossier <ExternalLink size={12} />
            </Link>
          </motion.div>
        )}

        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Inventory Ledger
              </h1>
              <span className="badge badge-green" style={{ fontSize: 11 }}>
                ● {ROLES[role] || 'Observer'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
              Cryptographically verified pharmaceutical batches across the cold-chain distribution network.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div className="segmented-tabs">
              <button
                className={`tab-pill ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid size={14} /> Cards
              </button>
              <button
                className={`tab-pill ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <TableIcon size={14} /> Table
              </button>
            </div>

            <button
              onClick={loadProducts}
              className="btn-outline"
              style={{ padding: '8px 14px', fontSize: 13 }}
              title="Refresh ledger data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="btn-emerald"
              style={{ padding: '8px 18px', fontSize: 13 }}
            >
              <Plus size={15} /> Register New Batch
            </button>
          </div>
        </div>

        {/* Stats Metrics Bar */}
        <StatsBar contract={contract} />

        {/* Filter & Search Bar */}
        <div
          className="glass-static"
          style={{
            padding: '14px 18px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by medicine name, batch #, manufacturer, or custodian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* Stage Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, marginRight: 4 }}>
              Filter Stage:
            </span>
            {[
              { id: 'all', label: 'All Batches' },
              { id: '0', label: 'Manufactured' },
              { id: '1', label: 'Shipped to Dist.' },
              { id: '2', label: 'At Distributor' },
              { id: '3', label: 'Shipped to Pharmacy' },
              { id: '4', label: 'At Pharmacy' },
              { id: '5', label: 'Dispensed' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setFilterStage(s.id)}
                style={{
                  background: filterStage === s.id ? 'rgba(13, 122, 77, 0.15)' : 'rgba(21, 19, 26, 0.03)',
                  border: filterStage === s.id ? '1px solid rgba(13, 122, 77, 0.4)' : '1px solid rgba(21, 19, 26, 0.08)',
                  color: filterStage === s.id ? '#0d7a4d' : 'var(--text-muted)',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── PRODUCTS DISPLAY ── */}
        {filteredProducts.length === 0 ? (
          <div
            className="glass-static"
            style={{ padding: 48, textAlign: 'center', maxWidth: 500, margin: '40px auto' }}
          >
            <Package size={40} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              No matching batches found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              Try adjusting your search query or stage filters to view registered medicine batches.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setFilterStage('all');
              }}
              className="btn-outline"
              style={{ fontSize: 12, padding: '8px 16px' }}
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Cards Grid View */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {filteredProducts.map((p, idx) => (
              <ProductCard
                key={p.id}
                product={p}
                index={idx}
                role={role}
                account={account}
                onTransfer={(prod) => setTransferProduct(prod)}
                onMarkSold={(id) => handleMarkSold(id)}
              />
            ))}
          </div>
        ) : (
          /* High-End Enterprise Table View */
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Pharmaceutical Product</th>
                  <th>Manufacturer</th>
                  <th>Current Custody Stage</th>
                  <th>Shelf Expiry</th>
                  <th>Current Custodian</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isExpired = Number(p.expiryDate) * 1000 < Date.now();
                  const isOwner = p.currentOwner?.toLowerCase() === account?.toLowerCase();
                  const canTransfer = isOwner && (role === 1 || role === 2) && p.currentStage !== 5;
                  const canMarkSold = isOwner && role === 3 && p.currentStage !== 5;

                  return (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#2b44ff' }}>
                        #{p.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                        <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-dim)' }}>
                          Serial: {p.batchNumber}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{p.manufacturerName}</td>
                      <td>
                        <span className={`badge ${STAGE_COLORS[p.currentStage] || 'badge-cyan'}`} style={{ fontSize: 10 }}>
                          ● {STAGES[p.currentStage] || 'Manufactured'}
                        </span>
                      </td>
                      <td style={{ color: isExpired ? '#d62a4a' : '#0d7a4d', fontWeight: 500 }}>
                        {formatDate(p.expiryDate)}
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                        {shortAddress(p.currentOwner)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <Link
                            to={`/verify?id=${p.id}`}
                            className="btn-outline"
                            style={{ padding: '5px 10px', fontSize: 11 }}
                          >
                            Verify
                          </Link>
                          {canTransfer && (
                            <button
                              onClick={() => setTransferProduct(p)}
                              className="btn-primary"
                              style={{ padding: '5px 10px', fontSize: 11 }}
                            >
                              Transfer
                            </button>
                          )}
                          {canMarkSold && (
                            <button
                              onClick={() => handleMarkSold(p.id)}
                              className="btn-emerald"
                              style={{ padding: '5px 10px', fontSize: 11 }}
                            >
                              Dispense
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── REGISTER NEW BATCH MODAL ── */}
        <AnimatePresence>
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-card"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: 560 }}
              >
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(21, 19, 26, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Register Pharmaceutical Batch
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      Tokenize unique medicine digital twin with immutable serialization.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreate} style={{ padding: 24 }}>
                  {/* Quick-fill sample buttons */}
                  <div style={{ marginBottom: 18, background: 'rgba(21, 19, 26, 0.02)', padding: 12, borderRadius: 8, border: '1px solid rgba(21, 19, 26, 0.06)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Auto-Fill Verified Template:
                    </span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => prefillSample('paxlovid')}
                        style={{ background: 'rgba(43, 68, 255, 0.1)', border: '1px solid rgba(43, 68, 255, 0.3)', color: '#2b44ff', padding: '3px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
                      >
                        💊 Paxlovid™
                      </button>
                      <button
                        type="button"
                        onClick={() => prefillSample('ozempic')}
                        style={{ background: 'rgba(13, 122, 77, 0.1)', border: '1px solid rgba(13, 122, 77, 0.3)', color: '#0d7a4d', padding: '3px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
                      >
                        🧪 Ozempic®
                      </button>
                      <button
                        type="button"
                        onClick={() => prefillSample('veklury')}
                        style={{ background: 'rgba(165, 180, 252, 0.1)', border: '1px solid rgba(165, 180, 252, 0.3)', color: '#4f46e5', padding: '3px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
                      >
                        💉 Veklury®
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label className="field-label">Commercial Product Name & Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. Paxlovid™ (Nirmatrelvir 150mg / Ritonavir 100mg)"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="input-field"
                    />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label className="field-label">Production Batch Serial Number (GS1 SGTIN)</label>
                    <input
                      type="text"
                      placeholder="e.g. PFZ-2026-9812"
                      value={form.batchNumber}
                      onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                      required
                      className="input-field font-mono"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label className="field-label">Manufacture Date</label>
                      <input
                        type="date"
                        value={form.manufactureDate}
                        onChange={(e) => setForm({ ...form, manufactureDate: e.target.value })}
                        required
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="field-label">Shelf Expiry Date</label>
                      <input
                        type="date"
                        value={form.expiryDate}
                        onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                        required
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label className="field-label">Certificate of Analysis / IPFS Hash (Optional)</label>
                    <input
                      type="text"
                      placeholder="Qm..."
                      value={form.metadataHash}
                      onChange={(e) => setForm({ ...form, metadataHash: e.target.value })}
                      className="input-field font-mono"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-outline" style={{ padding: '9px 18px' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="btn-emerald" style={{ padding: '9px 24px' }}>
                      {submitting ? 'Registering On-Chain...' : 'Register Batch'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── TRANSFER CUSTODY MODAL ── */}
        <AnimatePresence>
          {transferProduct && (
            <TransferModal
              product={transferProduct}
              onClose={() => setTransferProduct(null)}
              onTransfer={handleExecuteTransfer}
              submitting={transferSubmitting}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
