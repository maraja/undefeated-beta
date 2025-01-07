'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import { Session } from '../../dto/types';

export default function SessionDetail({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }
        const data = await response.json();
        setSession(data.session);
      } catch (err) {
        setError('Failed to load session. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [params.id]);

  const handleEnroll = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}/enroll`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to enroll in session');
      }
      const updatedSession = await response.json();
      setSession(updatedSession.session);
    } catch (err) {
      setError('Failed to enroll in session. Please try again.');
    }
  };

  const canEnroll = (sessionDate: string) => {
    const enrollmentOpenDate = new Date(sessionDate);
    enrollmentOpenDate.setDate(enrollmentOpenDate.getDate() - 3); // 3 days before the session
    return new Date() >= enrollmentOpenDate;
  };

  if (isLoading) {
    return <div className="text-center mt-10 text-foreground">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-destructive">{error}</div>;
  }

  if (!session) {
    return <div className="text-center mt-10 text-foreground">No session data found.</div>;
  }

  const isEnrolled = session.games.some(game => 
    game.teams.some(team => 
      team.players.some(player => player.id === Number(user?.id))
    )
  );

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Session Details</h1>
      <div className="bg-card shadow-md rounded-lg p-6">
        <div className="mb-4">
          <p className="text-xl font-semibold text-card-foreground">Date: {new Date(session.date).toLocaleDateString()}</p>
          <p className="text-xl text-card-foreground">Time: {session.time}</p>
          <p className="text-xl text-card-foreground">Location: {session.location}</p>
          <p className="text-xl text-card-foreground">Number of Games: {session.games.length}</p>
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-card-foreground">Games</h2>
        {session.games.length > 0 ? (
          session.games.map((game, index) => (
            <div key={game.id} className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Game {index + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {game.teams.map(team => (
                  <div key={team.id} className="bg-accent p-4 rounded-md">
                    <h4 className="text-lg font-semibold mb-2 text-accent-foreground">{team.name}</h4>
                    <ul className="space-y-2">
                      {team.players.map(player => (
                        <li key={player.id} className="flex justify-between items-center">
                          <Link href={`/players/${player.id}`} className="text-primary hover:underline">
                            {player.name}
                          </Link>
                          <span className="text-muted-foreground">{player.position}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {game.winnerId && (
                <p className="mt-2 font-semibold text-card-foreground">
                  Winner: {game.teams.find(team => team.id === game.winnerId)?.name}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No games have been created for this session yet.</p>
        )}
        {user && !isEnrolled && canEnroll(session.date) && (
          <button
            onClick={handleEnroll}
            className="mt-6 btn btn-primary"
          >
            Enroll in Session
          </button>
        )}
        {!canEnroll(session.date) && (
          <p className="mt-6 text-muted-foreground">Enrollment for this session is not yet open.</p>
        )}
      </div>
    </div>
  );
}

