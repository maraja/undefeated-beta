'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Session {
  id: string;
  date: string;
  time: string;
  location: string;
  playerCount: number;
  canEnroll: boolean;
}

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/sessions');
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();
        setSessions(data.sessions);
      } catch (err) {
        setError('Failed to load sessions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Upcoming Sessions</h1>
      <div className="grid gap-6">
        {sessions.map(session => (
          <Link key={session.id} href={`/sessions/${session.id}`}>
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
              <p className="text-xl font-semibold">Date: {new Date(session.date).toLocaleDateString()}</p>
              <p className="text-lg">Time: {session.time}</p>
              <p className="text-lg">Location: {session.location}</p>
              <p className="text-lg">Players Enrolled: {session.playerCount}</p>
              {session.canEnroll ? (
                <p className="text-green-600 mt-2">Open for enrollment</p>
              ) : (
                <p className="text-yellow-600 mt-2">Enrollment not yet open</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

