'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trophy, Calendar, Users, Activity, Edit, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

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
}

export default function Profile() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState<Player | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
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
  }, []);

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
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!player) {
    return <div className="text-center mt-10">No player data found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src={player.avatarUrl || '/placeholder-avatar.png'}
                alt={player.name}
                width={120}
                height={120}
                className="rounded-full border-4 border-white"
              />
              <div className="ml-6">
                <h1 className="text-3xl font-bold">{player.name}</h1>
                <p className="text-blue-200">{player.position}</p>
              </div>
            </div>
            {user && user.id === player.id && (
              <button
                onClick={isEditing ? handleSave : handleEdit}
                className="bg-white text-blue-600 px-4 py-2 rounded-full flex items-center"
              >
                {isEditing ? <><Save className="mr-2" /> Save</> : <><Edit className="mr-2" /> Edit</>}
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Player Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Trophy className="mr-2 text-yellow-500" />
                  <span className="font-medium">Total Points:</span>
                  <span className="ml-2">{player.points}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 text-green-500" />
                  <span className="font-medium">Games Played:</span>
                  <span className="ml-2">{player.gamesPlayed}</span>
                </div>
                <div className="flex items-center">
                  <Activity className="mr-2 text-blue-500" />
                  <span className="font-medium">Win Rate:</span>
                  <span className="ml-2">{player.winRate}%</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">About Me</h2>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editedPlayer?.bio || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows={4}
                />
              ) : (
                <p className="text-gray-600">{player.bio}</p>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedPlayer?.name || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={editedPlayer?.position || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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

