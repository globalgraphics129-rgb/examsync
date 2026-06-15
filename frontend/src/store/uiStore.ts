import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isDarkMode: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
}));
