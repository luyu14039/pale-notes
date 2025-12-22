import { Item } from '@/stores/game';

export const ITEM_REGISTRY: Record<string, Omit<Item, 'id'>> = {
  'book_dream_v1': {
    name: '《梦境的解析：禁忌版》',
    description: '一本散发着霉味的小册子，记录了关于林地与漫宿的呓语。',
    tags: ['tool', 'moth', 'lore']
  },
  'tool_knife': {
    name: '生锈的手术刀',
    description: '边缘依然锋利，似乎沾染过某种不可名状的液体。',
    tags: ['tool', 'edge', 'weapon']
  },
  'curio_watch': {
    name: '停滞的怀表',
    description: '指针永远停在午夜零点，表面微热。',
    tags: ['curio', 'lantern']
  },
  'ingredient_blood': {
    name: '一瓶陈血',
    description: '暗红色的液体，在瓶中缓缓流动，仿佛有生命一般。',
    tags: ['ingredient', 'grail']
  },
  'mission_file_skin_of_night': {
    name: '任务档案：《夜之皮》',
    description: '防剿局的标准任务文件夹。里面有一张卡片和一串钥匙。目标是回收名为《夜之皮》的物品。',
    tags: ['tool', 'bureau', 'mission']
  },
  // 书籍
  'book_lantern_1': {
    name: '《守夜人的笔记》',
    description: '一本字迹潦草的笔记，记录了如何保持清醒以及光辉的几何学。',
    tags: ['book', 'lantern', 'lore_source']
  },
  'book_forge_1': {
    name: '《炼金术入门：火与变》',
    description: '封面微烫，讲述了物质形态改变的基础原理。',
    tags: ['book', 'forge', 'lore_source']
  },
  'book_edge_1': {
    name: '《决斗者手册》',
    description: '不仅教你如何使用剑，更教你如何利用痛苦。',
    tags: ['book', 'edge', 'lore_source']
  },
  'book_winter_1': {
    name: '《寂静之书》',
    description: '阅读它会让你感到寒冷，书中记载了关于死亡和终结的诗歌。',
    tags: ['book', 'winter', 'lore_source']
  },
  'book_heart_1': {
    name: '《无休之舞》',
    description: '记录了某种永不停歇的鼓点节奏，能以此保护生命。',
    tags: ['book', 'heart', 'lore_source']
  },
  'book_grail_1': {
    name: '《饥饿的盛宴》',
    description: '书页上有不明的污渍，讲述了感官的极致体验。',
    tags: ['book', 'grail', 'lore_source']
  },
  'book_moth_1': {
    name: '《脱皮之蛇》',
    description: '关于混乱与自然的寓言，读起来让人头晕目眩。',
    tags: ['book', 'moth', 'lore_source']
  },
  'book_knock_1': {
    name: '《门扉图鉴》',
    description: '描绘了世界上各种奇怪的门，以及如何打开它们。',
    tags: ['book', 'knock', 'lore_source']
  },
  // 密传
  'lore_winter_1': {
    name: '密传：白杨的哀歌',
    description: '关于寂静与终结的低语。你知道了如何让事物保持沉默。',
    tags: ['lore', 'winter', 'level_1']
  },
  'lore_moth_1': {
    name: '密传：飞蛾的扑腾',
    description: '关于混乱与寻找光源的本能。你知道了如何剪去理智的束缚。',
    tags: ['lore', 'moth', 'level_1']
  }
};

export function getItemTemplate(id: string): Item | null {
  const template = ITEM_REGISTRY[id];
  if (!template) return null;
  return { id, ...template };
}
