import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, CheckCircle, Activity } from 'lucide-react';

const StatsBar = ({ contract }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    soldProducts: 0,
    activeProducts: 0,
    totalTransfers: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const count = await contract.getProductCount();
      const total = Number(count);
      let sold = 0;
      let totalTransfers = 0;

      for (let i = 1; i <= total; i++) {
        try {
          const p = await contract.getProduct(i);
          if (Number(p.currentStage) === 5) sold++;
          const h = await contract.getProductHistory(i);
          totalTransfers += h.length;
        } catch (e) {}
      }

      setStats({
        totalProducts: total,
        soldProducts: sold,
        activeProducts: total - sold,
        totalTransfers,
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [contract]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const items = [
    { icon: <Package size={18} />, label: 'Total Products', val: stats.totalProducts, color: 'var(--cyan)' },
    { icon: <Activity size={18} />, label: 'Active', val: stats.activeProducts, color: '#a78bfa' },
    { icon: <CheckCircle size={18} />, label: 'Sold', val: stats.soldProducts, color: 'var(--green)' },
    { icon: <TrendingUp size={18} />, label: 'Transfers', val: stats.totalTransfers, color: '#f59e0b' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass"
          style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: `${item.color}18`,
            border: `1px solid ${item.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: item.color,
          }}>
            {item.icon}
          </div>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>
              {loading ? '—' : item.val}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsBar;