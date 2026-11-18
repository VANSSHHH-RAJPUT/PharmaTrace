import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

const ICONS = {
  success: <CheckCircle2 size={15} color="#0d7a4d" />,
  error: <XCircle size={15} color="#d62a4a" />,
  pending: <Clock size={15} color="#2b44ff" />,
};

export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);
  const nextId = React.useRef(0);

  // Stable identities: pages list addToast in effect deps, so a new function each render loops forever.
  const removeToast = React.useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  const addToast = React.useCallback((message, type = 'success', duration = 4000) => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return { toasts, addToast, removeToast };
};

const Toast = ({ toasts, removeToast }) => (
  <div
    style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
    }}
  >
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={() => removeToast(t.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 18px',
            borderRadius: 10,
            cursor: 'pointer',
            minWidth: 280,
            background: '#ffffff',
            border: '2px solid #15131a',
            boxShadow: '4px 4px 0 #15131a',
            pointerEvents: 'all',
          }}
        >
          {ICONS[t.type] || ICONS.success}
          <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, fontWeight: 500 }}>{t.message}</span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 8 }}>✕</span>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

export default Toast;
