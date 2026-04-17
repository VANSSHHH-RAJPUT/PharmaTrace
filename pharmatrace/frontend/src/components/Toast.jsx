import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={16} color="#00ff88" />,
  error: <XCircle size={16} color="#ff6b6b" />,
  pending: <Clock size={16} color="#00d4ff" />,
};

const BORDERS = {
  success: 'rgba(0,255,136,0.2)',
  error: 'rgba(255,59,59,0.2)',
  pending: 'rgba(0,212,255,0.2)',
};

export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return { toasts, addToast, removeToast };
};

const Toast = ({ toasts, removeToast }) => (
  <div style={{
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    display: 'flex', flexDirection: 'column', gap: 10,
  }}>
    <AnimatePresence>
      {toasts.map(t => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 80, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={() => removeToast(t.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 18px', borderRadius: 10, cursor: 'pointer', minWidth: 300,
            background: 'rgba(8,12,28,0.97)', backdropFilter: 'blur(16px)',
            border: `1px solid ${BORDERS[t.type] || BORDERS.success}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {ICONS[t.type]}
          <span style={{ fontSize: 13, color: '#e2e8f0', flex: 1 }}>{t.message}</span>
          <span style={{ fontSize: 11, color: '#4a5568', marginLeft: 8 }}>✕</span>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

export default Toast;