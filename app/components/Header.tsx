import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-blue-600 text-white">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">Undefeated</Link>
        <ul className="flex space-x-4">
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/leaderboard">Leaderboard</Link></li>
          <li><Link href="/sessions">Sessions</Link></li>
          <li><Link href="/profile">Profile</Link></li>
        </ul>
      </nav>
    </header>
  )
}

