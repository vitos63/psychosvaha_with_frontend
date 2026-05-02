export const TAG_CATEGORIES = {
  ANXIETY_AND_DEPRESSION: [
    { id: 5, title: 'БАР' },
    { id: 17, title: 'депрессия' },
    { id: 15, title: 'социофобия' },
    { id: 16, title: 'тревога' },
    { id: 47, title: 'сверхконтроль' },
    { id: 14, title: 'ОКР' },
  ],
  CHILDREN_TOPICS: [
    { id: 6, title: 'детский аутизм' },
    { id: 2, title: 'логопед/нейропсихолог' },
    { id: 26, title: 'энурез/энкопрез' },
  ],
  ADDICTIONS: [
    { id: 32, title: 'зависимости' },
    { id: 22, title: 'гэмблинг' },
  ],
  TRAUMA_AND_GRIEF: [
    { id: 9, title: 'горе' },
    { id: 23, title: 'травма' },
  ],
  RPP: [
    { id: 10, title: 'анорексия' },
    { id: 11, title: 'переедание' },
    { id: 34, title: 'дисморфофобия' },
  ],
  SOMATIC_PROBLEMS: [
    { id: 20, title: 'психосоматика' },
    { id: 18, title: 'сомнология' },
    { id: 19, title: 'хроническая боль' },
  ],
  EMOTIONAL_DYSREGULATION: [
    { id: 12, title: 'НРЛ' },
    { id: 7, title: 'ПРЛ' },
    { id: 41, title: 'авторы насилия' },
    { id: 44, title: 'селфхарм/суицид' },
    { id: 28, title: 'эмоциональная регуляция' },
    { id: 8, title: 'импульсивность' },
  ],
  NEURODEVELOPMENTAL_DISORDERS: [
    { id: 31, title: 'СДВГ' },
    { id: 30, title: 'нейроотличия, РАС' },
  ],
  RELATIONSHIP: [
    { id: 24, title: 'отношения' },
    { id: 13, title: 'сексология' },
    { id: 25, title: 'семейная терапия' },
  ],
  COACHING_AND_ADAPTATION: [
    { id: 29, title: 'выгорание' },
    { id: 33, title: 'коучинг' },
    { id: 46, title: 'трудовая адаптация' },
    { id: 45, title: 'эмиграция' },
  ],
  THERAPY_METHODS: [
    { id: 38, title: 'КПТ' },
    { id: 37, title: 'ДБТ' },
    { id: 36, title: 'АСТ' },
    { id: 3, title: 'МВТ' },
    { id: 21, title: 'РЭПТ' },
    { id: 39, title: 'психоанализ' },
    { id: 27, title: 'психодинамическая терапия' },
    { id: 40, title: 'схема-терапия' },
  ],
} as const;

export type TagCategoryKey = keyof typeof TAG_CATEGORIES;

export const TAG_CATEGORY_LABELS: Record<TagCategoryKey, string> = {
  ANXIETY_AND_DEPRESSION:
    '	Вы работаете с тревогой и депрессией? Выберите подходящие варианты:',
  CHILDREN_TOPICS: 'Работаете ли вы с детьми? Выберите подходящие варианты:',
  ADDICTIONS: 'Работаете ли вы с зависимостями? Выберите подходящие варианты:',
  TRAUMA_AND_GRIEF: 'Вы работаете с травмами и горем? Выберите подходящие варианты:',
  RPP: '	Вы работаете с РПП? Выберите подходящие варианты:',
  SOMATIC_PROBLEMS:
    '	Вы работаете с психосоматическими проблемами? Выберите подходящие варианты:',
  EMOTIONAL_DYSREGULATION:
    '	Вы работаете с проблемами контроля поведения и регуляцией эмоций? Выберите подходящие варианты:',
  NEURODEVELOPMENTAL_DISORDERS:
    'Вы работаете с нарушениями нейроразвития? Выберите подходящие варианты:',
  RELATIONSHIP: '	Вы работаете с отношениями? Выберите подходящие варианты:',
  COACHING_AND_ADAPTATION:
    '	Вы занимаетесь коучингом и адаптацией? Выберите подходящие варианты:',
  THERAPY_METHODS: 'Выберите методы терапии, с которыми вы работаете',
};

/** Все известные названия тегов в порядке категорий (для админки и проверок). */
export const TAG_OPTIONS: string[] = Object.values(TAG_CATEGORIES).flatMap((tags) =>
  tags.map((t) => t.title),
);
