'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { InviteCode } from '../../dto/types';

export default function ManageInviteCodes() {
  const isAdmin = useAdminAuth();

  if (!isAdmin) {
    return null; // or a loading indicator
  }

  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);

  useEffect(() => {
    fetchInviteCodes();
  }, []);

  const fetchInviteCodes = async () => {
    const response = await fetch('/api/admin/invite-codes');
    if (response.ok) {
      const data = await response.json();
      setInviteCodes(data.inviteCodes);
    }
  };

  const handleCreateInviteCode = async () => {
    const response = await fetch('/api/admin/invite-codes', {
      method: 'POST',
    });

    if (response.ok) {
      fetchInviteCodes();
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Manage Invite Codes</h1>
      <button
        onClick={handleCreateInviteCode}
        className="mb-8 btn btn-primary"
      >
        Generate New Invite Code
      </button>
      <h2 className="text-2xl font-bold mb-4 text-foreground">Existing Invite Codes</h2>
      <ul className="space-y-2">
        {inviteCodes.map((inviteCode) => (
          <li key={inviteCode.id} className="bg-card p-4 rounded flex justify-between items-center">
            <span className="text-card-foreground">{inviteCode.code}</span>
            <span className={inviteCode.isUsed ? 'text-destructive' : 'text-primary'}>
              {inviteCode.isUsed ? 'Used' : 'Available'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

