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
      <h1 className="text-3xl font-bold mb-6 text-foreground">Admin Panel</h1>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/seasons" className="bg-primary text-primary-foreground p-4 rounded-lg text-center hover:bg-primary/90 transition-colors">
          Manage Seasons
        </Link>
        <Link href="/admin/sessions" className="bg-secondary text-secondary-foreground p-4 rounded-lg text-center hover:bg-secondary/90 transition-colors">
          Manage Sessions
        </Link>
        <Link href="/admin/invite-codes" className="bg-accent text-accent-foreground p-4 rounded-lg text-center hover:bg-accent/90 transition-colors">
          Manage Invite Codes
        </Link>
        <Link href="/admin/games" className="bg-muted text-muted-foreground p-4 rounded-lg text-center hover:bg-muted/90 transition-colors">
          Manage Games
        </Link>
      </div>
    </div>
  );
}

