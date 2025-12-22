
export const CLUES: Record<string, { name: string; description: string }> = {
  'witnessed_faceless_entity': {
    name: '目击无面之物',
    description: '你在迷雾中瞥见了一个没有面孔的身影，那绝非人类所能拥有的形态。'
  },
  'acquired_mysterious_tarot_card': {
    name: '神秘塔罗牌',
    description: '一张不知何时出现在你口袋里的塔罗牌，牌面绘制着令人不安的景象。'
  },
  // Add more clues here as needed
};

export const LORES: Record<string, { name: string; description: string; aspect: string }> = {
  'tarot_ominous': {
    name: '凶兆塔罗',
    description: '这张牌预示着某种不可避免的厄运，或者是一个危险的机遇。',
    aspect: 'moth'
  },
  // Add more lores here as needed
};

export const getClue = (id: string) => {
  const clue = CLUES[id];
  return clue ? { id, ...clue } : null;
};

export const getLore = (id: string) => {
  const lore = LORES[id];
  return lore ? { id, ...lore } : null;
};
