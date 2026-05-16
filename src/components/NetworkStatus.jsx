// src/components/NetworkStatus.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlow, setIsSlow] = useState(false);

  // Each banner has its own visible state — controlled by timers
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showSlowBanner, setShowSlowBanner] = useState(false);
  const [showBackOnlineBanner, setShowBackOnlineBanner] = useState(false);

  const slowTimerRef = useRef(null);
  const offlineTimerRef = useRef(null);
  const onlineTimerRef = useRef(null);
  const wasOfflineRef = useRef(false);

  // 🎨 Show offline banner — auto-hides after 6 seconds
  const triggerOfflineBanner = () => {
    setShowOfflineBanner(true);
    if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
    offlineTimerRef.current = setTimeout(() => {
      setShowOfflineBanner(false);
    }, 6000);
  };

  // 🐢 Show slow banner — auto-hides after 5 seconds
  const triggerSlowBanner = () => {
    setShowSlowBanner(true);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    slowTimerRef.current = setTimeout(() => {
      setShowSlowBanner(false);
    }, 5000);
  };

  // ✅ Show back online banner — auto-hides after 3 seconds
  const triggerBackOnlineBanner = () => {
    setShowBackOnlineBanner(true);
    if (onlineTimerRef.current) clearTimeout(onlineTimerRef.current);
    onlineTimerRef.current = setTimeout(() => {
      setShowBackOnlineBanner(false);
    }, 3000);
  };

  useEffect(() => {
    // Online/offline detection
    const handleOnline = () => {
      setIsOnline(true);
      // Only show "back online" if we were actually offline before
      if (wasOfflineRef.current) {
        triggerBackOnlineBanner();
        wasOfflineRef.current = false;
      }
      // Hide offline banner immediately
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      wasOfflineRef.current = true;
      triggerOfflineBanner();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Network speed detection
    const checkConnectionSpeed = () => {
      if ("connection" in navigator) {
        const connection = navigator.connection;
        const slowTypes = ["slow-2g", "2g"];
        const isSlowConnection =
          slowTypes.includes(connection.effectiveType) ||
          connection.downlink < 0.5;

        if (isSlowConnection && navigator.onLine) {
          setIsSlow(true);
          triggerSlowBanner();
        } else {
          setIsSlow(false);
        }
      }
    };

    checkConnectionSpeed();

    if ("connection" in navigator) {
      navigator.connection.addEventListener("change", checkConnectionSpeed);
    }

    // Periodic ping check
    const pingInterval = setInterval(async () => {
      if (!navigator.onLine) return;

      try {
        const start = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        await fetch("/logo.png?_=" + Date.now(), {
          method: "HEAD",
          cache: "no-cache",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - start;

        if (duration > 3000) {
          if (!isSlow) {
            setIsSlow(true);
            triggerSlowBanner();
          }
        } else {
          setIsSlow(false);
        }
      } catch (err) {
        if (navigator.onLine && !isSlow) {
          setIsSlow(true);
          triggerSlowBanner();
        }
      }
    }, 20000); // Every 20 seconds

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if ("connection" in navigator) {
        navigator.connection.removeEventListener("change", checkConnectionSpeed);
      }
      clearInterval(pingInterval);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
      if (onlineTimerRef.current) clearTimeout(onlineTimerRef.current);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">

      {/* 📡 Offline Banner — auto-fades after 6s */}
      {showOfflineBanner && !isOnline && (
        <motion.div
          key="offline-banner"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pt-3 px-4 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-red-600/95 to-rose-600/95 backdrop-blur-md text-white shadow-2xl rounded-2xl border border-white/10 px-5 py-3 max-w-md w-full pointer-events-auto">
            <div className="flex items-center justify-center gap-3 text-sm font-medium">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-200" />
              </span>
              <span className="flex-1 text-center">📡 You're offline — check your connection</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 🐢 Slow Network Banner — auto-fades after 5s */}
      {showSlowBanner && isOnline && (
        <motion.div
          key="slow-banner"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pt-3 px-4 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-amber-500/95 to-orange-500/95 backdrop-blur-md text-white shadow-2xl rounded-2xl border border-white/10 px-5 py-3 max-w-md w-full pointer-events-auto">
            <div className="flex items-center justify-center gap-3 text-sm font-medium">
              <motion.span
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-base"
              >
                🐢
              </motion.span>
              <span className="flex-1 text-center">Slow network — this might take a moment</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ✅ Back Online Banner — auto-fades after 3s */}
      {showBackOnlineBanner && isOnline && !isSlow && (
        <motion.div
          key="online-banner"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pt-3 px-4 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-emerald-500/95 to-green-500/95 backdrop-blur-md text-white shadow-2xl rounded-2xl border border-white/10 px-5 py-3 max-w-md w-full pointer-events-auto">
            <div className="flex items-center justify-center gap-3 text-sm font-medium">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-200" />
              </span>
              <span className="flex-1 text-center">✅ You're back online</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
