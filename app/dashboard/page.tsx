'use client';

import Link from 'next/link'
import { SeasonSwitcher } from '../components/SeasonSwitcher';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { Player } from '../dto/types';
import Image from 'next/image';

export default function Dashboard() {
  const { user, currentSeason } = useAuth();
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [upcomingSession, setUpcomingSession] = useState<any>(null);

  useEffect(() => {
    // Fetch top players
    fetch('/api/leaderboard?limit=5')
      .then(res => res.json())
      .then(data => setTopPlayers(data.players));

    // Fetch upcoming session
    fetch('/api/sessions/next')
      .then(res => res.json())
      .then(data => setUpcomingSession(data.session));
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Player Dashboard</h1>
        <SeasonSwitcher />
      </div>
      {currentSeason && (
        <p className="text-lg mb-6 text-muted-foreground">Current Season: {currentSeason.name}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">Your Stats</h2>
          <p className="mb-2 text-card-foreground">Total Points: {user.points}</p>
          <p className="mb-2 text-card-foreground">Games Played: {user.gamesPlayed}</p>
          <p className="text-card-foreground">Win Rate: {user.winRate}%</p>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">Upcoming Session</h2>
          {upcomingSession ? (
            <>
              <p className="mb-2 text-card-foreground">Date: {new Date(upcomingSession.date).toLocaleDateString()}</p>
              <p className="mb-2 text-card-foreground">Time: {upcomingSession.time}</p>
              <p className="mb-4 text-card-foreground">Location: {upcomingSession.location}</p>
              <Link href={`/sessions/${upcomingSession.id}`} className="btn btn-primary">
                View Session
              </Link>
            </>
          ) : (
            <p className="text-card-foreground">No upcoming sessions scheduled.</p>
          )}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Top Players</h2>
        <div className="card p-6">
          <ul className="divide-y divide-muted">
            {topPlayers.map((player, index) => (
              <li key={player.id} className="py-3 flex justify-between items-center">
                <Link href={`/players/${player.id}`} className="flex items-center group">
                  <span className="font-medium text-card-foreground mr-2">{index + 1}.</span>
                  <img
                    src={player.avatarUrl || '/placeholder-avatar.png'}
                    alt={player.name}
                    width={32}
                    height={32}
                    className="rounded-full mr-3"
                  />
                  <span className="text-primary group-hover:text-primary-foreground transition-colors">{player.name}</span>
                </Link>
                <span className="text-muted-foreground">{player.points} points</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

