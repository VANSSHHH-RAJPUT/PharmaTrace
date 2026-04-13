import React, { useState } from 'react';
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

const TruckAnimation = ({ onComplete }) => (
  <motion.div
    initial={{ x: '-160px' }}
    animate={{ x: '110vw' }}
    transition={{ duration: 3.2, ease: 'easeInOut' }}
    onAnimationComplete={onComplete}
    style={{
      position: 'absolute',
      bottom: '18%',
      left: 0,
      zIndex: 10,
      filter: 'drop-shadow(0 0 14px rgba(0,212,255,0.7))',
    }}
  >
    <svg width="150" height="65" viewBox="0 0 150 65" fill="none">
      {/* Cargo body */}
      <rect x="0" y="12" width="95" height="36" rx="4" fill="#0a1628" stroke="#00d4ff" strokeWidth="1.5"/>
      {/* PharmaTrace label on cargo */}
      <rect x="6" y="18" width="83" height="24" rx="3" fill="rgba(0,212,255,0.07)" stroke="rgba(0,212,255,0.3)" strokeWidth="1"/>
      <text x="14" y="34" fill="#00d4ff" fontSize="10" fontFamily="Space Grotesk, sans-serif" fontWeight="700" letterSpacing="0.5">PharmaTrace</text>

      {/* Cab */}
      <rect x="95" y="18" width="40" height="30" rx="5" fill="#0d1f3c" stroke="#00d4ff" strokeWidth="1.5"/>
      {/* Windshield */}
      <rect x="100" y="22" width="24" height="15" rx="2" fill="rgba(0,212,255,0.12)" stroke="#00d4ff" strokeWidth="0.8"/>
      {/* Cab top curve */}
      <path d="M95 20 Q115 10 135 18" stroke="#00d4ff" strokeWidth="1" fill="none"/>

      {/* Headlight */}
      <rect x="133" y="30" width="10" height="6" rx="2" fill="#fbbf24"/>
      <rect x="133" y="30" width="10" height="6" rx="2" fill="#fbbf24" opacity="0.5" style={{ filter: 'blur(4px)' }}/>

      {/* Connector */}
      <rect x="93" y="30" width="4" height="8" rx="1" fill="#1e3a5f"/>

      {/* Wheels */}
      <circle cx="22" cy="50" r="9" fill="#020817" stroke="#00d4ff" strokeWidth="1.5"/>
      <circle cx="22" cy="50" r="4" fill="#0a1628" stroke="#00d4ff" strokeWidth="1"/>
      <circle cx="22" cy="50" r="1.5" fill="#00d4ff"/>

      <circle cx="72" cy="50" r="9" fill="#020817" stroke="#00d4ff" strokeWidth="1.5"/>
      <circle cx="72" cy="50" r="4" fill="#0a1628" stroke="#00d4ff" strokeWidth="1"/>
      <circle cx="72" cy="50" r="1.5" fill="#00d4ff"/>

      <circle cx="115" cy="50" r="8" fill="#020817" stroke="#00d4ff" strokeWidth="1.5"/>
      <circle cx="115" cy="50" r="3.5" fill="#0a1628" stroke="#00d4ff" strokeWidth="1"/>
      <circle cx="115" cy="50" r="1.5" fill="#00d4ff"/>

      {/* Exhaust pipe */}
      <rect x="90" y="10" width="4" height="10" rx="2" fill="#1e3a5f" stroke="#00d4ff" strokeWidth="0.8"/>
    </svg>

    {/* Smoke puffs */}
    {[0, 0.3, 0.6].map((delay, i) => (
      <motion.div
        key={i}
        animate={{ y: [0, -12, -24], x: [-2, -6, -10], opacity: [0.5, 0.25, 0], scale: [0.8, 1.2, 1.6] }}
        transition={{ duration: 1.2, repeat: Infinity, delay, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: -4 - i * 4,
          left: 90 + i * 2,
          width: 8, height: 8,
          borderRadius: '50%',
          background: 'rgba(160,180,200,0.35)',
        }}
      />
    ))}
  </motion.div>
);

const Landing = ({ account, onConnect }) => {
  const [truckDone, setTruckDone] = useState(false);

  return (
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

        {/* Road line */}
        <div style={{
          position: 'absolute', bottom: '18%', left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.25), transparent)',
        }} />

        {/* Truck */}
        <TruckAnimation onComplete={() => setTruckDone(true)} />

        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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

          {/* Text reveals after truck passes */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={truckDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}
          >
            PharmaTrace brings enterprise-grade blockchain traceability to pharmaceutical supply chains.
            Track every product from lab to shelf with cryptographic certainty.
          </motion.p>

          {/* Buttons reveal after truck passes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={truckDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
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
};

export default Landing;