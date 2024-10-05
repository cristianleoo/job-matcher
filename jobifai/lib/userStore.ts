import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  supabaseUserId: string | null;
  setSupabaseUserId: (id: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      supabaseUserId: null,
      setSupabaseUserId: (id) => {
        console.log('Setting Supabase User ID in store:', id);
        set({ supabaseUserId: id });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);