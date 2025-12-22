export type StoryTrigger = 
  | { type: 'chapter_start'; chapterId: number }
  | { type: 'resource_threshold'; resource: string; value: number; operator: '>' | '<' | '>=' | '<=' }
  | { type: 'aspect_threshold'; aspect: string; value: number; operator: '>' | '<' | '>=' | '<=' }
  | { type: 'has_tag'; tag: string }
  | { type: 'has_item'; itemId: string }
  | { type: 'has_lore'; loreId: string }
  | { type: 'has_fact'; factId: string }
  | { type: 'location_enter'; locationId: string }
  | { type: 'origin_is'; origin: string };

export interface StoryOption {
  id: string;
  text: string;
  style?: 'lantern' | 'forge' | 'edge' | 'winter' | 'heart' | 'grail' | 'moth' | 'knock' | 'neutral';
  requires?: StoryTrigger[];
  effects?: any[]; // JSON state changes
  nextEventId?: string; // If this choice leads directly to another event
}

export interface StoryEvent {
  id: string;
  title?: string;
  text: string; // Can be a prompt for the LLM or static text
  isStatic: boolean; // If true, use text directly. If false, use text as prompt.
  options: StoryOption[];
  triggers: StoryTrigger[];
  onEnter?: any[]; // Effects when event starts
  chapterId?: number;
  principleGuide?: string; // Optional guide for LLM tone (e.g., "lantern")
}

export interface StoryState {
  currentChapter: number;
  completedEvents: string[];
  activeEventId: string | null;
  flags: Record<string, boolean>;
  origin: 'rich' | 'doctor' | 'detective' | null;
  childhood: string | null;
  uniqueTrait: string | null;
}
