import Link from 'next/link'

export default async function Dashboard() {
  // In a real app, you'd fetch this data from your API
  const playerStats = {
    totalPoints: 120,
    sessionsPlayed: 8,
    winRate: 75
  }

  const upcomingSession = {
    date: '2023-06-15',
    time: '18:00',
    location: 'Main Court'
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Player Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
          <p>Total Points: {playerStats.totalPoints}</p>
          <p>Sessions Played: {playerStats.sessionsPlayed}</p>
          <p>Win Rate: {playerStats.winRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upcoming Session</h2>
          <p>Date: {upcomingSession.date}</p>
          <p>Time: {upcomingSession.time}</p>
          <p>Location: {upcomingSession.location}</p>
          <Link href="/sessions" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            View All Sessions
          </Link>
        </div>
      </div>
    </div>
  )
}

