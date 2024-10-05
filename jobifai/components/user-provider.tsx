"use client";

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useUserStore } from '@/lib/userStore';
import React from 'react';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const setSupabaseUserId = useUserStore((state) => state.setSupabaseUserId);

  useEffect(() => {
    if (userId) {
      // Fetch Supabase user ID here
      fetch('/api/auth', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.user && data.user.id) {
            console.log('Setting supabaseUserId:', data.user.id);
            setSupabaseUserId(data.user.id);
          } else {
            console.error('No Supabase user ID found in response');
          }
        })
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, [userId, setSupabaseUserId]);

  return <>{children}</>;
}