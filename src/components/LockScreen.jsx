export default function LockScreen({ onUnlock }) {
  const unlock = async () => {
    try {
      // Try to authenticate (login)
      await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: "required",
        },
      });

      onUnlock();
    } catch (e) {
      // If no credential exists → register fingerprint
      try {
        await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "My App" },
            user: {
              id: new Uint8Array(16),
              name: "user@example.com",
              displayName: "User",
            },
            pubKeyCredParams: [
              { type: "public-key", alg: -7 },
            ],
            authenticatorSelection: {
              userVerification: "required",
            },
            timeout: 60000,
          },
        });

        alert("Fingerprint registered. Tap again to unlock.");
      } catch (err) {
        alert("Authentication not available");
      }
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
