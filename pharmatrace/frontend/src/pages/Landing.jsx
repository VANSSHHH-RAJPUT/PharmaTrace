import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Zap, Globe, Lock, ChevronRight,
  ArrowRight, Activity, Search
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const features = [
  { icon: <Shield size={26} />, title: 'Immutable Records', color: '#00d4ff',
    desc: 'Every product event is permanently recorded on Ethereum — tamper-proof and cryptographically verified.' },
  { icon: <Zap size={26} />, title: 'Real-Time Tracking', color: '#00ff88',
    desc: 'Monitor your pharmaceutical supply chain in real time from manufacturer to pharmacy shelf.' },
  { icon: <Globe size={26} />, title: 'Global Compliance', color: '#a78bfa',
    desc: 'Meets FDA DSCSA, EU FMD and WHO pharmaceutical traceability standards worldwide.' },
  { icon: <Lock size={26} />, title: 'Role-Based Access', color: '#f59e0b',
    desc: 'Granular permissions for Manufacturers, Distributors, and Retailers on a decentralized network.' },
];

const steps = [
  { num: '01', title: 'Register', desc: 'Companies onboard with verified wallet addresses assigned roles by a system admin.' },
  { num: '02', title: 'Manufacture', desc: 'Manufacturers mint product entries with batch numbers, dates, and metadata on-chain.' },
  { num: '03', title: 'Distribute', desc: 'Products transfer through the supply chain — every handoff recorded immutably.' },
  { num: '04', title: 'Verify', desc: 'Retailers and consumers scan QR codes to view the complete authenticated product history.' },
];

const Landing = ({ account, onConnect }) => (
  <div className="page">

    {/* Hero */}
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '15%', left: '10%', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <div className="container" style={{ textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="badge badge-cyan" style={{ marginBottom: 28, display: 'inline-flex' }}>
            <Activity size={12} /> Powered by Ethereum Blockchain
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{ fontSize: 'clamp(40px, 7vw, 84px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}
        >
          The Future of<br />
          <span style={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #a78bfa 50%, #00ff88 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Pharma Supply Chains</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}
        >
          PharmaTrace brings enterprise-grade blockchain traceability to pharmaceutical supply chains.
          Track every product from lab to shelf with cryptographic certainty.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          {account ? (
            <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Open Dashboard <ArrowRight size={15} />
            </Link>
          ) : (
            <button className="btn-primary" onClick={onConnect} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Connect Wallet <ArrowRight size={15} />
            </button>
          )}
          <Link to="/verify" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Verify Product <ChevronRight size={15} />
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="section">
      <div className="container">
        <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="badge badge-purple" style={{ marginBottom: 16, display: 'inline-flex' }}>Platform Features</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, marginBottom: 14 }}>
            Built for Enterprise.<br />Secured by Blockchain.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            Everything your pharmaceutical company needs to maintain regulatory compliance and consumer trust.
          </p>
        </motion.div>

        <div className="grid-2">
          {features.map((f, i) => (
            <motion.div
              key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
              className="glass" style={{ padding: 32, display: 'flex', gap: 20 }}
              whileHover={{ borderColor: `${f.color}44` }}
            >
              <div style={{
                width: 52, height: 52, flexShrink: 0,
                background: `${f.color}15`, border: `1px solid ${f.color}33`,
                borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color
              }}>{f.icon}</div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="section" style={{ background: 'rgba(0,212,255,0.02)' }}>
      <div className="container">
        <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="badge badge-green" style={{ marginBottom: 16, display: 'inline-flex' }}>How It Works</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700 }}>From Factory to Pharmacy</h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {steps.map((s, i) => (
            <motion.div
              key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
              className="glass" style={{ padding: 28, position: 'relative' }}
            >
              <div style={{
                fontSize: 42, fontWeight: 900, fontFamily: 'Space Grotesk',
                background: 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.15))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: 16, lineHeight: 1
              }}>{s.num}</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7 }}>{s.desc}</p>
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--cyan)', zIndex: 2
                }}>
                  <ChevronRight size={20} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="section">
      <div className="container">
        <motion.div {...fadeUp} className="glass" style={{
          padding: '72px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(124,58,237,0.06))',
          border: '1px solid rgba(0,212,255,0.2)',
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 600, height: 300,
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <Shield size={44} color="#00d4ff" style={{ marginBottom: 20, opacity: 0.9 }} />
          <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 700, marginBottom: 14 }}>
            Ready to Secure Your Supply Chain?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 460, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Join hundreds of pharmaceutical companies already using PharmaTrace to protect patients and maintain compliance.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Launch App <ArrowRight size={15} />
            </Link>
            <Link to="/verify" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Search size={14} /> Verify a Product
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Footer */}
    <footer style={{ borderTop: '1px solid rgba(0,212,255,0.08)', padding: '32px 0' }}>
      <div className="container" style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={16} color="#00d4ff" />
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, color: '#00d4ff' }}>PharmaTrace</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>© 2026 PharmaTrace Inc. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy Policy', 'Terms of Service', 'Documentation', 'Contact'].map(l => (
            <span key={l} style={{ color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </div>
    </footer>
  </div>
);

export default Landing;