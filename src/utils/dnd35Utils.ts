import { AbilityScores, AbilityModifiers, Character, Skill } from '../types/Character';

// D&D 3.5e Data
export const RACES = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome', 'Half-Elf', 'Half-Orc'
];

export const CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin',
  'Ranger', 'Rogue', 'Sorcerer', 'Wizard'
];

export const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];

export const SIZES = ['Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'];

export const SKILLS_LIST = [
  { name: 'Appraise', ability: 'intelligence' as keyof AbilityScores },
  { name: 'Balance', ability: 'dexterity' as keyof AbilityScores },
  { name: 'Bluff', ability: 'charisma' as keyof AbilityScores },
  { name: 'Climb', ability: 'strength' as keyof AbilityScores },
  { name: 'Concentration', ability: 'constitution' as keyof AbilityScores },
  { name: 'Craft', ability: 'intelligence' as keyof AbilityScores },
  { name: 'Decipher Script', ability: 'intelligence' as keyof AbilityScores },
  { name: 'Diplomacy', ability: 'charisma' as keyof AbilityScores },
  { name: 'Disable Device', ability: 'intelligence' as keyof AbilityScores },
  { name: 'Disguise', ability: 'charisma' as keyof AbilityScores },
  { name: 'Escape Artist', ability: 'dexterity' as keyof AbilityScores },
  { name: 'Forgery', ability: 'intelligence' as keyof AbilityScores },
  { name: 'Gather Information', ability: 'charisma' as keyof AbilityScores },
  { name: 'Handle Animal', ability: 'charisma' as keyof AbilityScores },
  { name: 'Heal', ability: 'wisdom' as keyof AbilityScores },
  { name: 'Hide', ability: 'dexterity' as keyof AbilityScores },
  { name: 'Intimidate', ability: 'charisma' as keyof AbilityScores },
  { name: 'Jump', ability: 'strength' as keyof AbilityScores },
  { name: 'Knowledge', ability: 'intelligence' as keyof AbilityScores },
  { name: 'Listen', ability: 'wisdom' as keyof AbilityScores },
  { name: 'Move Silently', ability: 'dexterity' as keyof AbilityScores },
  { name: 'Open Lock', ability: 'dexterity' as keyof AbilityScores },
  { name: 'Perform', ability: 'charisma' as keyof AbilityScores },
  { name: 'Profession', ability: 'wisdom' as keyof AbilityScores },
  { name: 'Ride', ability: 'dexterity' as keyof AbilityScores },
  { name: 'Search', ability: 'intelligence' as keyof AbilityScores },
  { name: 'Sense Motive', ability: 'wisdom' as keyof AbilityScores },
  { name: 'Sleight of Hand', ability: 'dexterity' as keyof AbilityScores },
  { name: 'Spellcraft', ability: 'intelligence' as keyof AbilityScores },
  { name: 'Spot', ability: 'wisdom' as keyof AbilityScores },
  { name: 'Survival', ability: 'wisdom' as keyof AbilityScores },
  { name: 'Swim', ability: 'strength' as keyof AbilityScores },
  { name: 'Tumble', ability: 'dexterity' as keyof AbilityScores },
  { name: 'Use Magic Device', ability: 'charisma' as keyof AbilityScores },
  { name: 'Use Rope', ability: 'dexterity' as keyof AbilityScores }
];

// Dice rolling functions
export const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

export const rollDice = (count: number, sides: number): number[] => {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides));
  }
  return rolls;
};

// Standard D&D 3.5e ability score generation: 4d6, drop lowest
export const rollAbilityScore = (): number => {
  const rolls = rollDice(4, 6);
  rolls.sort((a, b) => b - a); // Sort descending
  return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0); // Take top 3
};

export const rollAllAbilityScores = (): AbilityScores => {
  return {
    strength: rollAbilityScore(),
    dexterity: rollAbilityScore(),
    constitution: rollAbilityScore(),
    intelligence: rollAbilityScore(),
    wisdom: rollAbilityScore(),
    charisma: rollAbilityScore(),
  };
};

// Calculate ability modifiers
export const calculateAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export const calculateAllAbilityModifiers = (scores: AbilityScores): AbilityModifiers => {
  return {
    strength: calculateAbilityModifier(scores.strength),
    dexterity: calculateAbilityModifier(scores.dexterity),
    constitution: calculateAbilityModifier(scores.constitution),
    intelligence: calculateAbilityModifier(scores.intelligence),
    wisdom: calculateAbilityModifier(scores.wisdom),
    charisma: calculateAbilityModifier(scores.charisma),
  };
};

