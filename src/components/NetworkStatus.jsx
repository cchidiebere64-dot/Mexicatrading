import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, Gauge } from "lucide-react";
import { T } from "../pages/system.jsx";

const c = T.color;

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlow, setIsSlow] = useState(false);

  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showSlowBanner, setShowSlowBanner] = useState(false);
  const [showBackOnlineBanner, setShowBackOnlineBanner] = useState(false);

  const slowTimerRef = useRef(null);
  const offlineTimerRef = useRef(null);
  const onlineTimerRef = useRef(null);
  const wasOfflineRef = useRef(false);

  /* Offline — auto-hides after 6s */
  const triggerOfflineBanner = () => {
    setShowOfflineBanner(true);
    if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
    offlineTimerRef.current = setTimeout(() => setShowOfflineBanner(false), 6000);
  };

  /* Slow — auto-hides after 5s */
  const triggerSlowBanner = () => {
    setShowSlowBanner(true);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    slowTimerRef.current = setTimeout(() => setShowSlowBanner(false), 5000);
  };

  /* Back online — auto-hides after 3s */
  const triggerBackOnlineBanner = () => {
    setShowBackOnlineBanner(true);
    if (onlineTimerRef.current) clearTimeout(onlineTimerRef.current);
    onlineTimerRef.current = setTimeout(() => setShowBackOnlineBanner(false), 3000);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOfflineRef.current) {
        triggerBackOnlineBanner();
        wasOfflineRef.current = false;
      }
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      wasOfflineRef.current = true;
      triggerOfflineBanner();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    /* Network speed detection */
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

    /* Periodic ping check */
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
    }, 20000);

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

  /* ── One banner, three states ── */
  const Banner = ({ icon: Icon, tone, title, detail }) => (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: .28, ease: [.22, 1, .36, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9998,
        background: c.panel,
        borderBottom: `1px solid ${c.line}`,
        boxShadow: "0 6px 24px rgba(0,0,0,.35)",
      }}>
      <div style={{ height: 2, background: tone }} />
      <div className="flex items-center gap-3 mx-auto"
        style={{ maxWidth: 640, padding: "11px 18px" }}>
        <Icon size={14} style={{ color: tone, flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontFamily: "'Archivo',system-ui,sans-serif",
            fontSize: T.size.sm, color: c.text, lineHeight: 1.3,
          }}>
            {title}
          </p>
          {detail && (
            <p style={{
              fontFamily: "'Archivo',system-ui,sans-serif",
              fontSize: T.size.xs, color: c.text3, marginTop: 2, lineHeight: 1.4,
            }}>
              {detail}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {showOfflineBanner && !isOnline && (
        <Banner key="offline"
          icon={WifiOff}
          tone={c.loss}
          title="You're offline"
          detail="Deposits and withdrawals won't go through until your connection returns." />
      )}

      {showBackOnlineBanner && isOnline && (
        <Banner key="online"
          icon={Wifi}
          tone={c.gain}
          title="Back online"
          detail="Your connection has been restored." />
      )}

      {showSlowBanner && isOnline && !showBackOnlineBanner && (
        <Banner key="slow"
          icon={Gauge}
          tone={c.brass}
          title="Slow connection"
          detail="Pages may take longer to load. Your data is safe." />
      )}
    </AnimatePresence>
  );
}
