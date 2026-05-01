export default function LockScreen({ onUnlock }) {
  const unlock = async () => {
    try {
      await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: "required",
        },
      });

      onUnlock();
    } catch (error) {
      alert("Authentication failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <button
        onClick={unlock}
        className="bg-white text-black px-6 py-3 rounded-xl font-semibold"
      >
        Unlock with Fingerprint
      </button>
    </div>
  );
}
