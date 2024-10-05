import { create } from 'zustand';

interface UserState {
  supabaseUserId: string | null;
  setSupabaseUserId: (id: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  supabaseUserId: null,
  setSupabaseUserId: (id) => set({ supabaseUserId: id }),
}));