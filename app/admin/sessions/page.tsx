'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Season, Session } from '../../dto/types';

export default function ManageSessions() {
  const isAdmin = useAdminAuth();

  if (!isAdmin) {
    return null; // or a loading indicator
  }

  const [sessions, setSessions] = useState<Session[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchSeasons();
  }, []);

  const fetchSessions = async () => {
    const response = await fetch('/api/admin/sessions');
    if (response.ok) {
      const data = await response.json();
      setSessions(data.sessions);
    }
  };

  const fetchSeasons = async () => {
    const response = await fetch('/api/admin/seasons');
    if (response.ok) {
      const data = await response.json();
      setSeasons(data.seasons);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/sessions/${editingId}` : '/api/admin/sessions';
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time, location, seasonId }),
    });

    if (response.ok) {
      setDate('');
      setTime('');
      setLocation('');
      setSeasonId('');
      setEditingId(null);
      fetchSessions();
    }
  };

  const handleEdit = (session: Session) => {
    setDate(session.date);
    setTime(session.time);
    setLocation(session.location);
    setSeasonId(session.seasonId.toString());
    setEditingId(session.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this session?')) {
      const response = await fetch(`/api/admin/sessions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSessions();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Manage Sessions</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border rounded bg-input text-foreground"
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="p-2 border rounded bg-input text-foreground"
            required
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="p-2 border rounded bg-input text-foreground"
            required
          />
          <select
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
            className="p-2 border rounded bg-input text-foreground"
            required
          >
            <option value="">Select Season</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="mt-4 btn btn-primary">
          {editingId ? 'Update Session' : 'Create Session'}
        </button>
      </form>
      <h2 className="text-2xl font-bold mb-4 text-foreground">Existing Sessions</h2>
      <ul className="space-y-2">
        {sessions.map((session) => (
          <li key={session.id} className="bg-card p-4 rounded flex justify-between items-center">
            <div>
              <p className="text-card-foreground">Date: {new Date(session.date).toLocaleDateString()}</p>
              <p className="text-card-foreground">Time: {session.time}</p>
              <p className="text-card-foreground">Location: {session.location}</p>
              <p className="text-muted-foreground">Season: {seasons.find(s => s.id === session.seasonId)?.name}</p>
            </div>
            <div>
              <button
                onClick={() => handleEdit(session)}
                className="bg-secondary text-secondary-foreground px-3 py-1 rounded mr-2 hover:bg-secondary/90"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(session.id)}
                className="bg-destructive text-destructive-foreground px-3 py-1 rounded hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

