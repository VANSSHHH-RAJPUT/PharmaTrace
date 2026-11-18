import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="ambient-scene">
      {/* Fine technical grid with radial mask */}
      <div className="bg-tech-grid" />

      {/* Floating ambient glow lights */}
      <motion.div
        className="ambient-orb ambient-orb-1"
        animate={{
          x: [0, 25, -15, 0],
          y: [0, -30, 15, 0],
          scale: [1, 1.08, 0.94, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="ambient-orb ambient-orb-2"
        animate={{
          x: [0, -35, 20, 0],
          y: [0, 25, -20, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="ambient-orb ambient-orb-3"
        animate={{
          x: [0, 20, -25, 0],
          y: [0, -20, 25, 0],
          scale: [1, 1.06, 0.96, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
