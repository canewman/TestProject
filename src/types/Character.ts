export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface AbilityModifiers {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface SavingThrows {
  fortitude: number;
  reflex: number;
  will: number;
}

export interface Skill {
  name: string;
  abilityScore: keyof AbilityScores;
  ranks: number;
  miscModifier: number;
  isClassSkill: boolean;
  trained: boolean;
}

export interface Feat {
  name: string;
  description: string;
  prerequisites: string;
}

export interface Spell {
  name: string;
  level: number;
  school: string;
  description: string;
  prepared: boolean;
}

export interface Equipment {
  name: string;
  quantity: number;
  weight: number;
  description: string;
  equipped: boolean;
}

export interface Attack {
  name: string;
  attackBonus: number;
  damage: string;
  critical: string;
  range: string;
  type: string;
}

export interface Character {
  id: string;
  name: string;
  playerName: string;
  
  // Basic Info
  race: string;
  characterClass: string;
  level: number;
  alignment: string;
  deity: string;
  size: string;
  age: number;
  gender: string;
  height: string;
  weight: string;
  eyes: string;
  hair: string;
  skin: string;
  
  // Ability Scores
  abilityScores: AbilityScores;
  abilityModifiers: AbilityModifiers;
  
  // Combat Stats
  hitPoints: {
    current: number;
    maximum: number;
    temporary: number;
  };
  armorClass: {
    total: number;
    armor: number;
    shield: number;
    dex: number;
    size: number;
    natural: number;
    deflection: number;
    misc: number;
  };
  baseAttackBonus: number;
  spellResistance: number;
  
  // Saving Throws
  savingThrows: SavingThrows;
  
  // Skills
  skills: Skill[];
  
  // Feats
  feats: Feat[];
  
  // Equipment
  equipment: Equipment[];
  money: {
    copper: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  
  // Attacks
  attacks: Attack[];
  
  // Magic
  spells: Spell[];
  spellsPerDay: { [level: number]: number };
  spellsKnown: { [level: number]: number };
  
  // Experience
  experience: {
    current: number;
    needed: number;
  };
  
  // Notes
  notes: string;
  
  // Creation timestamp
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterProfile {
  id: string;
  name: string;
  level: number;
  race: string;
  characterClass: string;
  lastPlayed: Date;
}

export type CreationMode = 'manual' | 'random' | 'partial';

export interface CreationOptions {
  mode: CreationMode;
  randomizeStats: boolean;
  randomizeRace: boolean;
  randomizeClass: boolean;
  randomizeAlignment: boolean;
  randomizeSkills: boolean;
  randomizeFeats: boolean;
}
