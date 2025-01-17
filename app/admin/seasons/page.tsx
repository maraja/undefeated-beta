'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Season } from '../../dto/types';

export default function ManageSeasons() {
  const isAdmin = useAdminAuth();

  if (!isAdmin) {
    return null; // or a loading indicator
  }

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    const response = await fetch('/api/admin/seasons');
    if (response.ok) {
      const data = await response.json();
      setSeasons(data.seasons);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/seasons/${editingId}` : '/api/admin/seasons';
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, startDate, endDate }),
    });

    if (response.ok) {
      setName('');
      setStartDate('');
      setEndDate('');
      setEditingId(null);
      fetchSeasons();
    }
  };

  const handleEdit = (season: Season) => {
    setName(season.name);
    setStartDate(season.startDate);
    setEndDate(season.endDate);
    setEditingId(season.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this season?')) {
      const response = await fetch(`/api/admin/seasons/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSeasons();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-gray-200">Manage Seasons</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Season Name"
            className="p-2 border rounded bg-gray-700 text-gray-200"
            required
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded bg-gray-700 text-gray-200"
            required
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded bg-gray-700 text-gray-200"
            required
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {editingId ? 'Update Season' : 'Create Season'}
        </button>
      </form>
      <h2 className="text-2xl font-bold mb-4 text-gray-200">Existing Seasons</h2>
      <ul className="space-y-2">
        {seasons.map((season) => (
          <li key={season.id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-200">{season.name}</h3>
              <p className="text-gray-400">Start Date: {new Date(season.startDate).toLocaleDateString()}</p>
              <p className="text-gray-400">End Date: {new Date(season.endDate).toLocaleDateString()}</p>
            </div>
            <div>
              <button
                onClick={() => handleEdit(season)}
                className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(season.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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

