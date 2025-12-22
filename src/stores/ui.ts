import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  apiKey: string
  setApiKey: (key: string) => void
  isApiKeyModalOpen: boolean
  setApiKeyModalOpen: (isOpen: boolean) => void
  showTutorial: boolean
  setShowTutorial: (show: boolean) => void
  theme: 'dark' | 'light'
  toggleTheme: () => void
  statusMessage: string | null
  setStatusMessage: (msg: string | null) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),
      isApiKeyModalOpen: false,
      setApiKeyModalOpen: (isOpen) => set({ isApiKeyModalOpen: isOpen }),
      showTutorial: false,
      setShowTutorial: (show) => set({ showTutorial: show }),
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      statusMessage: null,
      setStatusMessage: (msg) => set({ statusMessage: msg }),
    }),
    {
      name: 'pale-notes-ui',
      partialize: (state) => ({ apiKey: state.apiKey, theme: state.theme }), // Don't persist statusMessage
    }
  )
)