// Experience table for levels
export const EXPERIENCE_TABLE: { [level: number]: number } = {
  1: 0,
  2: 1000,
  3: 3000,
  4: 6000,
  5: 10000,
  6: 15000,
  7: 21000,
  8: 28000,
  9: 36000,
  10: 45000,
  11: 55000,
  12: 66000,
  13: 78000,
  14: 91000,
  15: 105000,
  16: 120000,
  17: 136000,
  18: 153000,
  19: 171000,
  20: 190000,
};

export const getExperienceForLevel = (level: number): number => {
  return EXPERIENCE_TABLE[level] || 0;
};

export const getExperienceNeededForNextLevel = (currentLevel: number): number => {
  return getExperienceForLevel(currentLevel + 1);
};

// Hit die by class
export const HIT_DIE_BY_CLASS: { [className: string]: number } = {
  'Barbarian': 12,
  'Bard': 6,
  'Cleric': 8,
  'Druid': 8,
  'Fighter': 10,
  'Monk': 8,
  'Paladin': 10,
  'Ranger': 8,
  'Rogue': 6,
  'Sorcerer': 4,
  'Wizard': 4,
};

export const calculateHitPoints = (level: number, characterClass: string, constitutionModifier: number): number => {
  const hitDie = HIT_DIE_BY_CLASS[characterClass] || 8;
  
  // First level gets max hit die + con modifier
  let hitPoints = hitDie + constitutionModifier;
  
  // Subsequent levels get average + con modifier
  for (let i = 2; i <= level; i++) {
    hitPoints += Math.floor(hitDie / 2) + 1 + constitutionModifier;
  }
  
  return Math.max(hitPoints, level); // Minimum 1 HP per level
};

// Base Attack Bonus by class and level
export const getBaseAttackBonus = (characterClass: string, level: number): number => {
  const highBAB = ['Fighter', 'Paladin', 'Ranger', 'Barbarian'];
  const mediumBAB = ['Bard', 'Cleric', 'Druid', 'Monk', 'Rogue'];
  const lowBAB = ['Sorcerer', 'Wizard'];
  
  if (highBAB.includes(characterClass)) {
    return level;
  } else if (mediumBAB.includes(characterClass)) {
    return Math.floor(level * 0.75);
  } else {
    return Math.floor(level * 0.5);
  }
};

// Saving throws by class and level
export const getSavingThrows = (characterClass: string, level: number) => {
  const goodSave = Math.floor(level / 2) + 2;
  const poorSave = Math.floor(level / 3);
  
  const savingThrowProgression: { [className: string]: { fort: boolean; ref: boolean; will: boolean } } = {
    'Barbarian': { fort: true, ref: false, will: false },
    'Bard': { fort: false, ref: true, will: true },
    'Cleric': { fort: true, ref: false, will: true },
    'Druid': { fort: true, ref: false, will: true },
    'Fighter': { fort: true, ref: false, will: false },
    'Monk': { fort: true, ref: true, will: true },
    'Paladin': { fort: true, ref: false, will: false },
    'Ranger': { fort: true, ref: true, will: false },
    'Rogue': { fort: false, ref: true, will: false },
    'Sorcerer': { fort: false, ref: false, will: true },
    'Wizard': { fort: false, ref: false, will: true },
  };
  
  const progression = savingThrowProgression[characterClass] || { fort: false, ref: false, will: false };
  
  return {
    fortitude: progression.fort ? goodSave : poorSave,
    reflex: progression.ref ? goodSave : poorSave,
    will: progression.will ? goodSave : poorSave,
  };
};

// Random character generation
export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const generateRandomCharacter = (): Partial<Character> => {
  const abilityScores = rollAllAbilityScores();
  const abilityModifiers = calculateAllAbilityModifiers(abilityScores);
  const race = getRandomElement(RACES);
  const characterClass = getRandomElement(CLASSES);
  const level = 1;
  const alignment = getRandomElement(ALIGNMENTS);
  
  const hitPoints = calculateHitPoints(level, characterClass, abilityModifiers.constitution);
  const baseAttackBonus = getBaseAttackBonus(characterClass, level);
  const savingThrows = getSavingThrows(characterClass, level);
  
  return {
    race,
    characterClass,
    level,
    alignment,
    size: 'Medium',
    abilityScores,
    abilityModifiers,
    hitPoints: {
      current: hitPoints,
      maximum: hitPoints,
      temporary: 0,
    },
    baseAttackBonus,
    savingThrows,
    armorClass: {
      total: 10 + abilityModifiers.dexterity,
      armor: 0,
      shield: 0,
      dex: abilityModifiers.dexterity,
      size: 0,
      natural: 0,
      deflection: 0,
      misc: 0,
    },
    experience: {
      current: 0,
      needed: getExperienceNeededForNextLevel(level),
    },
  };
};

