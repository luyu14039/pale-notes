import { StoryEvent, StoryOption, StoryTrigger } from '@/types/story';
import { STORY_EVENTS } from '@/data/storyEvents';
import { GameState } from '@/stores/game';
import { getItemTemplate } from '@/constants/items';

export class StorySystem {
  private events: Map<string, StoryEvent>;

  constructor() {
    this.events = new Map(STORY_EVENTS.map(e => [e.id, e]));
  }

  public getEvent(id: string): StoryEvent | undefined {
    return this.events.get(id);
  }

  public findTriggeredEvent(gameState: GameState): StoryEvent | null {
    // Priority: 
    // 1. Active Event (if any) - handled by UI usually, but good to check
    // 2. Events triggered by current chapter start
    // 3. Events triggered by specific conditions (tags, resources)
    
    // Filter out completed events
    const availableEvents = STORY_EVENTS.filter(e => 
      !gameState.story.completedEvents.includes(e.id)
    );

    for (const event of availableEvents) {
      if (this.checkTriggers(event.triggers, gameState)) {
        return event;
      }
    }

    return null;
  }

  public isOptionAvailable(option: StoryOption, gameState: GameState): boolean {
    if (!option.requires || option.requires.length === 0) return true;
    return this.checkTriggers(option.requires, gameState);
  }

  public checkTriggers(triggers: StoryTrigger[], gameState: GameState): boolean {
    if (!triggers || triggers.length === 0) return false;

    return triggers.every(trigger => {
      switch (trigger.type) {
        case 'chapter_start':
          return gameState.story.currentChapter === trigger.chapterId;
        case 'origin_is':
          return gameState.story.origin === trigger.origin;
        case 'has_tag':
          return gameState.tags.includes(trigger.tag);
        case 'resource_threshold':
          const resVal = gameState.resources[trigger.resource as keyof typeof gameState.resources] || 0;
          switch (trigger.operator) {
            case '>': return resVal > trigger.value;
            case '<': return resVal < trigger.value;
            case '>=': return resVal >= trigger.value;
            case '<=': return resVal <= trigger.value;
            default: return false;
          }
        case 'aspect_threshold':
          const aspectVal = gameState.aspects[trigger.aspect as keyof typeof gameState.aspects] || 0;
          switch (trigger.operator) {
            case '>': return aspectVal > trigger.value;
            case '<': return aspectVal < trigger.value;
            case '>=': return aspectVal >= trigger.value;
            case '<=': return aspectVal <= trigger.value;
            default: return false;
          }
        case 'has_item':
          return gameState.inventory.some(i => i.id === trigger.itemId);
        case 'has_lore':
          return gameState.lores.some(l => l.id === trigger.loreId);
        case 'has_fact':
          return gameState.knownFacts.includes(trigger.factId);
        case 'location_enter':
          return gameState.location === trigger.locationId;
        default:
          return false;
      }
    });
  }

  public processEffects(effects: any[], store: GameState) {
    if (!effects) return;

    effects.forEach(effect => {
      switch (effect.type) {
        case 'SET_ORIGIN':
          store.setOrigin(effect.value);
          break;
        case 'MODIFY_RESOURCE':
          store.modifyResource(effect.target, effect.value);
          break;
        case 'MODIFY_ASPECT':
          store.setAspects({ [effect.target]: (store.aspects[effect.target as keyof typeof store.aspects] || 0) + effect.value });
          break;
        case 'UNLOCK_LOCATION':
          store.setLocation(effect.value); 
          break;
        case 'ADD_TAG':
          store.addTag(effect.value);
          break;
        case 'ADD_FACT':
          store.addFact(effect.value);
          break;
        case 'ADD_ITEM':
          if (typeof effect.value === 'string') {
            const item = getItemTemplate(effect.value);
            if (item) store.addItem(item);
          } else if (typeof effect.value === 'object') {
             store.addItem(effect.value);
          }
          break;
        case 'REMOVE_ITEM':
          store.removeItem(effect.value);
          break;
        case 'CHAPTER_COMPLETE':
          store.setStoryState({ currentChapter: effect.value + 1 });
          break;
        case 'SET_CHAPTER':
          store.setStoryState({ currentChapter: effect.value });
          break;
        case 'SET_IDENTITY':
          store.setIdentity(effect.value);
          break;
        case 'ADD_CHARACTER':
          store.addCharacter(effect.value);
          break;
        case 'UPDATE_CHARACTER':
          store.updateCharacter(effect.value.id, effect.value.updates);
          break;
        case 'ADD_RITE':
          store.addRite(effect.value);
          break;
        case 'ADD_LORE':
          // Assuming getItemTemplate can also retrieve Lore or we need a getLoreTemplate
          // But wait, Lore is usually just an object in the store. 
          // Let's check if we have a template for Lore. 
          // In items.ts we defined 'lore_winter_1' in ITEM_REGISTRY.
          // So we can use getItemTemplate but we need to cast it or handle it.
          // Actually, store.addLore expects a Lore object.
          const loreTemplate = getItemTemplate(effect.value);
          if (loreTemplate) {
             // Convert Item to Lore structure if needed, or just add it if structures are compatible
             // Let's check store.ts for Lore interface.
             // Lore: { id, name, description, principle, level }
             // Item: { id, name, description, tags }
             // They are different. We need to map them or update getItemTemplate to return Lore.
             // For now, let's assume the 'tags' in Item contain the principle and level info 
             // or we just add it as an item if it's in the inventory?
             // No, Lore should be in store.lores.
             
             // Let's manually construct Lore from the template for now
             const principle = loreTemplate.tags.find(t => ['lantern','forge','edge','winter','heart','grail','moth','knock'].includes(t)) || 'neutral';
             const levelTag = loreTemplate.tags.find(t => t.startsWith('level_'));
             const level = levelTag ? parseInt(levelTag.split('_')[1]) : 1;
             
             store.markLoreAsMastered({
               id: loreTemplate.id,
               name: loreTemplate.name,
               description: loreTemplate.description,
               principle: principle as any,
               level: level
             });
          }
          break;
        case 'ADD_LANGUAGE':
          store.addLanguage(effect.value);
          break;
      }
    });
  }
}

export const storySystem = new StorySystem();
