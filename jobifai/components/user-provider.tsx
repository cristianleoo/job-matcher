"use client";

import React, { useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserStore } from '@/lib/userStore';
import { createClient } from '@supabase/supabase-js';

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { isLoaded: isClerkLoaded, user: clerkUser } = useUser();
  const [supabaseUserId, setSupabaseUserId] = React.useState<string | null>(null);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const fetchSupabaseUserId = useCallback(async (clerkId: string) => {
    try {
      const { data, error } = await supabase.from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single();

      if (error) throw error;
      setSupabaseUserId(data.id);
      useUserStore.setState({ supabaseUserId: data.id });
    } catch (error) {
      console.error('Error fetching Supabase user ID:', error);
      console.log(`Error fetching Supabase user ID: ${error}`);
    }
  }, [supabase]);

  useEffect(() => {
    if (isClerkLoaded && clerkUser?.id && !supabaseUserId) {
      fetchSupabaseUserId(clerkUser.id);
    }
  }, [isClerkLoaded, clerkUser?.id, supabaseUserId, fetchSupabaseUserId]);

  // Render children or loading state
  return (
    <>
      {children}
    </>
  );
}