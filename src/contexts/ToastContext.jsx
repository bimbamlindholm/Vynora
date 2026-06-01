/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((current) => [...current, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="pointer-events-none fixed left-3 right-3 top-3 z-[9999] flex w-auto flex-col gap-3 sm:left-auto sm:right-6 sm:top-6 sm:w-full sm:max-w-[380px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

const toastStyles = {
  success: {
    bg: "bg-emerald-500/[0.07]",
    border: "border-emerald-500/25",
    text: "text-emerald-300",
    icon: CheckCircle2,
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.12)]",
  },
  error: {
    bg: "bg-rose-500/[0.07]",
    border: "border-rose-500/25",
    text: "text-rose-300",
    icon: XCircle,
    glow: "shadow-[0_0_20px_rgba(244,63,94,0.12)]",
  },
  warning: {
    bg: "bg-amber-500/[0.07]",
    border: "border-amber-500/25",
    text: "text-amber-300",
    icon: AlertTriangle,
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.12)]",
  },
  info: {
    bg: "bg-cyan-500/[0.07]",
    border: "border-cyan-500/25",
    text: "text-cyan-300",
    icon: Info,
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.12)]",
  },
};

function ToastCard({ toast, onRemove }) {
  const { id, message, type } = toast;
  const style = toastStyles[type] || toastStyles.info;
  const Icon = style.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`pointer-events-auto flex items-start gap-3.5 rounded-2xl border ${style.border} ${style.bg} ${style.glow} p-4 backdrop-blur-xl`}
    >
      <div className={`mt-0.5 shrink-0 ${style.text}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1 break-words text-sm font-semibold leading-relaxed text-slate-100">
        {message}
      </div>
      <button
        onClick={() => onRemove(id)}
        className="shrink-0 text-slate-400 hover:text-white transition"
        type="button"
        aria-label="Dismiss toast"
      >
        <X size={15} />
      </button>
    </motion.div>
  );
}
