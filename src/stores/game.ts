import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { StoryState } from '@/types/story'

export interface AspectState {
  lantern: number
  forge: number
  edge: number
  winter: number
  heart: number
  grail: number
  moth: number
  knock: number
}

export interface ResourceState {
  funds: number
  health: number
  maxHealth: number
  sanity: number
  maxSanity: number
}

export interface Item {
  id: string
  name: string
  description: string
  tags: string[]
}

export interface Lore {
  id: string
  name: string
  description: string
  principle: keyof AspectState
  level: number // Added level
}

export interface Rite {
  id: string
  name: string
  description: string
  requirements: string[]
}

export interface Language {
  id: string
  name: string
  description: string
  script: string
}

export interface Character {
  id: string
  name: string
  description: string
  relationship: string
  status: string
  location?: string
  stats?: Partial<AspectState> // Added stats for followers
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
}

export interface GameTime {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

export interface Fact {
  id: string
  name: string
  description: string
}

export interface LocationInfo {
  id: string
  name: string
  description: string
  isUnlocked: boolean
}

export interface GameState {
  resources: ResourceState
  aspects: AspectState
  inventory: Item[]
  lores: Lore[]
  rites: Rite[]
  languages: Language[]
  characters: Character[]
  locations: LocationInfo[] // New: Track known locations
  unlockedDoors: string[]
  stage: string
  location: string
  time: GameTime
  identity: string
  history: ChatMessage[]
  summary: string // New: Narrative summary
  tags: string[]
  story: StoryState
  currentOptions: any[] // Persisted options
  isGameStarted: boolean
  knownFacts: string[] // Deprecated: use facts instead
  facts: Fact[] // New: Store full fact objects
  readBooks: string[]
  masteredLores: string[] // Deprecated: use lores instead
  
  // Player Profile
  playerName: string
  playerGender: 'male' | 'female' | 'other'
  playerAppearance: string
  
  // Anti-Railroading
  turnsSinceLastMajorEvent: number

  // Actions
  setPlayerProfile: (name: string, gender: 'male' | 'female' | 'other', appearance: string) => void
  incrementTurnCounter: () => void
  resetTurnCounter: () => void

  setResources: (resources: Partial<ResourceState>) => void
  modifyResource: (key: keyof ResourceState, amount: number) => void
  setAspects: (aspects: Partial<AspectState>) => void
  addItem: (item: Item) => void
  removeItem: (itemId: string) => void
  addCharacter: (character: Character) => void
  updateCharacter: (id: string, updates: Partial<Character>) => void
  addLocationInfo: (location: LocationInfo) => void // New action
  addRite: (rite: Rite) => void
  addLanguage: (language: Language) => void
  unlockDoor: (door: string) => void
  addTag: (tag: string) => void
  setLocation: (location: string) => void
  setTime: (time: Partial<GameTime>) => void
  advanceTime: (minutes: number) => void
  setIdentity: (identity: string) => void
  addHistory: (message: ChatMessage) => void
  updateSummary: (summary: string) => void
  startGame: () => void
  resetGame: () => void
  returnToTitle: () => void
  
  // Story Actions
  setStoryState: (state: Partial<StoryState>) => void
  completeEvent: (eventId: string) => void
  setOrigin: (origin: StoryState['origin']) => void
  addFact: (fact: string | Fact) => void // Updated to support dynamic facts
  markBookAsRead: (bookId: string) => void
  markLoreAsMastered: (lore: string | Lore) => void // Updated to support dynamic lores
  setCurrentOptions: (options: any[]) => void
  
