'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy, Calendar, Users, Activity } from 'lucide-react';

interface Session {
  id: string;
  date: string;
  time: string;
  location: string;
}

interface Player {
  id: string;
  name: string;
  email: string;
  points: number;
  gamesPlayed: number;
  winRate: number;
  position: string;
  bio: string;
  avatarUrl: string;
  recentSessions: Session[];
}

export default function PlayerProfile({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await fetch(`/api/players/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch player');
        }
        const data = await response.json();
        setPlayer(data.player);
      } catch (err) {
        setError('Failed to load player profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayer();
  }, [params.id]);

  if (isLoading) {
    return <div className="text-center mt-10 text-foreground">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-destructive">{error}</div>;
  }

  if (!player) {
    return <div className="text-center mt-10 text-foreground">No player data found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-card shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
          <div className="flex items-center">
            <img
              src={player.avatarUrl || '/placeholder-avatar.png'}
              alt={player.name}
              width={120}
              height={120}
              className="rounded-full border-4 border-white"
            />
            <div className="ml-6">
              <h1 className="text-3xl font-bold">{player.name}</h1>
              <p className="text-primary-foreground/80">{player.position}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-background text-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Player Stats</h2>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-2 flex items-center">
                      <Trophy className="mr-2 text-yellow-500" />
                      <span className="font-medium">Total Points:</span>
                    </td>
                    <td className="py-2">{player.points}</td>
                  </tr>
                  <tr>
                    <td className="py-2 flex items-center">
                      <Calendar className="mr-2 text-green-500" />
                      <span className="font-medium">Games Played:</span>
                    </td>
                    <td className="py-2">{player.gamesPlayed}</td>
                  </tr>
                  <tr>
                    <td className="py-2 flex items-center">
                      <Activity className="mr-2 text-blue-500" />
                      <span className="font-medium">Win Rate:</span>
                    </td>
                    <td className="py-2">{player.winRate}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">About Me</h2>
              <p>{player.bio}</p>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
            {player.recentSessions && player.recentSessions.length > 0 ? (
              <ul className="space-y-2">
                {player.recentSessions.map((session) => (
                  <li key={session.id} className="bg-card p-3 rounded-md">
                    <Link href={`/sessions/${session.id}`} className="text-primary hover:underline">
                      {new Date(session.date).toLocaleDateString()} at {session.time}
                    </Link>
                    <span className="ml-2">{session.location}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No recent sessions found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

