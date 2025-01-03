import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Undefeated Basketball League</h1>
      <div className="mb-8">
        <Image
          src="/basketball-hero.jpg"
          alt="Basketball court"
          width={800}
          height={400}
          className="rounded-lg shadow-lg"
        />
      </div>
      <p className="text-xl mb-8">Join weekly basketball sessions, compete with randomized teams, and climb the leaderboard!</p>
      <Link href="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
        Register Now
      </Link>
    </div>
  )
}

