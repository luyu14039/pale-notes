import { useState } from 'react';
import { useGameStore, GameState } from '@/stores/game';
import { useUIStore } from '@/stores/ui';
import { useMetaStore } from '@/stores/meta';
import { deepseekChat, DeepSeekChatMessage } from '@/api/deepseek';
import { NARRATIVE_PROMPT, DATA_ANALYSIS_PROMPT, PRINCIPLE_STYLES, CHAPTER_GUIDES } from '@/constants/prompts';
import { getItemTemplate } from '@/constants/items';
import { storySystem } from '@/systems/StorySystem';

interface GameEngineReturn {
  handleAction: (actionId: string, actionText: string) => Promise<void>;
  retryLastAction: () => Promise<void>; // New retry function
  isProcessing: boolean;
  isAnalyzingData: boolean;
  lastError: string | null;
  currentOptions: any[];
  streamingContent: string | null;
  streamingReasoning: string | null;
  debugDataInput: string | null;
  debugDataOutput: string | null;
}

export function useGameEngine(): GameEngineReturn {
  // We use the hook for reactive updates in the UI
  // @ts-ignore
  const store = useGameStore();
  
  // Hardcoded API key as requested to resolve authentication issues
  const apiKey = 'sk-c426a57657a142cd9d2bcaf7574de0f1';
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzingData, setIsAnalyzingData] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [streamingReasoning, setStreamingReasoning] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  
  // Retry state
  const [lastAction, setLastAction] = useState<{id: string, text: string} | null>(null);
  
  // Debug states
  const [debugDataInput, setDebugDataInput] = useState<string | null>(null);
  const [debugDataOutput, setDebugDataOutput] = useState<string | null>(null);

  const getDominantAspect = (aspects: any) => {
    let max = 0;
    let dominant = 'neutral';
    for (const key in aspects) {
      const value = aspects[key];
      if (value > max) {
        max = value; 
        dominant = key;
      }
    }
    return max > 0 ? dominant : 'neutral';
  };

  const getChapterKey = (chapterNum: number) => {
    if (chapterNum === 0) return 'prologue';
    return `chapter_${chapterNum}`;
  };

  // Helper to build the JSON context for the LLM
  const buildContext = (actionText: string, currentState: GameState, storyContext?: string, requiredOptions?: any[], goalOptions?: any[]) => {
    const { resources, aspects, inventory, location, tags, story, knownFacts, readBooks, masteredLores, rites, languages, characters, unlockedDoors, time, identity, summary, playerName, playerGender, playerAppearance, turnsSinceLastMajorEvent } = currentState;
    
    const dominantAspect = getDominantAspect(aspects);
    const chapterKey = getChapterKey(story.currentChapter);
    
    return JSON.stringify({
      playerState: {
        profile: {
          name: playerName,
          gender: playerGender,
          appearance: playerAppearance
        },
        resources,
        aspects,
        dominantPrinciple: dominantAspect,
        inventory: inventory.map(i => i.id),
        tags,
        story: {
          chapter: story.currentChapter,
          origin: story.origin,
          activeEventId: story.activeEventId
        },
        knownFacts,
        readBooks,
        masteredLores,
        rites,
        languages,
        relationships: characters,
        unlockedDoors
      },
      worldState: {
        location,
        time,
        identity,
        turnsSinceLastMajorEvent // Inject turn counter
      },
      userAction: actionText,
      storyContext: storyContext || undefined,
      requiredOptions: requiredOptions || undefined,
      goalOptions: goalOptions || undefined,
      principleGuide: PRINCIPLE_STYLES[dominantAspect as keyof typeof PRINCIPLE_STYLES],
      chapterGuide: CHAPTER_GUIDES[chapterKey as keyof typeof CHAPTER_GUIDES],
      previousSummary: summary // Inject summary into context
    });
  };

  const parseResponse = (content: string) => {
    let jsonString = content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }
    
    // Sanitize smart quotes which AI sometimes produces
    jsonString = jsonString.replace(/[\u201C\u201D]/g, '"');
    
    // Remove any trailing commas in arrays or objects which are invalid in JSON but common in JS
    jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');

    // Aggressive Line-by-Line Sanitizer for unescaped quotes
    // This fixes cases where AI outputs: "key": "some "quoted" text",
    const lines = jsonString.split('\n');
    const sanitizedLines = lines.map(line => {
      // Match pattern: "key": "value", (with optional comma)
      // We capture the prefix, the content inside quotes, and the suffix
      const match = line.match(/^(\s*"[\w\d_]+"\s*:\s*)"(.*)"(,?)$/);
      if (match) {
        const prefix = match[1];
        const content = match[2];
        const suffix = match[3];
        
        // If the content contains double quotes, it's likely an error or unescaped.
        // We replace them with single quotes to ensure valid JSON.
        // We also handle already escaped quotes to avoid creating invalid escape sequences like \'
        if (content.includes('"')) {
           const safeContent = content
             .replace(/\\"/g, "'") // Replace \" with '
             .replace(/"/g, "'");  // Replace remaining " with '
           return `${prefix}"${safeContent}"${suffix}`;
        }
      }
      return line;
    });
    jsonString = sanitizedLines.join('\n');

    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      console.log("Failed JSON String:", jsonString);
      // Fallback: try to find the last valid closing brace if the JSON was truncated
      const lastBrace = jsonString.lastIndexOf('}');
      if (lastBrace !== -1) {
         try {
            return JSON.parse(jsonString.substring(0, lastBrace + 1));
         } catch (e2) {
            throw e; // Throw original error if fallback fails
         }
      }
      throw e;
    }
  };

  const handleStateChanges = (changes: any[]) => {
    if (!changes) return;
    
    // We use the store actions from the hook, which are stable
    const { 
        modifyResource, setAspects, addTag, setLocation, addItem, removeItem, 
        addFact, addCharacter, updateCharacter, addRite, addLanguage, 
        markBookAsRead, markLoreAsMastered, setStoryState, advanceTime, setIdentity,
        addHistory 
    } = useGameStore.getState();

    const summaryLines: string[] = [];

    changes.forEach(change => {
      console.log("Processing change:", change);
      switch (change.type) {
        case 'MODIFY_RESOURCE':
          modifyResource(change.target, change.value);
          summaryLines.push(`${change.target} ${change.value > 0 ? '+' : ''}${change.value}`);
          break;
        case 'MODIFY_ASPECT': {
          const currentAspects = useGameStore.getState().aspects;
          const targetAspect = change.target as keyof typeof currentAspects;
          const newValue = (currentAspects[targetAspect] || 0) + change.value;
          setAspects({ [targetAspect]: newValue });
          summaryLines.push(`性相: ${change.target} ${change.value > 0 ? '+' : ''}${change.value}`);
          break;
        }
        case 'ADD_TAG':
          addTag(change.target);
          break;
        case 'UNLOCK_LOCATION':
          setLocation(change.target);
          summaryLines.push(`解锁地点: ${change.target}`);
          break;
        case 'ADD_ITEM': {
          let itemName = change.target;
          if (change.payload) {
             addItem({
               id: change.payload.id,
               name: change.payload.name,
               description: change.payload.description,
               tags: change.payload.tags || []
             });
             itemName = change.payload.name;
          } else {
            let item = getItemTemplate(change.target);
            if (!item) {
              console.warn(`Item ${change.target} not found in registry, creating fallback.`);
              item = {
                  id: change.target,
                  name: change.target.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                  description: "一件未知的物品，散发着微弱的气息。",
                  tags: ['unknown']
              };
            }
            addItem(item);
            itemName = item.name;
          }
          summaryLines.push(`获得物品: ${itemName}`);
          break;
        }
        case 'REMOVE_ITEM':
          removeItem(change.target);
          summaryLines.push(`失去物品: ${change.target}`);
          break;
        case 'ADD_FACT': 
          let factName = change.target;
          if (change.payload) {
            addFact({
              id: change.payload.id,
              name: change.payload.name,
              description: change.payload.description
            });
            factName = change.payload.name;
          } else {
            addFact(change.target);
          }
          summaryLines.push(`获得线索: ${factName}`);
          break;
        case 'ADD_CHARACTER':
          addCharacter(change.payload);
          summaryLines.push(`结识人物: ${change.payload.name}`);
          break;
        case 'UPDATE_CHARACTER':
          updateCharacter(change.payload.id, change.payload.updates);
          summaryLines.push(`人物更新: ${change.payload.id}`);
          break;
        case 'ADD_LOCATION':
          // @ts-ignore
          useGameStore.getState().addLocationInfo(change.payload);
          summaryLines.push(`地点记录: ${change.payload.name}`);
          break;
        case 'ADD_RITE':
          addRite(change.payload);
          summaryLines.push(`习得仪式: ${change.payload.name}`);
          break;
        case 'ADD_LANGUAGE':
          addLanguage(change.payload);
          summaryLines.push(`习得语言: ${change.payload.name}`);
          break;
        case 'MARK_BOOK_READ':
          markBookAsRead(change.target);
          summaryLines.push(`阅读书籍: ${change.target}`);
          break;
        case 'MARK_LORE_MASTERED':
          let loreName = change.target;
          if (change.payload) {
             markLoreAsMastered({
               id: change.payload.id,
               name: change.payload.name,
               description: change.payload.description,
               principle: change.payload.aspect as any,
               level: 1
             });
             loreName = change.payload.name;
          } else {
             markLoreAsMastered(change.target);
          }
          summaryLines.push(`掌握密传: ${loreName}`);
          break;
        case 'SET_CHAPTER':
          const oldChapter = useGameStore.getState().story.currentChapter;
          const newChapter = change.value;
          setStoryState({ currentChapter: newChapter });
          
          // Meta Updates
          useMetaStore.getState().updateMaxChapter(newChapter);
          
          // Check for Origin Completion (Prologue -> Chapter 1)
          if (oldChapter === 0 && newChapter === 1) {
             const currentOrigin = useGameStore.getState().story.origin;
             if (currentOrigin) {
               useMetaStore.getState().markOriginComplete(currentOrigin);
               summaryLines.push(`序章完成: ${currentOrigin}`);
             }
          }

          summaryLines.push(`章节进度更新`);
          break;
        case 'MODIFY_TIME':
          if (change.value) advanceTime(change.value);
          break;
        case 'SET_IDENTITY':
          setIdentity(change.target);
          summaryLines.push(`身份变更: ${change.target}`);
          break;
      }
    });

    // Turn Counter Logic
    // We need to access the current options from the store to check if it was a critical node
    const currentOptions = useGameStore.getState().currentOptions;
    
    if (currentOptions && currentOptions.length === 1) {
       useGameStore.getState().resetTurnCounter();
    } else {
       useGameStore.getState().incrementTurnCounter();
    }

    if (summaryLines.length > 0) {
      addHistory({
        role: 'system',
        content: `> **状态变更**: \n${summaryLines.join('\n')}`,
        timestamp: Date.now()
      });
    }
  };

  // Summarization Logic
  const summarizeHistory = async () => {
    const { history, summary, updateSummary } = useGameStore.getState();
    if (history.length < 10) return;

    console.log("Summarizing history...");
    // @ts-ignore
    const recentHistory = history.slice(-10);
    const olderHistory = history.slice(0, -10);
    
    const summaryContext = summary ? `Previous Summary: ${summary}\n` : '';
    const textToSummarize = olderHistory.map(h => `${h.role}: ${h.content}`).join('\n');

    const summaryPrompt = `
      You are a narrative summarizer for a text adventure game.
      Summarize the following story events into a concise paragraph (in Chinese).
      Focus on key decisions, acquired knowledge, and current status.
      Keep it under 200 words.
      
      ${summaryContext}
      
      Recent Events to Append:
      ${textToSummarize}
    `;

    try {
      const response = await deepseekChat({
        messages: [{ role: 'user', content: summaryPrompt }],
        apiKey,
        stream: false
      });
      
      // @ts-ignore
      const newSummary = response.choices[0].message.content;
      console.log("New Summary:", newSummary);
      updateSummary(newSummary);
    } catch (e) {
      console.error("Summarization failed", e);
    }
  };

  // Core function to interact with LLM
  const processTurn = async (actionText: string, storyContext?: string, requiredOptions?: any[], goalOptions?: any[]) => {
    if (!apiKey) {
      setLastError("API Key is missing");
      return;
    }

    setIsProcessing(true);
    setLastError(null);
    setStreamingContent("");
    setStreamingReasoning("");

    // Trigger summarization every 5 turns
    if (turnCount > 0 && turnCount % 5 === 0) {
      summarizeHistory();
    }
    setTurnCount(prev => prev + 1);

    try {
      // --- STEP 0: CHECK FOR STORY EVENTS ---
      const currentStore = useGameStore.getState();
      let activeEvent = null;
      let currentStoryContext = storyContext;
      let currentRequiredOptions = requiredOptions;
      let currentGoalOptions = goalOptions;

      // Check if we are already in an active event
      if (currentStore.story.activeEventId) {
        activeEvent = storySystem.getEvent(currentStore.story.activeEventId);
      } 
      
      // If not, check if any new event is triggered
      if (!activeEvent) {
        activeEvent = storySystem.findTriggeredEvent(currentStore);
        if (activeEvent) {
          console.log("Triggered Event:", activeEvent.id);
          // Set active event in store
          currentStore.setStoryState({ activeEventId: activeEvent.id });
          
          // Meta Update: Record Key Event
          useMetaStore.getState().addKeyEvent(activeEvent.id);

          // Process onEnter effects immediately
          if (activeEvent.onEnter) {
            storySystem.processEffects(activeEvent.onEnter, currentStore);
          }
        }
      }

      // If we have an active event, inject its content
      if (activeEvent) {
        currentStoryContext = `[系统事件触发: ${activeEvent.title}]\n${activeEvent.text}`;
        
        // If the event has options, we pass them as goalOptions (Hybrid Mode)
        // This ensures the story options are present, but allows AI to generate flavor options
        if (activeEvent.options && activeEvent.options.length > 0) {
          const eventOptions = activeEvent.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            style: 'neutral'
          }));
          
          currentGoalOptions = currentGoalOptions ? [...currentGoalOptions, ...eventOptions] : eventOptions;
        }
      } else {
        // If NO active event, inject completed events context to prevent repetition
        const completedEvents = currentStore.story.completedEvents;
        if (completedEvents.length > 0) {
            const completedTitles = completedEvents.map(id => storySystem.getEvent(id)?.title).filter(Boolean).join(', ');
            currentStoryContext = (currentStoryContext || '') + `\n[STORY STATUS]: The player has already completed the following events: ${completedTitles}. Do NOT suggest options that repeat these events (e.g. if they met H, don't ask them to meet H again unless new context arises). Focus on new exploration.`;
        }
      }

      // --- STEP 1: NARRATIVE GENERATION ---
      useUIStore.getState().setStatusMessage("Generating narrative...");
      // Re-fetch store state to ensure we have the latest (e.g. after onEnter effects)
      const updatedStore = useGameStore.getState();
      const context = buildContext(actionText, updatedStore, currentStoryContext, currentRequiredOptions, currentGoalOptions);
      
      console.log("--- [Narrative AI Input] ---");
      console.log(context);

      const systemMessage: DeepSeekChatMessage = { role: 'system', content: NARRATIVE_PROMPT };
      const summaryMessage: DeepSeekChatMessage | null = updatedStore.summary ? { role: 'system', content: `[Previous Story Summary]: ${updatedStore.summary}` } : null;
      
      const recentHistoryMessages: DeepSeekChatMessage[] = updatedStore.history.slice(-10).map(h => ({ role: h.role as 'user' | 'assistant', content: h.content }));
      
      const narrativeMessages: DeepSeekChatMessage[] = [
        systemMessage,
        ...(summaryMessage ? [summaryMessage] : []),
        ...recentHistoryMessages,
        { role: 'user', content: context }
      ];

      const narrativeResponse = await deepseekChat({
        messages: narrativeMessages,
        apiKey,
        stream: true
      });

      // Handle Streaming for Narrative
      const reader = (narrativeResponse as Response).body?.getReader();
      if (!reader) throw new Error("Failed to get stream reader");

      const decoder = new TextDecoder();
      let fullNarrative = "";
      let fullReasoning = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const delta = data.choices[0].delta;
              
              if (delta.reasoning_content) {
                fullReasoning += delta.reasoning_content;
                setStreamingReasoning(fullReasoning);
              }
              
              if (delta.content) {
                fullNarrative += delta.content;
                setStreamingContent(fullNarrative);
              }
            } catch (e) {
              console.error("Error parsing stream chunk", e);
            }
          }
        }
      }
      
      console.log("--- [Narrative AI Output] ---");
      console.log(fullNarrative);

      // Add narrative to history
      updatedStore.addHistory({ role: 'assistant', content: fullNarrative, timestamp: Date.now() });
      setStreamingContent(null);

      // --- STEP 2: DATA ANALYSIS ---
      useUIStore.getState().setStatusMessage("Analyzing world state...");
      const dataAnalysisContext = JSON.stringify({
        userAction: actionText,
        narrativeOutput: fullNarrative,
        storyContext: currentStoryContext, // Pass the story context (with instructions) to Data AI
        requiredOptions: currentRequiredOptions,
        goalOptions: currentGoalOptions,
        currentState: {
            resources: updatedStore.resources,
            aspects: updatedStore.aspects,
            inventory: updatedStore.inventory,
            facts: updatedStore.facts,
            story: updatedStore.story,
            characters: updatedStore.characters,
            location: updatedStore.location,
            time: updatedStore.time
        }
      });

      setDebugDataInput(dataAnalysisContext);

      const dataResponse = await deepseekChat({
        messages: [
          { role: 'system', content: DATA_ANALYSIS_PROMPT },
          { role: 'user', content: dataAnalysisContext }
        ],
        apiKey,
        stream: false
      });

      // @ts-ignore
      const dataContent = dataResponse.choices[0].message.content;
      console.log("--- [Data AI Output] ---");
      console.log(dataContent);
      setDebugDataOutput(dataContent);

      try {
        const parsedData = parseResponse(dataContent);
        handleStateChanges(parsedData.stateChanges);
        store.setCurrentOptions(parsedData.options || []);
      } catch (e) {
        console.error("Failed to parse Data AI response", e);
        setLastError("Failed to parse game state updates.");
      }
      
      setIsAnalyzingData(false);

    } catch (error: any) {
      console.error("Game Engine Error:", error);
      setLastError(error.message || "An unknown error occurred.");
      setIsAnalyzingData(false);
    } finally {
      setIsProcessing(false);
      useUIStore.getState().setStatusMessage(null);
    }
  };

  const handleAction = async (actionId: string, actionText: string) => {
    const currentStore = useGameStore.getState();
    
    // Save snapshot before any changes
    currentStore.saveSnapshot();
    useUIStore.getState().setStatusMessage("Processing action...");
    
    // Check if we are in an active event and the user selected an event option
    if (currentStore.story.activeEventId) {
      const event = storySystem.getEvent(currentStore.story.activeEventId);
      if (event && event.options) {
        const selectedOption = event.options.find(o => o.id === actionId);
        if (selectedOption) {
          console.log("Selected Event Option:", selectedOption.id);
          
          // 1. Process Effects
          if (selectedOption.effects) {
            storySystem.processEffects(selectedOption.effects, currentStore);
          }
          
          // 2. Complete current event
          currentStore.completeEvent(currentStore.story.activeEventId);
          
          // 3. Handle Next Event
          if (selectedOption.nextEventId) {
            currentStore.setStoryState({ activeEventId: selectedOption.nextEventId });
          } else {
            currentStore.setStoryState({ activeEventId: null });
          }
        }
      }
    }

    // NEW: Handle Aspect Updates from Option Style directly
    const selectedOption = currentStore.currentOptions.find(o => o.id === actionId);
    if (selectedOption && selectedOption.style) {
        const style = selectedOption.style;
        const validAspects = ['lantern', 'forge', 'edge', 'winter', 'heart', 'grail', 'moth', 'knock'];
        
        if (validAspects.includes(style)) {
            console.log(`[Frontend] Updating aspect ${style} +1 from option selection`);
            const currentAspects = currentStore.aspects;
            currentStore.setAspects({
                [style]: (currentAspects[style as keyof typeof currentAspects] || 0) + 1
            });
        }
    }

    // Save for retry
    setLastAction({ id: actionId, text: actionText });

    return processTurn(actionText);
  };

  const retryLastAction = async () => {
    if (!lastAction) return;
    
    const currentStore = useGameStore.getState();
    
    // Restore state from snapshot (this reverts history, items, aspects, etc.)
    if (currentStore.lastStateSnapshot) {
        console.log("Restoring snapshot for retry...");
        currentStore.restoreSnapshot();
    } else {
        console.warn("No snapshot available for retry. Falling back to simple history pop.");
        // Fallback: Remove the last history entry if it's an assistant message
        const newHistory = [...currentStore.history];
        if (newHistory.length > 0 && newHistory[newHistory.length - 1].role === 'assistant') {
            // We can't easily revert state changes without a snapshot system.
            // But since we just added snapshot support, this fallback is just for legacy/edge cases.
        }
    }
    
    useUIStore.getState().setStatusMessage("Regenerating...");
    // We call handleAction again to ensure all side effects (aspect updates, event logic) are re-applied correctly
    // after the state rollback.
    return handleAction(lastAction.id, lastAction.text);
  };

  return {
    handleAction,
    retryLastAction,
    isProcessing,
    isAnalyzingData,
    lastError,
    currentOptions: store.currentOptions,
    streamingContent,
    streamingReasoning,
    debugDataInput,
    debugDataOutput
  };
}
