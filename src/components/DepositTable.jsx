import API from "../api";

export default function DepositTable({ deposits, refresh }) {
  const handleAction = async (id, action) => {
    if (!confirm(`Are you sure you want to ${action} this deposit?`)) return;
    try {
      await API.put(`/deposits/${id}`, { action });
      alert(`Deposit ${action}ed successfully`);
      refresh();
    } catch (err) {
      console.error(err);
      alert("Action failed.");
    }
  };

  return (
    <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
      <thead>
        <tr className="bg-emerald-600 text-white">
          <th className="p-3 text-left">User</th>
          <th className="p-3 text-left">Amount</th>
          <th className="p-3 text-left">Status</th>
          <th className="p-3 text-left">Action</th>
        </tr>
      </thead>
      <tbody>
        {deposits.map((d) => (
          <tr key={d._id} className="border-b border-gray-200 dark:border-gray-700">
            <td className="p-3">{d.user?.email}</td>
            <td className="p-3">${d.amount}</td>
            <td className="p-3 capitalize">{d.status}</td>
            <td className="p-3 flex gap-2">
              {d.status === "pending" && (
                <>
                  <button
                    onClick={() => handleAction(d._id, "approve")}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(d._id, "reject")}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
