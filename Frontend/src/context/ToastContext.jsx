import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Single toast item component with progress bar and pause-on-hover
function ToastItem({ toast, onDismiss }) {
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const remainingTimeRef = useRef(toast.duration || 5000);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 200); // 200ms exit animation
  }, [onDismiss, toast.id]);

  useEffect(() => {
    if (toast.duration === 0) return; // persistent toast if duration 0

    if (!isPaused) {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, remainingTimeRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPaused, handleDismiss, toast.duration]);

  const handleMouseEnter = () => {
    if (toast.duration === 0) return;
    setIsPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(remainingTimeRef.current - elapsed, 500);
  };

  const handleMouseLeave = () => {
    if (toast.duration === 0) return;
    setIsPaused(false);
  };

  // Type-specific badge and border styling
  const configMap = {
    success: {
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-50/50",
      borderColor: "border-emerald-200",
      accentBar: "bg-emerald-500",
      defaultTitle: "Success",
    },
    error: {
      icon: AlertCircle,
      iconColor: "text-rose-500",
      bgColor: "bg-rose-50/50",
      borderColor: "border-rose-200",
      accentBar: "bg-rose-500",
      defaultTitle: "Error",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50/50",
      borderColor: "border-amber-200",
      accentBar: "bg-amber-500",
      defaultTitle: "Attention",
    },
    info: {
      icon: Info,
      iconColor: "text-teal-500",
      bgColor: "bg-teal-50/50",
      borderColor: "border-teal-200",
      accentBar: "bg-teal-500",
      defaultTitle: "Information",
    },
  };

  const currentConfig = configMap[toast.type] || configMap.info;
  const IconComponent = currentConfig.icon;
  const displayTitle = toast.title || currentConfig.defaultTitle;

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl border bg-white p-4 shadow-xl transition-all duration-200 ${
        currentConfig.borderColor
      } ${
        isExiting
          ? "translate-x-full opacity-0"
          : "translate-x-0 opacity-100 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-right-4"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`mt-0.5 shrink-0 rounded-xl p-2 ${currentConfig.bgColor} ${currentConfig.iconColor}`}>
          <IconComponent className="h-5 w-5" />
        </div>

        <div className="flex-1 pr-2">
          {displayTitle && (
            <h4 className="text-xs sm:text-sm font-bold text-navy-950 tracking-tight">
              {displayTitle}
            </h4>
          )}
          <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
            {toast.message}
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="shrink-0 -mr-1 -mt-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress countdown indicator bar */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
          <div
            className={`h-full ${currentConfig.accentBar} transition-all`}
            style={{
              animation: `shrinkProgress ${toast.duration}ms linear forwards`,
              animationPlayState: isPaused ? "paused" : "running",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toastData) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    const newToast = {
      id,
      type: toastData.type || "info",
      title: toastData.title,
      message: toastData.message || "",
      duration: toastData.duration !== undefined ? toastData.duration : 5000,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    show: addToast,
    success: (message, options = {}) =>
      addToast({ type: "success", message, ...options }),
    error: (message, options = {}) =>
      addToast({ type: "error", message, ...options }),
    info: (message, options = {}) =>
      addToast({ type: "info", message, ...options }),
    warning: (message, options = {}) =>
      addToast({ type: "warning", message, ...options }),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}

      {/* Global Toast Viewport / Container */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-4 z-[9999] flex flex-col gap-2.5 sm:bottom-auto sm:right-6 sm:top-6 sm:left-auto sm:max-w-sm sm:w-full"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
