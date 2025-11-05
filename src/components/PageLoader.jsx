export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="w-9 h-9 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
