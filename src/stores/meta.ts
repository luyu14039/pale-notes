import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MetaState {
  completedOrigins: string[]
  maxChapterReached: number
  keyEventsWitnessed: string[]
  
  markOriginComplete: (origin: string) => void
  updateMaxChapter: (chapter: number) => void
  addKeyEvent: (eventId: string) => void
}

export const useMetaStore = create<MetaState>()(
  persist(
    (set) => ({
      completedOrigins: [],
      maxChapterReached: 0,
      keyEventsWitnessed: [],

      markOriginComplete: (origin) => set((state) => {
        if (state.completedOrigins.includes(origin)) return state;
        return { completedOrigins: [...state.completedOrigins, origin] };
      }),
      updateMaxChapter: (chapter) => set((state) => ({
        maxChapterReached: Math.max(state.maxChapterReached, chapter)
      })),
      addKeyEvent: (eventId) => set((state) => {
        if (state.keyEventsWitnessed.includes(eventId)) return state;
        return { keyEventsWitnessed: [...state.keyEventsWitnessed, eventId] };
      })
    }),
    {
      name: 'pale-notes-meta',
    }
  )
)
