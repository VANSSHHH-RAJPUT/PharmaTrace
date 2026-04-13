import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, Shield } from 'lucide-react';
import { ROLES, ROLE_COLORS } from '../utils/contract';

const Admin = ({ contract, account }) => {
  const [form, setForm] = useState({ wallet: '', role: '1', name: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupWallet, setLookupWallet] = useState('');
  const [lookedUp, setLookedUp] = useState(null);
  const [lookupMsg, setLookupMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!contract) return setMsg('Connect wallet first.');
    setLoading(true); setMsg('');
    try {
      const tx = await contract.registerActor(form.wallet, Number(form.role), form.name);
      setMsg('⏳ Submitting transaction...');
      await tx.wait();
      setMsg('✅ Actor registered successfully!');
      setForm({ wallet: '', role: '1', name: '' });
    } catch (e) {
      setMsg('❌ ' + (e.reason || e.message));
    }
    setLoading(false);
  };

  const handleLookup = async () => {
    if (!contract) return setLookupMsg('❌ Connect wallet first.');
    if (!lookupWallet) return setLookupMsg('❌ Enter a wallet address.');
    setLookedUp(null); setLookupMsg('');
    try {
      const actor = await contract.getActor(lookupWallet);
      const role = Number(actor.role);
      const name = actor.name;
      const isRegistered = actor.isRegistered;
      if (!isRegistered) {
        setLookupMsg('⚠️ This wallet is not registered.');
        return;
      }
      setLookedUp({ role, name, isRegistered });
    } catch (e) {
      setLookupMsg('❌ Actor not found or invalid address.');
    }
  };

  if (!account) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass" style={{ padding: 48, textAlign: 'center', maxWidth: 400 }}>
        <Shield size={48} color="var(--cyan)" style={{ marginBottom: 16, opacity: 0.6 }} />
        <h2 style={{ marginBottom: 10 }}>Admin Access Required</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Connect your admin wallet to manage actors.</p>
      </motion.div>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage registered actors in the PharmaTrace network.</p>
        </motion.div>

        <div className="grid-2" style={{ alignItems: 'start' }}>

          {/* Register Actor */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="glass" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <UserPlus size={18} color="var(--cyan)" />
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Register Actor</h3>
            </div>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="field-label">Wallet Address</label>
                <input className="input-field" placeholder="0x..." value={form.wallet}
                  onChange={e => setForm({ ...form, wallet: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Full Name / Company</label>
                <input className="input-field" placeholder="e.g. PharmaCo Ltd." value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Assign Role</label>
                <select className="input-field" value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="1">Manufacturer</option>
                  <option value="2">Distributor</option>
                  <option value="3">Retailer</option>
                  <option value="4">Admin</option>
                </select>
              </div>

              {msg && (
                <p style={{
                  fontSize: 13, padding: '10px 14px', borderRadius: 8,
                  background: msg.includes('✅') ? 'rgba(0,255,136,0.08)' : msg.includes('⏳') ? 'rgba(0,212,255,0.08)' : 'rgba(255,59,59,0.08)',
                  color: msg.includes('✅') ? 'var(--green)' : msg.includes('⏳') ? 'var(--cyan)' : '#ff6b6b',
                  border: `1px solid ${msg.includes('✅') ? 'rgba(0,255,136,0.2)' : msg.includes('⏳') ? 'rgba(0,212,255,0.2)' : 'rgba(255,59,59,0.2)'}`,
                }}>{msg}</p>
              )}

              <button type="submit" className="btn-primary" disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {loading ? <span className="spinner" /> : <><UserPlus size={14} /> Register Actor</>}
              </button>
            </form>
          </motion.div>

          {/* Lookup Actor */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="glass" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Users size={18} color="var(--purple)" />
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Lookup Actor</h3>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Wallet Address</label>
              <input className="input-field" placeholder="0x..." value={lookupWallet}
                onChange={e => { setLookupWallet(e.target.value); setLookedUp(null); setLookupMsg(''); }} />
            </div>

            <button className="btn-outline" onClick={handleLookup} style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6, marginBottom: 20
            }}>
              <Users size={14} /> Lookup
            </button>

            {/* Lookup error/warning */}
            {lookupMsg && (
              <p style={{
                fontSize: 13, marginBottom: 16, padding: '10px 14px', borderRadius: 8,
                background: lookupMsg.includes('✅') ? 'rgba(0,255,136,0.08)' : 'rgba(255,59,59,0.08)',
                color: lookupMsg.includes('✅') ? 'var(--green)' : '#ff6b6b',
                border: `1px solid ${lookupMsg.includes('✅') ? 'rgba(0,255,136,0.2)' : 'rgba(255,59,59,0.2)'}`,
              }}>{lookupMsg}</p>
            )}

            {/* Lookup Result */}
            {lookedUp && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(0,212,255,0.05)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: 10, padding: 20, marginBottom: 20
                }}>

                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, minWidth: 60 }}>Name</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>
                    {lookedUp.name || <span style={{ color: '#ff6b6b' }}>No name set</span>}
                  </span>
                </div>

                {/* Role */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, minWidth: 60 }}>Role</span>
                  <span className={`badge ${ROLE_COLORS[lookedUp.role] || 'badge-cyan'}`} style={{ fontSize: 12 }}>
                    {ROLES[lookedUp.role] || 'Unknown'}
                  </span>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, minWidth: 60 }}>Status</span>
                  <span className={`badge ${lookedUp.isRegistered ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 12 }}>
                    {lookedUp.isRegistered ? '● Registered' : '● Not Registered'}
                  </span>
                </div>

              </motion.div>
            )}

            <div className="divider" />
            <div style={{
              padding: '12px 16px',
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: 10
            }}>
              <p style={{ fontSize: 13, color: '#a78bfa', lineHeight: 1.6 }}>
                <strong>⚠ Admin Note:</strong> Only the deployer wallet can register actors. Ensure your connected wallet matches the contract owner.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Admin;