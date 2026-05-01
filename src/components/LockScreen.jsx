export default function LockScreen({ onUnlock }) {
  const authenticate = async () => {
    try {
      const cred = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          userVerification: "required",
          timeout: 60000,
        },
      });

      if (cred) {
        onUnlock();
      }
    } catch (e) {
      alert("Please enable fingerprint / Face ID on your device and try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-white">
      
      {/* Fingerprint icon (simple UI) */}
      <div className="text-6xl mb-6">🔒</div>

      <p className="mb-4 text-lg">Use fingerprint to unlock</p>

      <button
        onClick={authenticate}
        className="bg-white text-black px-6 py-3 rounded-xl font-semibold"
      >
        Tap to unlock
      </button>
    </div>
  );
}
