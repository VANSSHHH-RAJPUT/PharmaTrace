import React, { useState, useEffect, useCallback } from 'react';
import { Shield, CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import { ROLES, shortAddress } from '../utils/contract';

const STATUS_LABELS = ['Pending Review', 'Approved', 'Rejected'];
const STATUS_COLORS = ['#a35a00', '#0d7a4d', '#d62a4a'];
const STATUS_ICONS = [Clock, CheckCircle2, XCircle];

const Admin = ({ contract, account, addToast }) => {
  const [form, setForm] = useState({ wallet: '', role: 1, name: '' });
  const [loading, setLoading] = useState(false);
  const [lookupWallet, setLookupWallet] = useState('');
  const [lookedUp, setLookedUp] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const loadRequests = useCallback(async () => {
    if (!contract) return;
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
      addToast?.('Failed to load registration requests', 'error');
    }
    setReqLoading(false);
  }, [contract, addToast]);

  useEffect(() => {
    if (contract) loadRequests();
  }, [contract, loadRequests]);

  const handleApprove = async (addr) => {
    setActionLoading(addr);
    try {
      addToast?.('Submitting approval on Sepolia...', 'pending', 12000);
      const tx = await contract.approveRegistration(addr);
      await tx.wait();
      addToast?.(`Approved organization for ${shortAddress(addr)}! ✅`, 'success');
      loadRequests();
    } catch (e) {
      addToast?.(e.reason || e.message || 'Failed to approve', 'error');
    }
    setActionLoading('');
  };

  const handleReject = async (addr) => {
    setActionLoading(addr);
    try {
      addToast?.('Rejecting registration on Sepolia...', 'pending', 12000);
      const tx = await contract.rejectRegistration(addr);
      await tx.wait();
      addToast?.(`Registration for ${shortAddress(addr)} rejected.`, 'success');
      loadRequests();
    } catch (e) {
      addToast?.(e.reason || e.message || 'Failed to reject', 'error');
    }
    setActionLoading('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!contract) return;
    setLoading(true);
    try {
      addToast?.('Submitting direct actor registration on Sepolia...', 'pending', 12000);
      const tx = await contract.registerActor(form.wallet, form.name, Number(form.role));
      await tx.wait();
      addToast?.(`Actor ${form.name} registered successfully! ✅`, 'success');
      setForm({ wallet: '', role: 1, name: '' });
    } catch (e) {
      addToast?.(e.reason || e.message || 'Registration failed', 'error');
    }
    setLoading(false);
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!contract || !lookupWallet) return;
    setLookupLoading(true);
    setLookedUp(null);
    try {
      const actor = await contract.getActor(lookupWallet);
      if (actor.exists) {
        setLookedUp({
          wallet: actor.wallet,
          name: actor.name,
          role: Number(actor.role),
          exists: true,
        });
      } else {
        addToast?.('No registered actor found for this address', 'error');
      }
    } catch (e) {
      addToast?.('Failed to query actor', 'error');
    }
    setLookupLoading(false);
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 1040 }}>
        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Governance & Actor Directory
            </h1>
            <span className="badge badge-yellow" style={{ fontSize: 11 }}>
              <Shield size={12} /> Protocol Admin
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            Review pending stakeholder onboarding requests and manage cryptographically authorized participants.
          </p>
        </div>

        {/* ── ONBOARDING REQUESTS QUEUE ── */}
        <div className="glass-panel" style={{ padding: 26, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Pending Stakeholder Requests
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Incoming organization registration requests on Sepolia
              </p>
            </div>
            <span className="badge badge-zinc" style={{ fontSize: 11 }}>
              {requests.length} Total Requests
            </span>
          </div>

          {reqLoading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              Loading queue from Ethereum...
            </div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-dim)', fontSize: 13 }}>
              No enrollment requests pending at this time.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {requests.map((r, i) => {
                const Icon = STATUS_ICONS[r.status] || Clock;
                const statusColor = STATUS_COLORS[r.status] || '#a35a00';
                return (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(21, 19, 26, 0.02)',
                      border: '1px solid rgba(21, 19, 26, 0.07)',
                      borderRadius: 10,
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {r.companyName || 'Unknown Entity'}
                        </h4>
                        <span className="badge badge-cyan" style={{ fontSize: 10 }}>
                          {ROLES[r.role]}
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            color: statusColor,
                          }}
                        >
                          <Icon size={12} color={statusColor} />
                          {STATUS_LABELS[r.status]}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                        Wallet: {r.addr}
                      </div>
                    </div>

                    {r.status === 0 && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleApprove(r.addr)}
                          disabled={actionLoading === r.addr}
                          className="btn-emerald"
                          style={{ padding: '6px 14px', fontSize: 12 }}
                        >
                          {actionLoading === r.addr ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(r.addr)}
                          disabled={actionLoading === r.addr}
                          style={{
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.25)',
                            color: '#d62a4a',
                            padding: '6px 14px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── TWO-COLUMN TOOLS: DIRECT REGISTRATION & DIRECT LOOKUP ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Direct Manual Registration */}
          <div className="glass-panel" style={{ padding: 26 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Direct Actor Registration
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 18 }}>
              Admin privilege: Register authorized actors directly without review.
            </p>

            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: 14 }}>
                <label className="field-label">Wallet Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={form.wallet}
                  onChange={(e) => setForm({ ...form, wallet: e.target.value })}
                  required
                  className="input-field font-mono"
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="field-label">Entity Name</label>
                <input
                  type="text"
                  placeholder="e.g. McKesson Supply Chain Hub"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="input-field"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="field-label">Assigned Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input-field"
                >
                  <option value={1} style={{ background: '#ffffff' }}>Manufacturer</option>
                  <option value={2} style={{ background: '#ffffff' }}>Distributor</option>
                  <option value={3} style={{ background: '#ffffff' }}>Retailer / Hospital</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '10px', fontSize: 13 }}>
                {loading ? 'Submitting...' : 'Register On-Chain'}
              </button>
            </form>
          </div>

          {/* Directory Lookup */}
          <div className="glass-panel" style={{ padding: 26 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Verify Stakeholder Credential
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 18 }}>
              Query on-chain smart contract directory for authorized addresses.
            </p>

            <form onSubmit={handleLookup} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="0x..."
                  value={lookupWallet}
                  onChange={(e) => setLookupWallet(e.target.value)}
                  className="input-field font-mono"
                  style={{ flex: 1 }}
                />
                <button type="submit" disabled={lookupLoading} className="btn-outline" style={{ padding: '0 16px', fontSize: 12 }}>
                  <Search size={14} />
                </button>
              </div>
            </form>

            {lookedUp && (
              <div
                style={{
                  background: 'rgba(13, 122, 77, 0.08)',
                  border: '1px solid rgba(13, 122, 77, 0.3)',
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <CheckCircle2 size={16} color="#0d7a4d" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {lookedUp.name}
                  </span>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>
                    {ROLES[lookedUp.role]}
                  </span>
                </div>
                <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                  Wallet: {lookedUp.wallet}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
