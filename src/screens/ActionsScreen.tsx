import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Character, Attack } from '../types/Character';
import { CharacterStorageService } from '../services/characterStorage';
import { rollDie, rollDice, calculateAbilityModifier } from '../utils/dnd35Utils';

interface ActionsScreenProps {
  navigation: any;
}

interface DiceRoll {
  type: string;
  result: number;
  breakdown: string;
  timestamp: Date;
}

export const ActionsScreen: React.FC<ActionsScreenProps> = ({ navigation }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);

  useEffect(() => {
    loadCurrentCharacter();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: character ? `${character.name} - Actions` : 'Actions',
    });
  }, [navigation, character]);

  const loadCurrentCharacter = async () => {
    try {
      setIsLoading(true);
      const currentCharacter = await CharacterStorageService.getCurrentCharacter();
      if (currentCharacter) {
        setCharacter(currentCharacter);
      } else {
        Alert.alert(
          'No Character Loaded',
          'Please load a character from the home screen first.',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      }
    } catch (error) {
      console.error('Error loading character:', error);
      Alert.alert('Error', 'Failed to load character');
    } finally {
      setIsLoading(false);
    }
  };

  const addToHistory = (roll: DiceRoll) => {
    setRollHistory(prev => [roll, ...prev.slice(0, 9)]); // Keep last 10 rolls
  };

  const rollSavingThrow = (saveType: 'fortitude' | 'reflex' | 'will') => {
    if (!character) return;

    const baseRoll = rollDie(20);
    const saveBonus = character.savingThrows[saveType];
    const total = baseRoll + saveBonus;

    const roll: DiceRoll = {
      type: `${saveType.charAt(0).toUpperCase() + saveType.slice(1)} Save`,
      result: total,
      breakdown: `1d20(${baseRoll}) + ${saveBonus}`,
      timestamp: new Date(),
    };

    addToHistory(roll);
    
    const critText = baseRoll === 20 ? ' (Natural 20!)' : baseRoll === 1 ? ' (Natural 1!)' : '';
    Alert.alert(
      `${roll.type}${critText}`,
      `Roll: ${roll.breakdown} = ${total}`,
      [{ text: 'OK' }]
    );
  };

  const rollAbilityCheck = (ability: string) => {
    if (!character) return;

    const baseRoll = rollDie(20);
    const modifier = character.abilityModifiers[ability as keyof typeof character.abilityModifiers];
    const total = baseRoll + modifier;

    const roll: DiceRoll = {
      type: `${ability.charAt(0).toUpperCase() + ability.slice(1)} Check`,
      result: total,
      breakdown: `1d20(${baseRoll}) + ${modifier}`,
      timestamp: new Date(),
    };

    addToHistory(roll);
    
    const critText = baseRoll === 20 ? ' (Natural 20!)' : baseRoll === 1 ? ' (Natural 1!)' : '';
    Alert.alert(
      `${roll.type}${critText}`,
      `Roll: ${roll.breakdown} = ${total}`,
      [{ text: 'OK' }]
    );
  };

  const rollAttack = (attack: Attack) => {
    if (!character) return;

    const baseRoll = rollDie(20);
    const total = baseRoll + attack.attackBonus;

    const roll: DiceRoll = {
      type: `${attack.name} Attack`,
      result: total,
      breakdown: `1d20(${baseRoll}) + ${attack.attackBonus}`,
      timestamp: new Date(),
    };

    addToHistory(roll);
    
    const critText = baseRoll === 20 ? ' (Natural 20!)' : baseRoll === 1 ? ' (Natural 1!)' : '';
    Alert.alert(
      `${attack.name} Attack${critText}`,
      `Roll: ${roll.breakdown} = ${total}`,
      [
        { text: 'OK' },
        {
          text: 'Roll Damage',
          onPress: () => rollDamage(attack),
        },
      ]
    );
  };

  const rollDamage = (attack: Attack) => {
    // Parse damage string (e.g., "1d8+3", "2d6", "1d4+1")
    const damageMatch = attack.damage.match(/(\d+)d(\d+)([+-]\d+)?/);
    
    if (!damageMatch) {
      Alert.alert('Error', 'Invalid damage format');
      return;
    }

    const numDice = parseInt(damageMatch[1]);
    const dieSize = parseInt(damageMatch[2]);
    const modifier = damageMatch[3] ? parseInt(damageMatch[3]) : 0;

    const rolls = rollDice(numDice, dieSize);
    const rollTotal = rolls.reduce((sum, roll) => sum + roll, 0);
    const total = rollTotal + modifier;

    const rollsText = rolls.join(', ');
    const modifierText = modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : '';

    const roll: DiceRoll = {
      type: `${attack.name} Damage`,
      result: total,
      breakdown: `${numDice}d${dieSize}(${rollsText})${modifierText}`,
      timestamp: new Date(),
    };

    addToHistory(roll);
    
    Alert.alert(
      `${attack.name} Damage`,
      `Roll: ${roll.breakdown} = ${total}`,
      [{ text: 'OK' }]
    );
  };

  const rollInitiative = () => {
    if (!character) return;

    const baseRoll = rollDie(20);
    const dexModifier = character.abilityModifiers.dexterity;
    const total = baseRoll + dexModifier;

    const roll: DiceRoll = {
      type: 'Initiative',
      result: total,
      breakdown: `1d20(${baseRoll}) + ${dexModifier}`,
      timestamp: new Date(),
    };

    addToHistory(roll);
    
    Alert.alert(
      'Initiative Roll',
      `Roll: ${roll.breakdown} = ${total}`,
      [{ text: 'OK' }]
    );
  };

  const rollSkillCheck = (skillName: string) => {
    if (!character) return;

    const skill = character.skills.find(s => s.name === skillName);
    if (!skill) return;

    const baseRoll = rollDie(20);
    const abilityMod = character.abilityModifiers[skill.abilityScore];
    const classBonus = skill.isClassSkill && skill.ranks > 0 ? 3 : 0;
    const total = baseRoll + skill.ranks + abilityMod + skill.miscModifier + classBonus;

    const roll: DiceRoll = {
      type: `${skillName} Check`,
      result: total,
      breakdown: `1d20(${baseRoll}) + ${skill.ranks} + ${abilityMod} + ${skill.miscModifier} + ${classBonus}`,
      timestamp: new Date(),
    };

    addToHistory(roll);
    
    const critText = baseRoll === 20 ? ' (Natural 20!)' : baseRoll === 1 ? ' (Natural 1!)' : '';
    Alert.alert(
      `${skillName} Check${critText}`,
      `Roll: ${roll.breakdown} = ${total}`,
      [{ text: 'OK' }]
    );
  };

  const clearHistory = () => {
    setRollHistory([]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading character...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!character) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No character loaded</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Character Info */}
        <View style={styles.characterInfo}>
          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={styles.characterDetails}>
            Level {character.level} {character.race} {character.characterClass}
          </Text>
        </View>

        {/* Combat Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Combat Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={rollInitiative}>
            <Text style={styles.actionButtonText}>Roll Initiative</Text>
            <Text style={styles.actionButtonSubtext}>
              1d20 + {character.abilityModifiers.dexterity} (Dex)
            </Text>
          </TouchableOpacity>

          {character.attacks.length > 0 ? (
            character.attacks.map((attack, index) => (
              <View key={index} style={styles.attackContainer}>
                <TouchableOpacity
                  style={styles.attackButton}
                  onPress={() => rollAttack(attack)}
                >
                  <Text style={styles.attackButtonText}>{attack.name}</Text>
                  <Text style={styles.attackButtonSubtext}>
                    Attack: +{attack.attackBonus} | Damage: {attack.damage}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.damageButton}
                  onPress={() => rollDamage(attack)}
                >
                  <Text style={styles.damageButtonText}>Damage Only</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noItemsText}>No attacks configured</Text>
          )}
        </View>

        {/* Saving Throws */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saving Throws</Text>
          <View style={styles.savesContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => rollSavingThrow('fortitude')}
            >
              <Text style={styles.saveButtonText}>Fortitude</Text>
              <Text style={styles.saveButtonValue}>+{character.savingThrows.fortitude}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => rollSavingThrow('reflex')}
            >
              <Text style={styles.saveButtonText}>Reflex</Text>
              <Text style={styles.saveButtonValue}>+{character.savingThrows.reflex}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => rollSavingThrow('will')}
            >
              <Text style={styles.saveButtonText}>Will</Text>
              <Text style={styles.saveButtonValue}>+{character.savingThrows.will}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ability Checks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ability Checks</Text>
          <View style={styles.abilityContainer}>
            {Object.entries(character.abilityScores).map(([ability, score]) => (
              <TouchableOpacity
                key={ability}
                style={styles.abilityButton}
                onPress={() => rollAbilityCheck(ability as keyof typeof character.abilityScores)}
              >
                <Text style={styles.abilityButtonText}>
                  {ability.charAt(0).toUpperCase() + ability.slice(1, 3)}
                </Text>
                <Text style={styles.abilityButtonValue}>
                  {character.abilityModifiers[ability as keyof typeof character.abilityModifiers] >= 0 ? '+' : ''}
                  {character.abilityModifiers[ability as keyof typeof character.abilityModifiers]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Skill Checks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Skill Checks</Text>
          <View style={styles.skillsContainer}>
            {['Listen', 'Spot', 'Search', 'Hide', 'Move Silently', 'Climb', 'Jump', 'Swim'].map(skillName => {
              const skill = character.skills.find(s => s.name === skillName);
              if (!skill) return null;
              
              const totalModifier = skill.ranks + 
                character.abilityModifiers[skill.abilityScore] + 
                skill.miscModifier + 
                (skill.isClassSkill && skill.ranks > 0 ? 3 : 0);
              
              return (
                <TouchableOpacity
                  key={skillName}
                  style={styles.skillButton}
                  onPress={() => rollSkillCheck(skillName)}
                >
                  <Text style={styles.skillButtonText}>{skillName}</Text>
                  <Text style={styles.skillButtonValue}>
                    {totalModifier >= 0 ? '+' : ''}{totalModifier}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Spells Button */}
        {character.spells.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Magic</Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.spellsButton]}
              onPress={() => navigation.navigate('Spells')}
            >
              <Text style={styles.actionButtonText}>View Spells</Text>
              <Text style={styles.actionButtonSubtext}>
                {character.spells.length} spell{character.spells.length !== 1 ? 's' : ''} available
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Roll History */}
        {rollHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Roll History</Text>
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.clearHistoryText}>Clear</Text>
              </TouchableOpacity>
            </View>
            {rollHistory.map((roll, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyType}>{roll.type}</Text>
                <Text style={styles.historyResult}>{roll.result}</Text>
                <Text style={styles.historyBreakdown}>{roll.breakdown}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  characterInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  characterDetails: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  spellsButton: {
    borderLeftColor: '#9C27B0',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionButtonSubtext: {
    fontSize: 14,
    color: '#666',
  },
  attackContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  attackButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  attackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  attackButtonSubtext: {
    fontSize: 14,
    color: '#666',
  },
  damageButton: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    minWidth: 80,
  },
  damageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  savesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  saveButtonValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  abilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  abilityButton: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#673AB7',
  },
  abilityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  abilityButtonValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#673AB7',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skillButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  skillButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  skillButtonValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  noItemsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  historyResult: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginHorizontal: 8,
  },
  historyBreakdown: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
});
