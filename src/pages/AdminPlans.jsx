import AdminLayout from "../components/AdminLayout";

export default function AdminPlans() {
  const plans = [
    { id: 1, name: "Starter Plan", min: 100, max: 500, profit: "10%" },
    { id: 2, name: "Pro Plan", min: 500, max: 2000, profit: "20%" },
  ];

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">📈 Plans</h1>
      <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Min</th>
            <th className="p-3 text-left">Max</th>
            <th className="p-3 text-left">Profit</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((p) => (
            <tr key={p.id} className="border-b dark:border-gray-700">
              <td className="p-3">{p.name}</td>
              <td className="p-3">${p.min}</td>
              <td className="p-3">${p.max}</td>
              <td className="p-3">{p.profit}</td>
              <td className="p-3 space-x-2">
                <button className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Edit</button>
                <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
