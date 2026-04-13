import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Activity, LayoutDashboard, Search, Settings, Wallet, LogOut } from 'lucide-react';
import { ROLES, ROLE_COLORS, shortAddress } from '../utils/contract';

const Navbar = ({ account, role, actorName, onConnect, onDisconnect, loading }) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home', icon: <Activity size={14} /> },
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
    { path: '/verify', label: 'Verify', icon: <Search size={14} /> },
    { path: '/admin', label: 'Admin', icon: <Settings size={14} /> },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }} animate={{ y: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 32px', height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(2,8,23,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,212,255,0.1)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={18} color="#fff" />
        </div>
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 20,
          background: 'linear-gradient(135deg, #00d4ff, #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>PharmaTrace</span>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {navLinks.map(link => (
          <Link key={link.path} to={link.path} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            textDecoration: 'none', fontSize: 14, fontWeight: 500,
            color: location.pathname === link.path ? '#00d4ff' : '#8892a4',
            background: location.pathname === link.path ? 'rgba(0,212,255,0.1)' : 'transparent',
            transition: 'all 0.2s',
          }}>
            {link.icon} {link.label}
          </Link>
        ))}
      </div>

      {/* Wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {account ? (
          <>
            <span className={`badge ${ROLE_COLORS[role] || 'badge-cyan'}`}>{ROLES[role]}</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px',
              background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 10, fontSize: 13, color: '#00d4ff', fontWeight: 500,
            }}>
              <Wallet size={13} />
              {actorName || shortAddress(account)}
            </div>
            <button onClick={onDisconnect} style={{
              background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)',
              color: '#ff6b6b', padding: '8px 12px', borderRadius: 8,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}>
              <LogOut size={14} />
            </button>
          </>
        ) : (
          <button className="btn-primary" onClick={onConnect} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', fontSize: 14 }}>
            {loading ? <span className="spinner" /> : <><Wallet size={14} />Connect Wallet</>}
          </button>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
