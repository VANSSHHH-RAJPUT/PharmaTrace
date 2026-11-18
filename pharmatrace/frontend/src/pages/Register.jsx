import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, XCircle, Clock, Wallet, ArrowRight } from 'lucide-react';
import { ROLES } from '../utils/contract';

const ROLE_OPTIONS = [
  { value: 1, label: 'Manufacturer', desc: 'Mint original digital twins and serialize medicine batches on-chain' },
  { value: 2, label: 'Wholesaler / 3PL Carrier', desc: 'Sign verifiable cold-chain custody handshakes and dispatch inventory' },
  { value: 3, label: 'Dispensing Pharmacy / Hospital', desc: 'Verify genuine manufacturer origin and record permanent patient dispensation' },
];

const STATUS = {
  0: { label: 'Pending Review', color: '#a35a00', icon: Clock, desc: 'Your registration request has been submitted to the protocol administrator on Ethereum Sepolia.' },
  1: { label: 'Organization Approved', color: '#0d7a4d', icon: CheckCircle2, desc: 'Your organization is approved! Reconnect or refresh your wallet to start operations.' },
  2: { label: 'Application Rejected', color: '#d62a4a', icon: XCircle, desc: 'Your registration was not approved. Please consult the network governance authority.' },
};

const Register = ({ contract, account, role, addToast, onConnect }) => {
  const [companyName, setCompanyName] = useState('');
  const [selectedRole, setSelectedRole] = useState(1);
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkExistingRequest = useCallback(async () => {
    if (!contract || !account) return;
    setChecking(true);
    try {
      const result = await contract.getRegistrationRequest(account);
      const exists = result[3];
      const status = result[2];
      if (exists) {
        setRequestStatus(Number(status));
      } else {
        setRequestStatus(null);
      }
    } catch (e) {
      console.error('Request status error:', e);
      setRequestStatus(null);
    }
    setChecking(false);
  }, [contract, account]);

  useEffect(() => {
    if (contract && account && Number(role) === 0) {
      checkExistingRequest();
    }
  }, [contract, account, role, checkExistingRequest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      addToast?.('Please connect MetaMask wallet first', 'error');
      return;
    }
    setLoading(true);
    try {
      const tx = await contract.requestRegistration(companyName, selectedRole);
      addToast?.('Submitting registration request on Sepolia...', 'pending', 12000);
      await tx.wait();
      setRequestStatus(0);
      addToast?.('Registration request submitted for review! ✅', 'success');
    } catch (err) {
      console.error(err);
      addToast?.(err.reason || err.message || 'Transaction failed', 'error');
    }
    setLoading(false);
  };

  if (Number(role) !== 0) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 20 }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: 40, maxWidth: 460, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(13, 122, 77, 0.15)', border: '1px solid rgba(13, 122, 77, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <CheckCircle2 size={32} color="#0d7a4d" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Authorized Organization</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px' }}>
            Your wallet is cryptographically authorized as a verified <strong>{ROLES[role] || 'Stakeholder'}</strong>. You have full operational access to the protocol.
          </p>
          <a href="/dashboard" className="btn-emerald" style={{ padding: '10px 22px', fontSize: 13 }}>
            Open Inventory Ledger <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 20 }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: 40, maxWidth: 440, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(43, 68, 255, 0.15)', border: '1px solid rgba(43, 68, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Wallet size={28} color="#2b44ff" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Connect Wallet Required</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
            Please connect your Ethereum wallet to enroll your pharmaceutical enterprise in the custody protocol.
          </p>
          <button onClick={onConnect} className="btn-primary" style={{ width: '100%', padding: '11px', fontSize: 13 }}>
            Connect MetaMask Wallet
          </button>
        </motion.div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="glass-panel" style={{ padding: 36, textAlign: 'center' }}>
          <span className="pulse-beacon pulse-beacon-cyan" style={{ marginBottom: 16 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '12px 0 0' }}>Checking on-chain credentials...</p>
        </div>
      </div>
    );
  }

  if (requestStatus !== null) {
    const currentStatus = STATUS[requestStatus];
    const Icon = currentStatus.icon;
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 20 }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: 40, maxWidth: 460, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${currentStatus.color}20`, border: `1px solid ${currentStatus.color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Icon size={30} color={currentStatus.color} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{currentStatus.label}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: '0 0 24px' }}>
            {currentStatus.desc}
          </p>
          <button onClick={checkExistingRequest} className="btn-outline" style={{ padding: '9px 20px', fontSize: 13 }}>
            Refresh On-Chain Status
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '40px 20px' }}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: 36, maxWidth: 520, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid rgba(21, 19, 26, 0.08)' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(13, 122, 77, 0.15)', border: '1px solid rgba(13, 122, 77, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={22} color="#0d7a4d" />
          </div>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Register Organization</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '2px 0 0' }}>Enroll as a verified actor on the PharmaTrace Network</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label className="field-label">Legal Corporate Entity Name</label>
            <input
              type="text"
              className="input-field"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Pfizer Global Logistics LLC"
              required
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label className="field-label">Select Supply Chain Role</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ROLE_OPTIONS.map((item) => {
                const isSelected = selectedRole === item.value;
                return (
                  <div
                    key={item.value}
                    onClick={() => setSelectedRole(item.value)}
                    style={{
                      background: isSelected ? 'rgba(13, 122, 77, 0.12)' : 'rgba(21, 19, 26, 0.02)',
                      border: isSelected ? '1px solid rgba(13, 122, 77, 0.45)' : '1px solid rgba(21, 19, 26, 0.08)',
                      borderRadius: 10,
                      padding: '12px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: isSelected ? '5px solid #34d399' : '2px solid #64748b',
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-emerald"
            style={{ width: '100%', padding: '12px 0', fontSize: 13 }}
          >
            {loading ? 'Submitting Request on Sepolia...' : 'Submit Enrollment Request'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
