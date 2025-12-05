{/*import { useState, useEffect } from "react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault(); // Prevent default mini-infobar
      setDeferredPrompt(e); // Save the event for later
      setVisible(true); // Show banner
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); // Show the install prompt
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      console.log("✅ User installed the app");
    } else {
      console.log("❌ User dismissed install");
    }
    setDeferredPrompt(null);
    setVisible(false); // Hide banner
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-emerald-600 text-white p-4 rounded-lg shadow-lg flex justify-between items-center z-50">
      <span className="font-semibold">Install Mexicatrading App for a better experience!</span>
      <div className="flex gap-2">
        <button
          onClick={handleInstallClick}
          className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Install
        </button>
        <button
          onClick={() => setVisible(false)}
          className="px-4 py-2 rounded-lg hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

*/}