export const createDefaultCharacter = (): Character => {
  const id = Date.now().toString();
  const now = new Date();
  
  return {
    id,
    name: 'New Character',
    playerName: '',
    race: 'Human',
    characterClass: 'Fighter',
    level: 1,
    alignment: 'True Neutral',
    deity: '',
    size: 'Medium',
    age: 25,
    gender: '',
    height: '',
    weight: '',
    eyes: '',
    hair: '',
    skin: '',
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    abilityModifiers: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    },
    hitPoints: {
      current: 10,
      maximum: 10,
      temporary: 0,
    },
    armorClass: {
      total: 10,
      armor: 0,
      shield: 0,
      dex: 0,
      size: 0,
      natural: 0,
      deflection: 0,
      misc: 0,
    },
    baseAttackBonus: 1,
    spellResistance: 0,
    savingThrows: {
      fortitude: 2,
      reflex: 0,
      will: 0,
    },
    skills: SKILLS_LIST.map(skill => ({
      name: skill.name,
      abilityScore: skill.ability,
      ranks: 0,
      miscModifier: 0,
      isClassSkill: false,
      trained: false,
    })),
    feats: [],
    equipment: [],
    money: {
      copper: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    },
    attacks: [],
    spells: [],
    spellsPerDay: {},
    spellsKnown: {},
    experience: {
      current: 0,
      needed: 1000,
    },
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
};

// Common D&D 3.5e Spells
export const COMMON_SPELLS = [
  // Level 0 (Cantrips)
  { name: 'Detect Magic', level: 0, school: 'Divination', description: 'Detects spells and magic items within 60 ft.' },
  { name: 'Light', level: 0, school: 'Evocation', description: 'Object shines like a torch.' },
  { name: 'Mage Hand', level: 0, school: 'Transmutation', description: 'Telekinetically move 5-pound object.' },
  { name: 'Prestidigitation', level: 0, school: 'Transmutation', description: 'Performs minor tricks.' },
  { name: 'Read Magic', level: 0, school: 'Divination', description: 'Read scrolls and spellbooks.' },
  
  // Level 1 Spells
  { name: 'Magic Missile', level: 1, school: 'Evocation', description: '1d4+1 damage; +1 missile per two levels above 1st (max 5).' },
  { name: 'Shield', level: 1, school: 'Abjuration', description: '+4 AC, immunity to magic missile.' },
  { name: 'Burning Hands', level: 1, school: 'Evocation', description: '1d4/level fire damage (max 5d4).' },
  { name: 'Cure Light Wounds', level: 1, school: 'Conjuration', description: 'Cures 1d8 damage +1/level (max +5).' },
  { name: 'Bless', level: 1, school: 'Enchantment', description: 'Allies gain +1 on attack rolls and saves against fear.' },
  
  // Level 2 Spells
  { name: 'Fireball', level: 3, school: 'Evocation', description: '1d6/level damage, 20-ft. radius.' },
  { name: 'Lightning Bolt', level: 3, school: 'Evocation', description: '1d6/level damage in 120-ft. line.' },
  { name: 'Invisibility', level: 2, school: 'Illusion', description: 'Subject is invisible for 1 min./level or until it attacks.' },
  { name: 'Web', level: 2, school: 'Conjuration', description: 'Fills 20-ft.-radius spread with sticky spiderwebs.' },
  
  // Level 3 Spells
  { name: 'Haste', level: 3, school: 'Transmutation', description: 'One creature/level moves faster, +1 on attack rolls, AC, and Reflex saves.' },
  { name: 'Hold Person', level: 3, school: 'Enchantment', description: 'Paralyzes one humanoid for 1 round/level.' },
  
  // Higher Level Spells
  { name: 'Polymorph', level: 4, school: 'Transmutation', description: 'Gives one willing subject a new form.' },
  { name: 'Teleport', level: 5, school: 'Conjuration', description: 'Instantly transports you as far as 100 miles/level.' },
  { name: 'Disintegrate', level: 6, school: 'Transmutation', description: 'Ray deals 2d6 damage/level, destroying one creature or object.' },
  { name: 'Wish', level: 9, school: 'Conjuration', description: 'As limited wish, but with fewer limits.' },
];

// Function to get spells by class
export const getSpellsByClass = (characterClass: string, level: number) => {
  const spellcastingClasses = ['Wizard', 'Sorcerer', 'Cleric', 'Druid', 'Bard', 'Paladin', 'Ranger'];
  
  if (!spellcastingClasses.includes(characterClass)) {
    return [];
  }
  
  // Simplified spell access based on class and level
  const maxSpellLevel = Math.min(9, Math.floor((level + 1) / 2));
  
  return COMMON_SPELLS.filter(spell => spell.level <= maxSpellLevel);
};
