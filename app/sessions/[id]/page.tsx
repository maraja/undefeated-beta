'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  position: string;
}

interface Team {
  id: string;
  name: string;
  players: Player[];
}

interface Session {
  id: string;
  date: string;
  time: string;
  location: string;
  teams: Team[];
  canEnroll: boolean;
}

export default function SessionDetail({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

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

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!session) {
    return <div className="text-center mt-10">No session data found.</div>;
  }

  const isEnrolled = session.teams.some(team => team.players.some(player => player.id === user?.id));

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Session Details</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <p className="text-xl font-semibold">Date: {new Date(session.date).toLocaleDateString()}</p>
          <p className="text-xl">Time: {session.time}</p>
          <p className="text-xl">Location: {session.location}</p>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {session.teams.map(team => (
            <div key={team.id} className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-xl font-semibold mb-2">{team.name}</h3>
              <ul className="space-y-2">
                {team.players.map(player => (
                  <li key={player.id} className="flex justify-between items-center">
                    <Link href={`/profile/${player.id}`} className="text-blue-600 hover:underline">
                      {player.name}
                    </Link>
                    <span className="text-gray-600">{player.position}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {user && !isEnrolled && session.canEnroll && (
          <button
            onClick={handleEnroll}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Enroll in Session
          </button>
        )}
        {!session.canEnroll && (
          <p className="mt-6 text-yellow-600">Enrollment for this session is not yet open.</p>
        )}
      </div>
    </div>
  );
}

