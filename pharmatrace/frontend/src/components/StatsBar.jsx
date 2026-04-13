import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Users, Activity, Wifi } from 'lucide-react';

const StatsBar = ({ contract }) => {
  const [stats, setStats] = useState({ products: 0, actors: 0 });

  useEffect(() => {
    const load = async () => {
      if (!contract) return;
      try {
        const pc = await contract.productCount();
        const ac = await contract.actorCount();
        setStats({ products: Number(pc), actors: Number(ac) });
      } catch (e) {}
    };
    load();
  }, [contract]);

  const items = [
    { label: 'Total Products', value: stats.products, icon: <Package size={18} />, color: '#00d4ff' },
    { label: 'Registered Actors', value: stats.actors, icon: <Users size={18} />, color: '#a78bfa' },
    { label: 'Network', value: 'Hardhat Local', icon: <Activity size={18} />, color: '#00ff88' },
    { label: 'Node Status', value: '● Online', icon: <Wifi size={18} />, color: '#f59e0b' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
      {items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }} className="glass"
          style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
        >
          <div style={{
            width: 40, height: 40, background: `${item.color}18`,
            border: `1px solid ${item.color}33`, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color,
          }}>
            {item.icon}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk' }}>{item.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsBar;
