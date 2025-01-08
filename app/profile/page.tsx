'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trophy, Calendar, Users, Activity, Edit, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Player } from '../dto/types';
import { SeasonSwitcher } from '../components/SeasonSwitcher';

export default function Profile() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState<Player | null>(null);
  const router = useRouter();
  const { user, currentSeason } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user || !currentSeason) return;
        const response = await fetch(`/api/profile?seasonId=${currentSeason.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setPlayer(data.player);
        setEditedPlayer(data.player);
      } catch (err) {
        setError('Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, currentSeason]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedPlayer),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setPlayer(editedPlayer);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedPlayer(prev => prev ? { ...prev, [name]: value } : null);
  };

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
          <div className="flex items-center justify-between">
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
            {user && user.id === String(player.id) && (
              <button
                onClick={isEditing ? handleSave : handleEdit}
                className="bg-white text-primary px-4 py-2 rounded-full flex items-center"
              >
                {isEditing ? <><Save className="mr-2" /> Save</> : <><Edit className="mr-2" /> Edit</>}
              </button>
            )}
            <SeasonSwitcher />
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
                      <Trophy className="mr-2 text-primary" />
                      <span className="font-medium">Total Points:</span>
                    </td>
                    <td className="py-2">{player.points}</td>
                  </tr>
                  <tr>
                    <td className="py-2 flex items-center">
                      <Calendar className="mr-2 text-secondary" />
                      <span className="font-medium">Games Played:</span>
                    </td>
                    <td className="py-2">{player.gamesPlayed}</td>
                  </tr>
                  <tr>
                    <td className="py-2 flex items-center">
                      <Activity className="mr-2 text-accent" />
                      <span className="font-medium">Win Rate:</span>
                    </td>
                    <td className="py-2">{player.winRate}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">About Me</h2>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editedPlayer?.bio || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-700 text-white"
                  rows={4}
                />
              ) : (
                <p>{player.bio}</p>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedPlayer?.name || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-input rounded-md shadow-sm p-2 bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={editedPlayer?.position || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-input rounded-md shadow-sm p-2 bg-gray-700 text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

