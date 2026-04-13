import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroLoader = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);   // text appears
    const t2 = setTimeout(() => setPhase(2), 2200);  // loading bar
    const t3 = setTimeout(() => setPhase(3), 3400);  // fly to navbar
    const t4 = setTimeout(() => setDone(true), 4400);
    const t5 = setTimeout(() => onComplete(), 5000);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#020817',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Background grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px', opacity: 0.4,
          }} />

          {/* Glow orb */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              position: 'absolute', width: 500, height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Logo + Text — center then flies to navbar */}
          <motion.div
            animate={phase >= 3 ? {
              x: 'calc(-50vw + 80px)',
              y: 'calc(-50vh + 36px)',
              scale: 0.38,
            } : {
              x: 0, y: 0, scale: 1,
            }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 16,
              transformOrigin: 'center center',
            }}
          >
            {/* Logo Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'backOut' }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0,212,255,0.4)',
                    '0 0 60px rgba(0,212,255,0.9)',
                    '0 0 20px rgba(0,212,255,0.4)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: 90, height: 90,
                  background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                  borderRadius: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                    fill="white" opacity="0.95"
                  />
                </svg>
              </motion.div>
            </motion.div>

            {/* PharmaTrace text */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 16 }}
              transition={{ duration: 0.7 }}
              style={{
                fontSize: 48, fontWeight: 800,
                fontFamily: 'Space Grotesk, sans-serif',
                background: 'linear-gradient(135deg, #00d4ff, #a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: 1, whiteSpace: 'nowrap',
              }}
            >
              PharmaTrace
            </motion.div>
          </motion.div>

          {/* Tagline — stays in center, fades out before fly */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 1 || phase === 2 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              top: 'calc(50% + 120px)',
              fontSize: 14, color: 'rgba(0,212,255,0.5)',
              letterSpacing: 3, fontFamily: 'monospace',
              textTransform: 'uppercase',
            }}
          >
            Securing Pharma Supply Chains on Blockchain
          </motion.p>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              top: 'calc(50% + 160px)',
              width: 260, height: 2,
              background: 'rgba(0,212,255,0.12)',
              borderRadius: 2, overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: phase >= 2 ? '100%' : '0%' }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #00d4ff, #7c3aed, #00ff88)',
                borderRadius: 2,
              }}
            />
          </motion.div>

          {/* Status text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 && phase < 3 ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute', bottom: 36,
              fontSize: 11, color: 'rgba(0,212,255,0.35)',
              letterSpacing: 3, fontFamily: 'monospace',
            }}
          >
            {phase === 1 && 'INITIALIZING BLOCKCHAIN CONNECTION...'}
            {phase === 2 && 'LOADING SMART CONTRACTS...'}
          </motion.p>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroLoader;