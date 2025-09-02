import AdminLayout from "../components/AdminLayout";

export default function AdminUsers() {
  const users = [
    { id: 1, name: "John Doe", email: "john@mail.com", balance: 200 },
    { id: 2, name: "Jane Smith", email: "jane@mail.com", balance: 500 },
  ];

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">👥 Users</h1>
      <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Balance</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b dark:border-gray-700">
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3 font-bold">${u.balance}</td>
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
