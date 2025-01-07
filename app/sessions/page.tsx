'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { Session } from '../dto/types';

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

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

  const handleEnroll = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/enroll`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to enroll in session');
      }
      // Refresh the sessions after enrollment
      const updatedSessionsResponse = await fetch('/api/sessions');
      const updatedSessionsData = await updatedSessionsResponse.json();
      setSessions(updatedSessionsData.sessions);
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
          <div key={session.id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xl font-semibold">Date: {new Date(session.date).toLocaleDateString()}</p>
                <p className="text-lg">Time: {session.time}</p>
                <p className="text-lg">Location: {session.location}</p>
                <p className="text-lg">Games: {session.games.length}</p>
              </div>
              <div>
                {user && canEnroll(session.date) && (
                  <button
                    onClick={() => handleEnroll(session.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Enroll
                  </button>
                )}
                {!canEnroll(session.date) && (
                  <p className="text-yellow-600">Enrollment not yet open</p>
                )}
              </div>
            </div>
            <Link href={`/sessions/${session.id}`} className="text-blue-600 hover:underline">
              View Session Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

