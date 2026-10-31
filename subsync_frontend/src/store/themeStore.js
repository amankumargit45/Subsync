import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
          return { theme: newTheme };
        });
      },
      
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },
      
      initTheme: () => {
        const stored = JSON.parse(localStorage.getItem('subflow-theme') || '{}');
        const theme = stored?.state?.theme || 'light';
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
    }),
    {
      name: 'subflow-theme',
    }
  )
);
