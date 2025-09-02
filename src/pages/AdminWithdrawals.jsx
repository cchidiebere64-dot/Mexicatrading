import AdminLayout from "../components/AdminLayout";

export default function AdminWithdrawals() {
  const withdrawals = [
    { id: 1, user: "John Doe", amount: 150, status: "Pending" },
    { id: 2, user: "Jane Smith", amount: 200, status: "Paid" },
  ];

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">🏧 Withdrawals</h1>
      <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-3 text-left">User</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((w) => (
            <tr key={w.id} className="border-b dark:border-gray-700">
              <td className="p-3">{w.user}</td>
              <td className="p-3">${w.amount}</td>
              <td className="p-3">{w.status}</td>
              <td className="p-3 space-x-2">
                <button className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">Approve</button>
                <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
