import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SiliconFlowModel } from '@/api/siliconflow'

export type LLMProvider = 'deepseek' | 'siliconflow'

interface UIState {
  apiKey: string
  setApiKey: (key: string) => void
  provider: LLMProvider
  setProvider: (provider: LLMProvider) => void
  siliconflowModel: SiliconFlowModel
  setSiliconflowModel: (model: SiliconFlowModel) => void
  isApiKeyModalOpen: boolean
  setApiKeyModalOpen: (isOpen: boolean) => void
  showTutorial: boolean
  setShowTutorial: (show: boolean) => void
  theme: 'dark' | 'light'
  toggleTheme: () => void
  statusMessage: string | null
  setStatusMessage: (msg: string | null) => void
  autoFollow: boolean
  setAutoFollow: (v: boolean) => void
  // Prefill for custom action input (used by retry to repopulate textbox)
  pendingActionText: string
  setPendingActionText: (text: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),
      provider: 'deepseek',
      setProvider: (provider) => set({ provider }),
      siliconflowModel: 'Pro/deepseek-ai/DeepSeek-V3.2',
      setSiliconflowModel: (model) => set({ siliconflowModel: model }),
      isApiKeyModalOpen: false,
      setApiKeyModalOpen: (isOpen) => set({ isApiKeyModalOpen: isOpen }),
      showTutorial: false,
      setShowTutorial: (show) => set({ showTutorial: show }),
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      statusMessage: null,
      setStatusMessage: (msg) => set({ statusMessage: msg }),
      autoFollow: true,
      setAutoFollow: (v: boolean) => set({ autoFollow: v }),
      pendingActionText: '',
      setPendingActionText: (text: string) => set({ pendingActionText: text }),
    }),
    {
      name: 'pale-notes-ui',
      partialize: (state) => ({
        apiKey: state.apiKey,
        provider: state.provider,
        siliconflowModel: state.siliconflowModel,
        theme: state.theme,
        autoFollow: state.autoFollow,
      }), // Don't persist statusMessage
    }
  )
)
