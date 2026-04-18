import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, XCircle, Clock, Wallet } from 'lucide-react';

const ROLES = [
  { value: 1, label: 'Manufacturer' },
  { value: 2, label: 'Distributor' },
  { value: 3, label: 'Retailer' },
];

const STATUS = {
  0: { label: 'Pending Approval', color: '#f59e0b', icon: Clock },
  1: { label: 'Approved', color: '#10b981', icon: CheckCircle },
  2: { label: 'Rejected', color: '#ef4444', icon: XCircle },
};

const Register = ({ contract, account, role, addToast, onConnect }) => {
  const [companyName, setCompanyName] = useState('');
  const [selectedRole, setSelectedRole] = useState(1);
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // null | 0 | 1 | 2
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (contract && account) checkExistingRequest();
    else setChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, account]);

  const checkExistingRequest = async () => {
    setChecking(true);
    try {
      const [, , status, exists] = await contract.getRegistrationRequest(account);
      if (exists) setRequestStatus(Number(status));
      else setRequestStatus(null);
    } catch (e) {
      console.error(e);
    }
    setChecking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.requestRegistration(companyName, selectedRole);
      addToast('Transaction submitted, waiting for confirmation...', 'pending');
      await tx.wait();
      setRequestStatus(0);
      addToast('Registration request submitted!', 'success');
    } catch (err) {
      addToast(err.reason || 'Transaction failed', 'error');
    }
    setLoading(false);
  };

  // Already registered as actor
  if (role !== 0) {
    return (
      <div style={styles.container}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.card}>
          <CheckCircle size={48} color="#10b981" style={{ marginBottom: 16 }} />
          <h2 style={styles.title}>Already Registered</h2>
          <p style={styles.subtitle}>Your wallet is registered as <strong>{ROLES.find(r => r.value === role)?.label}</strong>.</p>
        </motion.div>
      </div>
    );
  }

  // Not connected
  if (!account) {
    return (
      <div style={styles.container}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.card}>
          <Wallet size={48} color="#6366f1" style={{ marginBottom: 16 }} />
          <h2 style={styles.title}>Connect Your Wallet</h2>
          <p style={styles.subtitle}>Please connect your MetaMask wallet to register your company.</p>
          <button onClick={onConnect} style={styles.btnPrimary}>Connect MetaMask</button>
        </motion.div>
      </div>
    );
  }

  // Checking existing request
  if (checking) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ color: '#aaa' }}>Checking registration status...</p>
        </div>
      </div>
    );
  }

  // Show status if request exists
  if (requestStatus !== null) {
    const s = STATUS[requestStatus];
    const Icon = s.icon;
    return (
      <div style={styles.container}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.card}>
          <Icon size={48} color={s.color} style={{ marginBottom: 16 }} />
          <h2 style={{ ...styles.title, color: s.color }}>{s.label}</h2>
          {requestStatus === 0 && (
            <p style={styles.subtitle}>Your registration request is being reviewed by the admin. You'll be able to use the platform once approved.</p>
          )}
          {requestStatus === 1 && (
            <p style={styles.subtitle}>Your company has been approved! Reconnect your wallet to access your dashboard.</p>
          )}
          {requestStatus === 2 && (
            <p style={styles.subtitle}>Your registration was rejected. Please contact the admin for more information.</p>
          )}
        </motion.div>
      </div>
    );
  }

  // Registration form
  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.card}>
        <Building2 size={40} color="#6366f1" style={{ marginBottom: 16 }} />
        <h2 style={styles.title}>Register Your Company</h2>
        <p style={styles.subtitle}>Submit a registration request. The admin will review and approve your company.</p>

        <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: 24 }}>
          <div style={styles.field}>
            <label style={styles.label}>Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. MediCure Pharmaceuticals"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <div style={styles.roleGrid}>
              {ROLES.map((r) => (
                <div
                  key={r.value}
                  onClick={() => setSelectedRole(r.value)}
                  style={{
                    ...styles.roleCard,
                    border: selectedRole === r.value ? '2px solid #6366f1' : '2px solid #333',
                    background: selectedRole === r.value ? 'rgba(99,102,241,0.15)' : '#1a1a2e',
                  }}
                >
                  <span style={{ color: selectedRole === r.value ? '#6366f1' : '#aaa', fontWeight: 600 }}>
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...styles.field, background: 'rgba(99,102,241,0.08)', borderRadius: 8, padding: 12 }}>
            <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>
              📍 Submitting from: <span style={{ color: '#fff', fontFamily: 'monospace' }}>
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btnPrimary, marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Submitting...' : 'Submit Registration Request'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 40,
    maxWidth: 500,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backdropFilter: 'blur(12px)',
  },
  title: { fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 1.6, marginBottom: 8 },
  field: { marginBottom: 20, width: '100%' },
  label: { display: 'block', marginBottom: 8, color: '#ccc', fontSize: 14, fontWeight: 600 },
  input: {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid #333', background: '#0f0f1a',
    color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 },
  roleCard: {
    padding: '14px 8px', borderRadius: 10, textAlign: 'center',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  btnPrimary: {
    width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
  },
};

export default Register;