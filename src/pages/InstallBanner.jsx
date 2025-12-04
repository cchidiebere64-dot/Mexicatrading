// src/components/InstallBanner.jsx
import { useEffect, useState } from "react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault(); // Prevent automatic prompt
      setDeferredPrompt(e);
      setShowBanner(true); // Show our custom banner
      console.log("🌟 PWA install prompt is ready");
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); // Show browser install prompt
    const choice = await deferredPrompt.userChoice;
    console.log("👍 User choice:", choice.outcome);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null; // Don't render anything if not ready

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-50">
      <span>Install Mexicatrading for a better experience!</span>
      <button
        onClick={handleInstallClick}
        className="bg-white text-emerald-600 px-3 py-1 rounded font-semibold hover:bg-gray-200"
      >
        Install
      </button>
      <button onClick={handleDismiss} className="text-white font-bold ml-2">✕</button>
    </div>
  );
}
