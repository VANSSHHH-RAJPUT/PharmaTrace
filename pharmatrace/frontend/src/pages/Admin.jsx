import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, Shield, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ROLES, ROLE_COLORS } from '../utils/contract';

const STATUS_LABELS = ['Pending', 'Approved', 'Rejected'];
const STATUS_COLORS = ['#f59e0b', '#10b981', '#ef4444'];
const STATUS_BG = ['rgba(245,158,11,0.08)', 'rgba(16,185,129,0.08)', 'rgba(239,68,68,0.08)'];
const STATUS_BORDER = ['rgba(245,158,11,0.2)', 'rgba(16,185,129,0.2)', 'rgba(239,68,68,0.2)'];
const STATUS_ICONS = [Clock, CheckCircle, XCircle];

const Admin = ({ contract, account, addToast }) => {
  const [form, setForm] = useState({ wallet: '', role: 1, name: '' });
  const [msg, setMsg] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupWallet, setLookupWallet] = useState('');
  const [lookedUp, setLookedUp] = useState(null);
  const [lookupMsg, setLookupMsg] = useState('');

  // ── Registration Requests State ──
  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(''); // stores addr being processed

  // ── Load requests on mount ──
  useEffect(() => {
    if (contract) loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  const loadRequests = async () => {
    setReqLoading(true);
    try {
      const list = await contract.getRequestList();
      const data = await Promise.all(
        list.map(async (addr) => {
          const [companyName, role, status, exists] = await contract.getRegistrationRequest(addr);
          return { addr, companyName, role: Number(role), status: Number(status), exists };
        })
      );
      setRequests(data);
    } catch (e) {
      addToast?.('Failed to load requests', 'error');
    }
    setReqLoading(false);
  };

  const handleApprove = async (addr) => {
    setActionLoading(addr);
    try {
      const tx = await contract.approveRegistration(addr);
      addToast?.('Approving registration...', 'pending', 10000);
      await tx.wait();
      addToast?.('Registration approved!', 'success');
      loadRequests();
    } catch (e) {
      addToast?.(e.reason || 'Failed to approve', 'error');
    }
    setActionLoading('');
  };

  const handleReject = async (addr) => {
    setActionLoading(addr);
    try {
      const tx = await contract.rejectRegistration(addr);
      addToast?.('Rejecting registration...', 'pending', 10000);
      await tx.wait();
      addToast?.('Registration rejected', 'success');
      loadRequests();
    } catch (e) {
      addToast?.(e.reason || 'Failed to reject', 'error');
    }
    setActionLoading('');
  };

  // ── Existing handlers ──
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!contract) return setMsg('Connect wallet first.');
    setLoading(true); setMsg(''); setTxHash('');
    try {
      const tx = await contract.registerActor(form.wallet, form.name, Number(form.role));
      setMsg('⏳ Submitting transaction...');
      addToast?.('Transaction submitted...', 'pending', 10000);
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setMsg('✅ Actor registered successfully!');
      addToast?.(`${form.name} registered as ${ROLES[form.role]}!`, 'success');
      setForm({ wallet: '', role: 1, name: '' });
    } catch (e) {
      if (e?.message?.includes('network changed')) {
        setMsg('✅ Transaction likely succeeded. Reloading...');
        setTimeout(() => window.location.reload(), 2000);
        return;
      }
      const err = e.reason || e.message || e.toString();
      setMsg('❌ ' + err);
      addToast?.(err, 'error');
    }
    setLoading(false);
  };

  const handleLookup = async () => {
    if (!contract) return setLookupMsg('❌ Connect wallet first.');
    if (!lookupWallet) return setLookupMsg('❌ Enter a wallet address.');
    setLookedUp(null); setLookupMsg('');
    try {
      const actor = await contract.getActor(lookupWallet);
      if (!actor.exists) { setLookupMsg('⚠️ This wallet is not registered.'); return; }
      setLookedUp({ role: Number(actor.role), name: actor.name, exists: actor.exists });
    } catch (e) { setLookupMsg('❌ Actor not found or invalid address.'); }
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

  const pendingCount = requests.filter(r => r.status === 0).length;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage registered actors in the PharmaTrace network.</p>
        </motion.div>

        {/* ── Registration Requests Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass"
          style={{ padding: 28, marginBottom: 32 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={18} color="var(--purple)" />
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Registration Requests</h3>
              {pendingCount > 0 && (
                <span style={{
                  background: '#f59e0b', color: '#000', fontSize: 11,
                  fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                }}>
                  {pendingCount} pending
                </span>
              )}
            </div>
            <button
              onClick={loadRequests}
              className="btn-outline"
              style={{ fontSize: 13, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              🔄 Refresh
            </button>
          </div>

          {reqLoading ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <span className="spinner" />
              <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: 14 }}>Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 32,
              border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 10,
              color: 'var(--text-secondary)', fontSize: 14,
            }}>
              No registration requests yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {requests.map((r) => {
                const StatusIcon = STATUS_ICONS[r.status];
                const isProcessing = actionLoading === r.addr;
                return (
                  <motion.div
                    key={r.addr}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: STATUS_BG[r.status],
                      border: `1px solid ${STATUS_BORDER[r.status]}`,
                      borderRadius: 12, padding: '16px 20px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                    }}
                  >
                    {/* Left: info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <StatusIcon size={20} color={STATUS_COLORS[r.status]} />
                      <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 4px', fontSize: 15 }}>
                          {r.companyName}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: '0 0 6px', fontFamily: 'monospace' }}>
                          {r.addr.slice(0, 10)}...{r.addr.slice(-6)}
                        </p>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span className={`badge ${ROLE_COLORS[r.role] || 'badge-cyan'}`} style={{ fontSize: 11 }}>
                            {ROLES[r.role] || 'Unknown'}
                          </span>
                          <a
                            href={`https://sepolia.etherscan.io/address/${r.addr}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--cyan)' }}
                          >
                            <ExternalLink size={10} /> Etherscan
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Right: status + actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        color: STATUS_COLORS[r.status], fontSize: 12, fontWeight: 600,
                        padding: '4px 12px', borderRadius: 20,
                        border: `1px solid ${STATUS_BORDER[r.status]}`,
                      }}>
                        {STATUS_LABELS[r.status]}
                      </span>

                      {r.status === 0 && (
                        <>
                          <button
                            onClick={() => handleApprove(r.addr)}
                            disabled={isProcessing}
                            style={{
                              background: 'rgba(16,185,129,0.15)', color: '#10b981',
                              border: '1px solid rgba(16,185,129,0.3)',
                              padding: '7px 16px', borderRadius: 8,
                              cursor: 'pointer', fontWeight: 600, fontSize: 13,
                              display: 'flex', alignItems: 'center', gap: 5,
                              opacity: isProcessing ? 0.6 : 1,
                            }}
                          >
                            {isProcessing ? <span className="spinner" /> : <><CheckCircle size={13} /> Approve</>}
                          </button>
                          <button
                            onClick={() => handleReject(r.addr)}
                            disabled={isProcessing}
                            style={{
                              background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                              border: '1px solid rgba(239,68,68,0.3)',
                              padding: '7px 16px', borderRadius: 8,
                              cursor: 'pointer', fontWeight: 600, fontSize: 13,
                              display: 'flex', alignItems: 'center', gap: 5,
                              opacity: isProcessing ? 0.6 : 1,
                            }}
                          >
                            {isProcessing ? <span className="spinner" /> : <><XCircle size={13} /> Reject</>}
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Existing: Register Actor + Lookup Actor ── */}
        <div className="grid-2" style={{ alignItems: 'start' }}>

          {/* Register Actor */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <UserPlus size={18} color="var(--cyan)" />
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Register Actor</h3>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="field-label">Wallet Address</label>
                <input className="input-field" placeholder="0x..."
                  value={form.wallet} onChange={e => setForm({ ...form, wallet: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Full Name / Company</label>
                <input className="input-field" placeholder="e.g. PharmaCo Ltd."
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Assign Role</label>
                <select className="input-field" value={form.role}
                  onChange={e => setForm({ ...form, role: Number(e.target.value) })}>
                  <option value={1}>Manufacturer</option>
                  <option value={2}>Distributor</option>
                  <option value={3}>Retailer</option>
                  <option value={4}>Admin</option>
                </select>
              </div>

              {msg && (
                <div>
                  <p style={{
                    fontSize: 13, padding: '10px 14px', borderRadius: 8,
                    background: msg.includes('✅') ? 'rgba(0,255,136,0.08)' : msg.includes('⏳') ? 'rgba(0,212,255,0.08)' : 'rgba(255,59,59,0.08)',
                    color: msg.includes('✅') ? 'var(--green)' : msg.includes('⏳') ? 'var(--cyan)' : '#ff6b6b',
                    border: `1px solid ${msg.includes('✅') ? 'rgba(0,255,136,0.2)' : msg.includes('⏳') ? 'rgba(0,212,255,0.2)' : 'rgba(255,59,59,0.2)'}`,
                  }}>{msg}</p>
                  {txHash && (
                    <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--cyan)', marginTop: 6 }}>
                      <ExternalLink size={11} /> View on Etherscan
                    </a>
                  )}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {loading ? <span className="spinner" /> : <><UserPlus size={14} /> Register Actor</>}
              </button>
            </form>
          </motion.div>

          {/* Lookup Actor */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Users size={18} color="var(--purple)" />
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Lookup Actor</h3>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Wallet Address</label>
              <input className="input-field" placeholder="0x..." value={lookupWallet}
                onChange={e => { setLookupWallet(e.target.value); setLookedUp(null); setLookupMsg(''); }} />
            </div>

            <button className="btn-outline" onClick={handleLookup}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
              <Users size={14} /> Lookup
            </button>

            {lookupMsg && (
              <p style={{
                fontSize: 13, marginBottom: 16, padding: '10px 14px', borderRadius: 8,
                background: lookupMsg.includes('✅') ? 'rgba(0,255,136,0.08)' : 'rgba(255,59,59,0.08)',
                color: lookupMsg.includes('✅') ? 'var(--green)' : '#ff6b6b',
                border: `1px solid ${lookupMsg.includes('✅') ? 'rgba(0,255,136,0.2)' : 'rgba(255,59,59,0.2)'}`,
              }}>{lookupMsg}</p>
            )}

            {lookedUp && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, minWidth: 60 }}>Name</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>
                    {lookedUp.name || <span style={{ color: '#ff6b6b' }}>No name set</span>}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, minWidth: 60 }}>Role</span>
                  <span className={`badge ${ROLE_COLORS[lookedUp.role] || 'badge-cyan'}`} style={{ fontSize: 12 }}>
                    {ROLES[lookedUp.role] || 'Unknown'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, minWidth: 60 }}>Status</span>
                  <span className={`badge ${lookedUp.exists ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 12 }}>
                    {lookedUp.exists ? '● Registered' : '● Not Registered'}
                  </span>
                </div>
                <a href={`https://sepolia.etherscan.io/address/${lookupWallet}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--cyan)', marginTop: 14 }}>
                  <ExternalLink size={11} /> View on Etherscan
                </a>
              </motion.div>
            )}

            <div className="divider" />
            <div style={{ padding: '12px 16px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10 }}>
              <p style={{ fontSize: 13, color: '#a78bfa', lineHeight: 1.6 }}>
                <strong>⚠ Admin Note:</strong> Only the deployer wallet can register actors.
                Ensure your connected wallet matches the contract owner.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Admin;