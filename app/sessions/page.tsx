export default function Sessions() {
  const dummyData = [
    { id: 1, date: "2023-06-15", time: "18:00", location: "Main Court" },
    { id: 2, date: "2023-06-22", time: "18:00", location: "Main Court" },
    { id: 3, date: "2023-06-29", time: "18:00", location: "Main Court" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Upcoming Sessions</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {dummyData.map((session) => (
              <tr key={session.id}>
                <td className="px-6 py-4 whitespace-nowrap">{session.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{session.time}</td>
                <td className="px-6 py-4 whitespace-nowrap">{session.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    Register
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

