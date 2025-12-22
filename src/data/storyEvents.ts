import { StoryEvent } from '@/types/story';

export const STORY_EVENTS: StoryEvent[] = [
  {
    id: 'prologue_rich',
    title: '序章：家族的余烬',
    text: `[SCENE SETUP]
地点：家族庄园的豪华宴会厅。
时间：1900年代初的某个深夜。
人物：你（家族继承人），家族长辈们。

[KEY ACTIONS]
1. 描述宴会的奢华，但气氛压抑。
2. 长辈们突然停止进食，开始用一种死去的语言（古拉丁语或更古老的语言）吟唱。
3. 他们的身体开始自燃，火焰呈现出不自然的颜色（如苍白或深紫）。
4. 庄园迅速被大火吞噬，你惊恐地逃离。
5. 你手中紧紧攥着一本从火场中抢救出来的书，书皮冰冷刺骨。

[ATMOSPHERE]
疯狂、毁灭、不可理解的恐怖。`,
    isStatic: true,
    triggers: [
      { type: 'chapter_start', chapterId: 0 },
      { type: 'origin_is', origin: 'rich' }
    ],
    options: [
      {
        id: 'rich_survive',
        text: '我逃离了火海，却无法逃离那光芒的记忆。',
        nextEventId: 'recruitment_interrogation'
      }
    ]
  },
  {
    id: 'prologue_doctor',
    title: '序章：跳动的真菌',
    text: `[SCENE SETUP]
地点：伦敦医院的地下停尸房。
时间：深夜。
人物：你（理性医师），一具无名尸体。

[KEY ACTIONS]
1. 你正在进行解剖，试图查明死因。
2. 切开腹腔后，发现没有内脏，只有充满了胸腹腔的发光真菌。
3. 真菌在有节奏地搏动，仿佛在呼吸。
4. 尸体突然睁开眼睛（或者只是坐起），撞破墙壁逃入夜色。
5. 你手里拿着沾满发光粘液的手术刀，呆立在原地。

[ATMOSPHERE]
临床的冷漠被打破，理性的崩塌，生理性厌恶。`,
    isStatic: true,
    triggers: [
      { type: 'chapter_start', chapterId: 0 },
      { type: 'origin_is', origin: 'doctor' }
    ],
    options: [
      {
        id: 'doctor_witness',
        text: '科学无法解释这一切，但我必须找到答案。',
        nextEventId: 'recruitment_interrogation'
      }
    ]
  },
  {
    id: 'prologue_detective',
    title: '序章：无面人的塔罗牌',
    text: `[SCENE SETUP]
地点：白教堂区的下水道深处。
时间：追捕连环杀手的雨夜。
人物：你（警探），连环杀手（无面人）。

[KEY ACTIONS]
1. 你终于在死胡同里堵住了那个连环杀手。
2. 他缓缓转过身，你发现他脸上没有五官，只有平滑的皮肤。
3. 你举枪警告，但他凭空消失在阴影中。
4. 地上只留下一张塔罗牌，牌面是一只巨大的眼睛。
5. 你捡起塔罗牌，感到一种被窥视的寒意。

[ATMOSPHERE]
紧张、肮脏、超现实的恐惧。`,
    isStatic: true,
    triggers: [
      { type: 'chapter_start', chapterId: 0 },
      { type: 'origin_is', origin: 'detective' }
    ],
    options: [
      {
        id: 'detective_pursue',
        text: '这不再是普通的谋杀案了。',
        nextEventId: 'recruitment_interrogation'
      }
    ]
  },
  {
    id: 'recruitment_interrogation',
    title: '灰雾中的访客',
    text: `[SCENE SETUP]
地点：你租住的公寓。
时间：事件发生后的几天，雨夜。
人物：你，两名防剿局特工（穿着灰色风衣）。

[KEY ACTIONS]
1. 描述你这几天的精神恍惚和被监视感。
2. 敲门声响起，两名灰衣人站在门口。
3. 他们出示了一份文件，记录了你那晚看到的所有细节（甚至是你没告诉任何人的）。
4. 特工提出选择：加入“防剿局”处理此类事件，或者被“清理”（暗示死亡或洗脑）。
5. 特工指着楼下的黑色马车，等待你的决定。

[ATMOSPHERE]
压抑、威胁、无法拒绝的宿命感。`,
    isStatic: true,
    triggers: [],
    options: [
      {
        id: 'join_bureau',
        text: '我没有别的选择。我上车。',
        effects: [
          { type: 'UNLOCK_LOCATION', value: 'SuppressionBureau' },
          { type: 'ADD_TAG', value: 'Recruit' },
          { type: 'SET_IDENTITY', value: 'Bureau Recruit' }
        ],
        nextEventId: 'archive_briefing'
      }
    ]
  },
  {
    id: 'archive_briefing',
    title: '归档与隔离科',
    text: `[SCENE SETUP]
地点：防剿局地下三层，“归档与隔离科”。
环境：巨大的金属档案柜，像冰川裂隙；极度寒冷。
人物：你，上司 "H"。

[KEY ACTIONS]
1. 描述档案室的巨大和非人的秩序感。
2. 上司 "H" 戴着白手套，递给你一份任务简报。
3. 任务目标：前往荷尔本区的“书店”，回收《夜行漫记》。
4. H 警告：不要阅读，不要好奇，只负责回收。
5. H 给你通行证和钥匙，然后转身离开，留下你一个人在寒冷中。

[ATMOSPHERE]
官僚主义的冷漠、巨大的孤独感、未知的恐惧。`,
    isStatic: true,
    onEnter: [
      { 
        type: 'ADD_CHARACTER', 
        value: {
          id: 'h',
          name: 'H',
          description: '防剿局归档与隔离科主管。冷漠、精确、像一台穿西装的机器。',
          relationship: 'Superior',
          status: 'Active',
          location: 'SuppressionBureau'
        }
      }
    ],
    triggers: [],
    options: [
      {
        id: 'accept_mission',
        text: '拿上文件夹，前往荷尔本区。',
        effects: [
          { type: 'UNLOCK_LOCATION', value: 'The Bookshop' },
          { type: 'ADD_ITEM', value: 'mission_file_skin_of_night' },
          { type: 'ADD_TAG', value: 'BureauAgent' },
          { type: 'ADD_FACT', value: 'Mission: Retrieve Skin of Night' },
          { type: 'SET_IDENTITY', value: 'Bureau Agent' }
        ],
        nextEventId: 'chapter_1_start'
      }
    ]
  },
  {
    id: 'chapter_1_start',
    title: '第一章：夜行漫记',
    text: `[SCENE SETUP]
地点：荷尔本区，“书店”门口。
时间：冬夜。
环境：萧瑟的街道，昏黄的煤气灯。

[KEY ACTIONS]
1. 你按照地址找到了“书店”，它看起来破旧且不起眼。
2. 橱窗里堆放着奇怪的标本和仪器，没有书。
3. 你推门进入，门铃声沉闷。
4. 店内气味独特（旧纸张、霉菌），书架像迷宫一样延伸进黑暗。
5. 你的自由探索开始了。

[ATMOSPHERE]
神秘、古老、静谧中隐藏着危险。`,
    isStatic: true,
    onEnter: [
      { type: 'SET_CHAPTER', value: 1 }
    ],
    triggers: [],
    options: [
      {
        id: 'enter_bookshop',
        text: '走进书店深处。',
        nextEventId: 'morland_greeting'
      }
    ]
  },
  {
    id: 'morland_greeting',
    title: '莫兰小姐的推荐',
    text: `[SCENE SETUP]
地点：莫兰书店内部。书架高耸，尘埃在光柱中飞舞。
人物：莫兰小姐（神秘、优雅、戴着面纱）。

[ACTION]
莫兰小姐注意到了你。她似乎能看穿你的本质（基于你的最高性相）。
她从柜台下拿出了一本书，说这本书很适合你。

[INSTRUCTION FOR LLM]
1. 根据玩家当前的最高性相 (Dominant Principle)，决定莫兰小姐推荐的书籍。
2. 描述莫兰小姐的推荐语，体现该性相的风格。
3. **[DATA_INSTRUCTION]** 数据引擎请注意：必须根据最终推荐的书籍生成 \`ADD_ITEM\` 指令。映射关系如下：
   - Lantern -> book_lantern_1
   - Forge -> book_forge_1
   - Edge -> book_edge_1
   - Winter -> book_winter_1
   - Heart -> book_heart_1
   - Grail -> book_grail_1
   - Moth -> book_moth_1
   - Knock -> book_knock_1
   - Neutral -> book_dream_v1
   (请确保 JSON 中使用的 ID 与此处一致)
`,
    isStatic: false,
    triggers: [
      { type: 'location_enter', locationId: 'The Bookshop' }
    ],
    onEnter: [
      { 
        type: 'ADD_CHARACTER', 
        value: {
          id: 'morland',
          name: 'Miss Morland',
          description: '莫兰书店的神秘店主，总是戴着面纱。似乎知晓许多隐秘知识。',
          relationship: 'Neutral',
          status: 'Active',
          location: 'The Bookshop'
        }
      }
    ],
    options: [
      {
        id: 'buy_book',
        text: '买下这本书（消耗 1 金钱）。',
        effects: [
          { type: 'MODIFY_RESOURCE', target: 'funds', value: -1 }
        ],
        nextEventId: 'read_first_book'
      }
    ]
  },
  {
    id: 'read_first_book',
    title: '禁忌的阅读',
    text: `[SCENE SETUP]
地点：你的公寓。
时间：深夜。
物品：你刚买回来的那本奇怪的书。

[ACTION]
你翻开书页。文字似乎在纸面上游动。阅读这本书不仅仅是获取信息，更是一种仪式。
你需要选择何时阅读它。

[CHOICES]
1. 在深夜疲惫、理智薄弱时阅读（更容易入梦，但风险未知）。
2. 在正午清醒、理智高昂时阅读（安全，但可能无法理解深层含义）。`,
    isStatic: true,
    triggers: [],
    options: [
      {
        id: 'read_tired',
        text: '在深夜疲惫时阅读（尝试入梦）。',
        effects: [
          { type: 'MODIFY_RESOURCE', target: 'sanity', value: -1 }
        ],
        nextEventId: 'enter_wood_first_time'
      },
      {
        id: 'read_awake',
        text: '在正午清醒时阅读。',
        nextEventId: 'dream_fail_wound'
      }
    ]
  },
  {
    id: 'dream_fail_wound',
    title: '梦中的伤口',
    text: `[SCENE SETUP]
地点：你的卧室 -> 噩梦。

[ACTION]
你试图用理智去解析书中的内容，但文字变得混乱不堪。
你感到一阵剧烈的头痛，仿佛有人在你的脑壳里凿击。
当你醒来时，你发现身上多了一处不明的淤青。

[RESULT]
入梦失败。你没有进入林地，反而受了伤。`,
    isStatic: true,
    triggers: [],
    options: [
      {
        id: 'wake_up_hurt',
        text: '抚摸伤口，感到一阵恐惧。',
        effects: [
          { type: 'MODIFY_RESOURCE', target: 'health', value: -1 },
          { type: 'ADD_TAG', value: 'Nightmare' }
        ],
        nextEventId: 'bookshop_dilemma'
      }
    ]
  },
  {
    id: 'enter_wood_first_time',
    title: '初入林地',
    text: `[SCENE SETUP]
地点：漫宿 - 林地 (The Wood)。
环境：没有光照的黑色森林，树木高大而扭曲，空气中弥漫着霉味和古老的尘埃味。
声音：四周充满了窃窃私语，那是“林地的低语”。

[ACTION]
你成功穿过了睡眠的薄纱。这里是漫宿的最外层。
你听到了两种截然不同的声音在呼唤你。
一种声音冰冷而寂静，来自白杨树的方向（冬）。
一种声音混乱而疯狂，伴随着翅膀的扑腾声（蛾）。

[CHOICE]
你必须选择聆听其中一种声音，以获得初次的启示。`,
    isStatic: true,
    triggers: [],
    options: [
      {
        id: 'listen_winter',
        text: '聆听白杨的哀歌（获得冬密传）。',
        effects: [
          { type: 'ADD_LORE', value: 'lore_winter_1' },
          { type: 'MODIFY_ASPECT', target: 'winter', value: 1 }
        ],
        nextEventId: 'wood_whispers_choice'
      },
      {
        id: 'listen_moth',
        text: '聆听飞蛾的扑腾（获得蛾密传）。',
        effects: [
          { type: 'ADD_LORE', value: 'lore_moth_1' },
          { type: 'MODIFY_ASPECT', target: 'moth', value: 1 }
        ],
        nextEventId: 'wood_whispers_choice'
      }
    ]
  },
  {
    id: 'wood_whispers_choice',
    title: '林地的馈赠',
    text: `[SCENE SETUP]
地点：林地。

[ACTION]
你聆听了那来自虚空的声音。知识以一种痛苦的方式灌入你的脑海。
你明白了关于“${'${dominantPrinciple}'}”的一点真理。
（LLM 将根据你刚才的选择描述你获得的具体知识和感受）。

[RESULT]
你即将醒来。林地的影子正在退去。`,
    isStatic: false,
    triggers: [],
    options: [
      {
        id: 'wake_from_wood',
        text: '在晨光中醒来，记住了那个声音。',
        nextEventId: 'bookshop_dilemma'
      },
      {
        id: 'stay_deeper',
        text: '试图在林地中停留更久（蛾之诱惑，高风险）。',
        requires: [{ type: 'aspect_threshold', aspect: 'moth', value: 1, operator: '>=' }],
        nextEventId: 'moth_whisper_event'
      }
    ]
  },
  {
    id: 'moth_whisper_event',
    title: '蛾之低语',
    text: `[SCENE SETUP]
地点：林地深处。
人物：你，以及无数看不见的飞蛾。

[ACTION]
你拒绝了醒来。你向森林深处走去。
无数飞蛾扑向你，它们不是在寻找光，而是在寻找你的理智。
你感到头发在变白，思维在断裂，但一种疯狂的喜悦涌上心头。

[RESULT]
你获得了“躁动”特质。你的理智受到了永久的损伤，但你的灵感大幅提升。`,
    isStatic: true,
    triggers: [],
    options: [
      {
        id: 'accept_moth_gift',
        text: '接受这份疯狂的礼物。',
        effects: [
          { type: 'MODIFY_RESOURCE', target: 'sanity', value: -2 },
          { type: 'ADD_TAG', value: 'Restlessness' },
          { type: 'MODIFY_ASPECT', target: 'moth', value: 2 }
        ],
        nextEventId: 'bookshop_dilemma'
      }
    ]
  },
  {
    id: 'bookshop_dilemma',
    title: '书店的抉择',
    text: `[SCENE SETUP]
地点：防剿局办公室。
时间：第二天清晨。

[ACTION]
你坐在办公桌前，手里拿着那本禁书（或者抚摸着伤口）。
你知道莫兰书店是违禁品的源头。
作为防剿局的一员，你有义务报告它。
但作为一名探索者，那里是你唯一的知识来源。

[CHOICE]
你的报告就在手边。你会怎么写？`,
    isStatic: true,
    triggers: [],
    options: [
      {
        id: 'report_bookshop',
        text: '如实报告莫兰书店的位置（获得晋升，书店被查封）。',
        effects: [
          { type: 'MODIFY_RESOURCE', target: 'funds', value: 5 },
          { type: 'ADD_TAG', value: 'LoyalAgent' },
          { type: 'SET_IDENTITY', value: 'Junior Agent' }
        ],
        nextEventId: 'chapter_2_start'
      },
      {
        id: 'keep_secret',
        text: '隐瞒书店的存在，只报告回收了任务物品（保留书店，获得莫兰小姐的信任）。',
        effects: [
          { type: 'ADD_TAG', value: 'SecretKeeper' },
          { 
            type: 'UPDATE_CHARACTER', 
            value: { 
              id: 'morland', 
              updates: { relationship: 'Ally' } 
            } 
          }
        ],
        nextEventId: 'chapter_2_start'
      }
    ]
  }
];
