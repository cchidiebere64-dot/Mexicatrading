function Home() {
  return (
    <div className="p-8 text-center bg-gradient-to-b from-emerald-50 to-white min-h-[80vh] flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">
        Welcome to <span className="text-emerald-600">Mexicatrading 🚀</span>
      </h1>
      <p className="text-lg text-slate-600 max-w-xl">
        Invest smartly, grow steadily. Choose from our trusted investment plans and start building your financial future today.
      </p>
      <div className="mt-8">
        <a
          href="/plans"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-md text-lg font-semibold transition"
        >
          View Plans
        </a>
      </div>
    </div>
  );
}

export default Home;
