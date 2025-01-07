'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Player } from '../dto/types';
import Link from 'next/link';
import Image from 'next/image';

export default function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const data = await response.json();
        setPlayers(data.players);
      } catch (err) {
        setError('Failed to load leaderboard. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return <div className="text-center mt-10 text-foreground">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-destructive">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Leaderboard</h1>
      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Player</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {players.map((player, index) => (
              <tr key={player.id} className={player.id?.toString() === user?.id ? "bg-accent" : ""}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/players/${player.id}`} className="flex items-center group">
                    <img
                      src={player.avatarUrl || '/placeholder-avatar.png'}
                      alt={player.name}
                      width={40}
                      height={40}
                      className="rounded-full mr-3"
                    />
                    <span className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors duration-200">
                      {player.name}
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{player.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

