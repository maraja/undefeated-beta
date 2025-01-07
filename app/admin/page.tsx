'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function AdminPanel() {
  const isAdmin = useAdminAuth();

  if (!isAdmin) {
    return null; // or a loading indicator
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/seasons" className="bg-blue-600 text-white p-4 rounded-lg text-center">
          Manage Seasons
        </Link>
        <Link href="/admin/sessions" className="bg-green-600 text-white p-4 rounded-lg text-center">
          Manage Sessions
        </Link>
        <Link href="/admin/invite-codes" className="bg-yellow-600 text-white p-4 rounded-lg text-center">
          Manage Invite Codes
        </Link>
        <Link href="/admin/games" className="bg-purple-600 text-white p-4 rounded-lg text-center">
          Manage Games
        </Link>
      </div>
    </div>
  );
}

