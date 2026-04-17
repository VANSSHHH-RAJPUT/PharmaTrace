import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, RefreshCw } from 'lucide-react';
import StatsBar from '../components/StatsBar';
import ProductCard from '../components/ProductCard';
import TransferModal from '../components/TransferModal';
import { ROLES } from '../utils/contract';

const Dashboard = ({ contract, account, role }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [transferProduct, setTransferProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', batchNumber: '', metadataHash: '', manufactureDate: '', expiryDate: ''
  });
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const count = await contract.getProductCount();
      const list = [];
      for (let i = 1; i <= Number(count); i++) {
        try {
          const p = await contract.getProduct(i);
          const isOwner = p.currentOwner?.toLowerCase() === account?.toLowerCase();
          if (role === 4 || isOwner) {
            list.push({
              id: Number(p.id),
              name: p.name,
              batchNumber: p.batchNumber,
              manufacturerName: p.manufacturerName,
              manufactureDate: p.manufactureDate,
              expiryDate: p.expiryDate,
              currentOwner: p.currentOwner,
              currentStage: Number(p.currentStage), // ✅ correct field
              metadataHash: p.metadataHash,
              exists: p.exists,
            });
          }
        } catch (e) {}
      }
      setProducts(list);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, [contract, account]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!contract) return setMsg('Connect wallet first.');
    setSubmitting(true); setMsg('');
    try {
      const mfg = Math.floor(new Date(form.manufactureDate).getTime() / 1000);
      const exp = Math.floor(new Date(form.expiryDate).getTime() / 1000);
      const tx = await contract.createProduct(
        form.name,
        form.batchNumber,
        mfg,
        exp,
        form.metadataHash || 'N/A' // ✅ metadataHash instead of description
      );
      setMsg('⏳ Confirming transaction...');
      await tx.wait();
      setMsg('✅ Product created successfully!');
      setForm({ name: '', batchNumber: '', metadataHash: '', manufactureDate: '', expiryDate: '' });
      setShowForm(false);
      loadProducts();
    } catch (e) {
      if (e?.message?.includes('network changed')) {
        setMsg('✅ Product likely created. Reloading...');
        setTimeout(() => window.location.reload(), 2000);
        return;
      }
      setMsg('❌ ' + (e.reason || e.message));
    }
    setSubmitting(false);
  };

  if (!account) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass" style={{ padding: 48, textAlign: 'center', maxWidth: 400 }}>
        <Package size={48} color="var(--cyan)" style={{ marginBottom: 16, opacity: 0.6 }} />
        <h2 style={{ marginBottom: 10 }}>Connect Your Wallet</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Connect MetaMask to access your dashboard.</p>
      </motion.div>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Role: <span style={{ color: 'var(--cyan)' }}>{ROLES[role]}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={loadProducts} className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 14 }}>
              <RefreshCw size={14} className={loading ? 'spinner' : ''} /> Refresh
            </button>
            {role === 1 && (
              <button onClick={() => setShowForm(!showForm)} className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', fontSize: 14 }}>
                <Plus size={14} /> New Product
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <StatsBar contract={contract} />

        {/* Create Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="glass" style={{ padding: 28, marginBottom: 32 }}>
            <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600 }}>Register New Product</h3>
            <form onSubmit={handleCreate}>
              <div className="grid-2" style={{ marginBottom: 16 }}>
                <div>
                  <label className="field-label">Product Name</label>
                  <input className="input-field" placeholder="e.g. Paracetamol 500mg"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="field-label">Batch Number</label>
                  <input className="input-field" placeholder="e.g. BATCH-2026-001"
                    value={form.batchNumber} onChange={e => setForm({ ...form, batchNumber: e.target.value })} required />
                </div>
                <div>
                  <label className="field-label">Manufacture Date</label>
                  <input className="input-field" type="date" value={form.manufactureDate}
                    onChange={e => setForm({ ...form, manufactureDate: e.target.value })} required />
                </div>
                <div>
                  <label className="field-label">Expiry Date</label>
                  <input className="input-field" type="date" value={form.expiryDate}
                    onChange={e => setForm({ ...form, expiryDate: e.target.value })} required />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="field-label">Metadata / Notes (optional)</label>
                <textarea className="input-field" rows={3}
                  placeholder="Ingredients, dosage, storage instructions..."
                  value={form.metadataHash}
                  onChange={e => setForm({ ...form, metadataHash: e.target.value })}
                  style={{ resize: 'vertical' }} />
              </div>
              {msg && (
                <p style={{ marginBottom: 14, fontSize: 13,
                  color: msg.includes('✅') ? 'var(--green)' : msg.includes('⏳') ? 'var(--cyan)' : '#ff6b6b' }}>
                  {msg}
                </p>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn-green" disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {submitting ? <span className="spinner" /> : <><Plus size={14} /> Create Product</>}
                </button>
                <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Products Grid */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
            {role === 4 ? 'All Products' : 'My Products'}
            <span style={{ marginLeft: 10, fontSize: 14, color: 'var(--text-secondary)', fontWeight: 400 }}>
              ({products.length})
            </span>
          </h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            </div>
          ) : products.length === 0 ? (
            <div className="glass" style={{ padding: 48, textAlign: 'center' }}>
              <Package size={40} style={{ color: 'var(--text-secondary)', marginBottom: 12, opacity: 0.5 }} />
              <p style={{ color: 'var(--text-secondary)' }}>
                {role === 1 ? 'No products yet. Create one above.' : 'No products assigned to your wallet.'}
              </p>
            </div>
          ) : (
            <div className="grid-3">
              {products.map((p, i) => (
                <ProductCard
                  key={p.id} product={p} index={i} role={role} account={account}
                  onTransfer={() => setTransferProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Pass role to TransferModal */}
      {transferProduct && (
        <TransferModal
          product={transferProduct}
          contract={contract}
          role={role}
          onClose={() => setTransferProduct(null)}
          onSuccess={() => { setTransferProduct(null); loadProducts(); }}
        />
      )}
    </div>
  );
};

export default Dashboard;