'use client';

import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AuthHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (response.ok) {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-blue-600 text-white">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">Undefeated</Link>
        <ul className="flex space-x-4">
          {isLoggedIn ? (
            <>
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/leaderboard">Leaderboard</Link></li>
              <li><Link href="/sessions">Sessions</Link></li>
              <li><Link href="/profile">Profile</Link></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}

