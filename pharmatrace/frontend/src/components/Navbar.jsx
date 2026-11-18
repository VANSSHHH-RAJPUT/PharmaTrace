import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, LogOut } from 'lucide-react';
import { shortAddress } from '../utils/contract';

const ROLE_BADGE = {
  1: { label: 'Manufacturer', cls: 'badge-cyan' },
  2: { label: 'Distributor', cls: 'badge-purple' },
  3: { label: 'Pharmacy', cls: 'badge-green' },
  4: { label: 'Protocol Admin', cls: 'badge-yellow' },
};

const Navbar = ({ account, role, actorName, onConnect, onDisconnect, loading }) => {
  const location = useLocation();
  const navLinks = [
    { path: '/', label: 'Overview' },
    { path: '/dashboard', label: 'Inventory Ledger' },
    { path: '/verify', label: 'Verify Batch' },
    ...(role === 0 ? [{ path: '/register', label: 'Register Org', highlight: true }] : []),
    ...(role === 4 ? [{ path: '/admin', label: 'Governance' }] : []),
  ];
  const roleInfo = ROLE_BADGE[role] || { label: 'Unregistered', cls: 'badge-zinc' };

  return (
    <nav className="app-nav" aria-label="Main">
      <div className="left">
        <Link to="/" className="brand"><span className="logo-cap"><i /><i /></span> PharmaTrace</Link>
        <div className="links">
          {navLinks.map((l) => (
            <Link key={l.path} to={l.path} className={location.pathname === l.path ? 'active' : ''}>
              {l.label}{l.highlight && <i className="hi" />}
            </Link>
          ))}
        </div>
      </div>

      <div className="right">
        <span className="net"><span className="pulse-beacon pulse-beacon-green" /> Sepolia</span>
        {account ? (
          <>
            <div className="wallet" title={actorName || ''}>
              <span className={`badge ${roleInfo.cls}`}>{roleInfo.label}</span>
              <span className="font-mono">{shortAddress(account)}</span>
            </div>
            <button type="button" className="off" onClick={onDisconnect} aria-label="Disconnect wallet" title="Disconnect wallet">
              <LogOut size={14} />
            </button>
          </>
        ) : (
          <button type="button" onClick={onConnect} disabled={loading} className="btn-primary">
            <Wallet size={14} />
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
