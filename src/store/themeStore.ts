import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  isSystemTheme: boolean;
  toggleTheme: () => void;
  setSystemTheme: (useSystem: boolean) => void;
  updateFromSystem: () => void;
}

const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: getSystemTheme(),
      isSystemTheme: true,
      toggleTheme: () => 
        set((state) => ({ 
          isDark: !state.isDark,
          isSystemTheme: false 
        })),
      setSystemTheme: (useSystem) => 
        set(() => ({ 
          isSystemTheme: useSystem,
          isDark: useSystem ? getSystemTheme() : false
        })),
      updateFromSystem: () =>
        set((state) => ({
          isDark: state.isSystemTheme ? getSystemTheme() : state.isDark
        })),
    }),
    {
      name: 'theme-storage',
    }
  )
);