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
    return <div className="text-center mt-10 text-foreground">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-destructive">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Upcoming Sessions</h1>
      <div className="grid gap-6">
        {sessions.map(session => (
          <div key={session.id} className="bg-card shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xl font-semibold text-card-foreground">Date: {new Date(session.date).toLocaleDateString()}</p>
                <p className="text-lg text-card-foreground">Time: {session.time}</p>
                <p className="text-lg text-card-foreground">Location: {session.location}</p>
                <p className="text-lg text-card-foreground">Games: {session.games.length}</p>
              </div>
              <div>
                {user && canEnroll(session.date) && (
                  <button
                    onClick={() => handleEnroll(session.id)}
                    className="btn btn-primary"
                  >
                    Enroll
                  </button>
                )}
                {!canEnroll(session.date) && (
                  <p className="text-muted-foreground">Enrollment not yet open</p>
                )}
              </div>
            </div>
            <Link href={`/sessions/${session.id}`} className="text-primary hover:underline">
              View Session Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

