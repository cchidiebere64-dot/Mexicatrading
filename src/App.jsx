import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Only render Dashboard */}
      <main className="flex-grow">
        <Dashboard />
      </main>
    </div>
  );
}
