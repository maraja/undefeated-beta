'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AuthHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const response = await fetch('/api/user/isAdmin');
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      }
    };
    checkAdminStatus();
  }, [user]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (response.ok) {
        logout();
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">Undefeated</Link>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <ul className={`md:flex md:space-x-4 ${isMenuOpen ? 'block' : 'hidden'} md:block absolute md:relative top-16 md:top-0 left-0 md:left-auto right-0 md:right-auto bg-blue-600 md:bg-transparent p-4 md:p-0 rounded-b-lg md:rounded-none shadow-md md:shadow-none`}>
          {user ? (
            <>
              <li><Link href="/dashboard" className="block py-2 md:py-0 hover:text-blue-200 transition-colors">Dashboard</Link></li>
              <li><Link href="/leaderboard" className="block py-2 md:py-0 hover:text-blue-200 transition-colors">Leaderboard</Link></li>
              <li><Link href="/sessions" className="block py-2 md:py-0 hover:text-blue-200 transition-colors">Sessions</Link></li>
              <li><Link href="/profile" className="block py-2 md:py-0 hover:text-blue-200 transition-colors">Profile</Link></li>
              {isAdmin && (
                <li><Link href="/admin" className="block py-2 md:py-0 hover:text-blue-200 transition-colors">Admin</Link></li>
              )}
              <li><button onClick={handleLogout} className="block w-full text-left py-2 md:py-0 hover:text-blue-200 transition-colors">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link href="/login" className="block py-2 md:py-0 hover:text-blue-200 transition-colors">Login</Link></li>
              <li><Link href="/register" className="block py-2 md:py-0 hover:text-blue-200 transition-colors">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