  // Snapshot Actions
  lastStateSnapshot: any | null
  saveSnapshot: () => void
  restoreSnapshot: () => void
}

const INITIAL_STATE = {
  resources: {
    funds: 0,
    health: 3,
    maxHealth: 3,
    sanity: 3,
    maxSanity: 3
  },
  aspects: {
    lantern: 0,
    forge: 0,
    edge: 0,
    winter: 0,
    heart: 0,
    grail: 0,
    moth: 0,
    knock: 0
  },
  inventory: [],
  lores: [],
  rites: [],
  languages: [],
  characters: [],
  locations: [],
  unlockedDoors: [],
  stage: 'init',
  location: 'London',
  time: {
    year: 1905,
    month: 11,
    day: 2,
    hour: 19,
    minute: 0
  },
  identity: 'Civilian',
  history: [],
  summary: '',
  tags: [],
  isGameStarted: false,
  currentOptions: [],
  knownFacts: [],
  facts: [],
  readBooks: [],
  masteredLores: [],
  lastStateSnapshot: null,
  story: {
    currentChapter: 0,
    completedEvents: [],
    activeEventId: null,
    flags: {},
    origin: null,
    childhood: null,
    uniqueTrait: null
  },
  playerName: 'Unknown',
  playerGender: 'other' as 'male' | 'female' | 'other',
  playerAppearance: 'A figure shrouded in mist.',
  turnsSinceLastMajorEvent: 0
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      
      setPlayerProfile: (name, gender, appearance) => set({ playerName: name, playerGender: gender, playerAppearance: appearance }),
      incrementTurnCounter: () => set((state) => ({ turnsSinceLastMajorEvent: state.turnsSinceLastMajorEvent + 1 })),
      resetTurnCounter: () => set({ turnsSinceLastMajorEvent: 0 }),

      setResources: (res) => set((state) => ({ resources: { ...state.resources, ...res } })),
      modifyResource: (key, amount) => set((state) => ({
        resources: {
          ...state.resources,
          [key]: Math.max(0, (state.resources[key] || 0) + amount)
        }
      })),
      setAspects: (aspects) => set((state) => ({ aspects: { ...state.aspects, ...aspects } })),
      addItem: (item) => set((state) => {
        const existingItemIndex = state.inventory.findIndex(i => i.id === item.id);
        if (existingItemIndex >= 0) {
          // Update existing item
          const newInventory = [...state.inventory];
          newInventory[existingItemIndex] = item;
          return { inventory: newInventory };
        }
        // Add new item
        return { inventory: [...state.inventory, item] };
      }),
      removeItem: (itemId) => set((state) => ({ inventory: state.inventory.filter(i => i.id !== itemId) })),
      addCharacter: (char) => set((state) => ({ characters: [...state.characters, char] })),
      updateCharacter: (id, updates) => set((state) => ({
        characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      addLocationInfo: (loc) => set((state) => {
        const existingIndex = state.locations.findIndex(l => l.id === loc.id);
        if (existingIndex >= 0) {
            const newLocations = [...state.locations];
            newLocations[existingIndex] = { ...newLocations[existingIndex], ...loc };
            return { locations: newLocations };
        }
        return { locations: [...state.locations, loc] };
      }),
      addRite: (rite) => set((state) => ({ rites: [...state.rites, rite] })),
      addLanguage: (lang) => set((state) => ({ languages: [...state.languages, lang] })),
      unlockDoor: (door) => set((state) => ({ unlockedDoors: [...state.unlockedDoors, door] })),
      addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
      setLocation: (loc) => set({ location: loc }),
      setTime: (time) => set((state) => ({ time: { ...state.time, ...time } })),
      advanceTime: (minutes) => set((state) => {
        const newTime = { ...state.time };
        newTime.minute += minutes;
        while (newTime.minute >= 60) {
          newTime.minute -= 60;
          newTime.hour += 1;
        }
        while (newTime.hour >= 24) {
          newTime.hour -= 24;
          newTime.day += 1;
          // Simplified month logic for now (30 days per month)
          if (newTime.day > 30) {
            newTime.day = 1;
            newTime.month += 1;
          }
          if (newTime.month > 12) {
            newTime.month = 1;
            newTime.year += 1;
          }
        }
        return { time: newTime };
      }),
      setIdentity: (identity) => set({ identity }),
      addHistory: (msg) => set((state) => ({ history: [...state.history, msg] })),
      updateSummary: (summary) => set({ summary }),
      startGame: () => set({ isGameStarted: true }),
      resetGame: () => set({ ...INITIAL_STATE }),
      returnToTitle: () => set({ isGameStarted: false }),
      
      setStoryState: (storyUpdate) => set((state) => ({ story: { ...state.story, ...storyUpdate } })),
      completeEvent: (eventId) => set((state) => ({ 
        story: { 
          ...state.story, 
          completedEvents: [...state.story.completedEvents, eventId],
          activeEventId: null
        } 
      })),
      setOrigin: (origin) => set((state) => ({ story: { ...state.story, origin } })),
      addFact: (fact) => set((state) => {
        const factId = typeof fact === 'string' ? fact : fact.id;
        // Check if already known
        if (state.knownFacts.includes(factId)) return state;
        
        // If it's a full object, add to facts array
        const newFacts = typeof fact === 'string' ? state.facts : [...state.facts, fact];
        
        return { 
          knownFacts: [...state.knownFacts, factId],
          facts: newFacts
        };
      }),
      markBookAsRead: (bookId) => set((state) => {
        if (state.readBooks.includes(bookId)) return state;
        return { readBooks: [...state.readBooks, bookId] };
      }),
      markLoreAsMastered: (lore) => set((state) => {
        const loreId = typeof lore === 'string' ? lore : lore.id;
        if (state.masteredLores.includes(loreId)) return state;
        
        const newLores = typeof lore === 'string' ? state.lores : [...state.lores, lore];
        
        return { 
          masteredLores: [...state.masteredLores, loreId],
          lores: newLores
        };
      }),
      setCurrentOptions: (options) => set({ currentOptions: options }),

      saveSnapshot: () => set((state) => {
        const snapshot = {
          resources: state.resources,
          aspects: state.aspects,
          inventory: state.inventory,
          lores: state.lores,
          rites: state.rites,
          languages: state.languages,
          characters: state.characters,
          locations: state.locations,
          unlockedDoors: state.unlockedDoors,
          stage: state.stage,
          location: state.location,
          time: state.time,
          identity: state.identity,
          history: state.history,
          summary: state.summary,
          tags: state.tags,
          story: state.story,
          currentOptions: state.currentOptions,
          isGameStarted: state.isGameStarted,
          knownFacts: state.knownFacts,
          facts: state.facts,
          readBooks: state.readBooks,
          masteredLores: state.masteredLores
        };
        return { lastStateSnapshot: JSON.parse(JSON.stringify(snapshot)) };
      }),

      restoreSnapshot: () => set((state) => {
        if (!state.lastStateSnapshot) return state;
        return { ...state.lastStateSnapshot, lastStateSnapshot: null };
      })
    }),
    {
      name: 'pale-notes-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // Exclude isGameStarted so we always land on StartScreen
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isGameStarted, ...rest } = state
        return rest
      }
    }
  )
)
