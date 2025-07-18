import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Character, CreationMode, Spell } from '../types/Character';
import { CharacterStorageService } from '../services/characterStorage';
import { CharacterForm } from '../components/CharacterForm';
import { 
  createDefaultCharacter, 
  generateRandomCharacter, 
  rollAllAbilityScores,
  getRandomElement,
  RACES,
  CLASSES,
  ALIGNMENTS,
  calculateAllAbilityModifiers,
  calculateHitPoints,
  getBaseAttackBonus,
  getSavingThrows,
  getExperienceNeededForNextLevel,
  getSpellsByClass,
  COMMON_SPELLS,
} from '../utils/dnd35Utils';

interface CreateCharacterProps {
  navigation: any;
}

export const CreateCharacter: React.FC<CreateCharacterProps> = ({ navigation }) => {
  const [step, setStep] = useState<'mode' | 'customize' | 'preview'>('mode');
  const [creationMode, setCreationMode] = useState<CreationMode>('manual');
  const [character, setCharacter] = useState<Character>(createDefaultCharacter());
  const [randomOptions, setRandomOptions] = useState({
    randomizeStats: true,
    randomizeRace: true,
    randomizeClass: true,
    randomizeAlignment: true,
    randomizeSkills: false,
    randomizeFeats: false,
  });

  const handleModeSelection = (mode: CreationMode) => {
    setCreationMode(mode);
    
    if (mode === 'random') {
      // Generate completely random character
      const randomData = generateRandomCharacter();
      const newCharacter = { ...createDefaultCharacter(), ...randomData };
      setCharacter(newCharacter);
      setStep('preview');
    } else if (mode === 'partial') {
      setStep('customize');
    } else {
      // Manual mode
      setCharacter(createDefaultCharacter());
      setStep('preview');
    }
  };

  const handleRandomizeOption = (option: keyof typeof randomOptions) => {
    setRandomOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const applyPartialRandomization = () => {
    let updatedCharacter = { ...character };

    if (randomOptions.randomizeStats) {
      const abilityScores = rollAllAbilityScores();
      const abilityModifiers = calculateAllAbilityModifiers(abilityScores);
      updatedCharacter = {
        ...updatedCharacter,
        abilityScores,
        abilityModifiers,
      };
    }

    if (randomOptions.randomizeRace) {
      updatedCharacter.race = getRandomElement(RACES);
    }

    if (randomOptions.randomizeClass) {
      updatedCharacter.characterClass = getRandomElement(CLASSES);
    }

    if (randomOptions.randomizeAlignment) {
      updatedCharacter.alignment = getRandomElement(ALIGNMENTS);
    }

    // Recalculate derived stats
    const hitPoints = calculateHitPoints(
      updatedCharacter.level,
      updatedCharacter.characterClass,
      updatedCharacter.abilityModifiers.constitution
    );
    
    updatedCharacter.hitPoints = {
      current: hitPoints,
      maximum: hitPoints,
      temporary: 0,
    };

    updatedCharacter.baseAttackBonus = getBaseAttackBonus(
      updatedCharacter.characterClass,
      updatedCharacter.level
    );

    updatedCharacter.savingThrows = getSavingThrows(
      updatedCharacter.characterClass,
      updatedCharacter.level
    );

    updatedCharacter.armorClass = {
      ...updatedCharacter.armorClass,
      total: 10 + updatedCharacter.abilityModifiers.dexterity,
      dex: updatedCharacter.abilityModifiers.dexterity,
    };

    updatedCharacter.experience = {
      current: 0,
      needed: getExperienceNeededForNextLevel(updatedCharacter.level),
    };

    // Add some basic spells for spellcasting classes
    const spellcastingClasses = ['Wizard', 'Sorcerer', 'Cleric', 'Druid', 'Bard'];
    if (spellcastingClasses.includes(updatedCharacter.characterClass)) {
      const availableSpells = getSpellsByClass(updatedCharacter.characterClass, updatedCharacter.level);
      // Add 2-3 random spells
      const numSpells = Math.min(3, availableSpells.length);
      const selectedSpells: Spell[] = [];
      
      for (let i = 0; i < numSpells; i++) {
        const randomSpell = getRandomElement(availableSpells.filter(s => 
          !selectedSpells.some(sel => sel.name === s.name)
        ));
        if (randomSpell) {
          selectedSpells.push({
            ...randomSpell,
            prepared: i === 0, // Prepare the first spell
          });
        }
      }
      
      updatedCharacter.spells = selectedSpells;
    }

    setCharacter(updatedCharacter);
    setStep('preview');
  };

  const handleSaveCharacter = async () => {
    if (!character.name.trim()) {
      Alert.alert('Missing Name', 'Please enter a character name before saving.');
      return;
    }

    try {
      // Generate new ID and timestamps
      const newCharacter = {
        ...character,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await CharacterStorageService.saveCharacter(newCharacter);
      await CharacterStorageService.setCurrentCharacter(newCharacter.id);
      
      Alert.alert(
        'Character Created!',
        `"${newCharacter.name}" has been created and saved successfully.`,
        [
          {
            text: 'View Character',
            onPress: () => {
              navigation.reset({
                index: 1,
                routes: [
                  { name: 'Home' },
                  { name: 'CharacterSheet', params: { characterId: newCharacter.id } },
                ],
              });
            },
          },
          {
            text: 'Create Another',
            onPress: () => {
              setStep('mode');
              setCharacter(createDefaultCharacter());
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving character:', error);
      Alert.alert('Error', 'Failed to save character');
    }
  };

  const renderModeSelection = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Character</Text>
        <Text style={styles.subtitle}>Choose how you'd like to create your character</Text>
      </View>

      <TouchableOpacity
        style={[styles.modeCard, styles.manualMode]}
        onPress={() => handleModeSelection('manual')}
      >
        <Text style={styles.modeTitle}>Manual Entry</Text>
        <Text style={styles.modeDescription}>
          Enter all character information yourself. Perfect for bringing existing characters 
          into the app or when you want complete control.
        </Text>
        <Text style={styles.modeFeatures}>
          • Full customization{'\n'}
          • Enter existing character data{'\n'}
          • Complete control over all fields
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.modeCard, styles.randomMode]}
        onPress={() => handleModeSelection('random')}
      >
        <Text style={styles.modeTitle}>Full Random Generation</Text>
        <Text style={styles.modeDescription}>
          Generate a completely random character using D&D 3.5e rules. 
          Great for quick character creation or inspiration.
        </Text>
        <Text style={styles.modeFeatures}>
          • Roll 4d6 drop lowest for stats{'\n'}
          • Random race and class{'\n'}
          • Random alignment{'\n'}
          • Calculated derived stats
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.modeCard, styles.partialMode]}
        onPress={() => handleModeSelection('partial')}
      >
        <Text style={styles.modeTitle}>Partial Random Generation</Text>
        <Text style={styles.modeDescription}>
          Choose which aspects to randomize and which to set manually. 
          The best of both worlds for balanced character creation.
        </Text>
        <Text style={styles.modeFeatures}>
          • Choose what to randomize{'\n'}
          • Customize key decisions{'\n'}
          • Speed up tedious rolling
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCustomizeOptions = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Customize Generation</Text>
        <Text style={styles.subtitle}>Choose what to randomize</Text>
      </View>

      <View style={styles.optionsContainer}>
        {Object.entries(randomOptions).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[styles.optionCard, value && styles.optionCardActive]}
            onPress={() => handleRandomizeOption(key as keyof typeof randomOptions)}
          >
            <View style={styles.optionHeader}>
              <Text style={[styles.optionTitle, value && styles.optionTitleActive]}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Text>
              <View style={[styles.checkbox, value && styles.checkboxActive]}>
                {value && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </View>
            <Text style={[styles.optionDescription, value && styles.optionDescriptionActive]}>
              {getOptionDescription(key)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setStep('mode')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={applyPartialRandomization}
        >
          <Text style={styles.primaryButtonText}>Generate Character</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPreview = () => (
    <View style={styles.container}>
      <View style={styles.previewHeader}>
        <Text style={styles.title}>Character Preview</Text>
        <Text style={styles.subtitle}>
          {creationMode === 'manual' ? 'Fill in character details' : 'Review and edit your character'}
        </Text>
      </View>

      <View style={styles.nameInputContainer}>
        <Text style={styles.nameLabel}>Character Name *</Text>
        <TextInput
          style={styles.nameInput}
          value={character.name}
          onChangeText={(text) => setCharacter({ ...character, name: text })}
          placeholder="Enter character name"
        />
      </View>

      <View style={styles.characterFormContainer}>
        <CharacterForm
          character={character}
          onCharacterChange={setCharacter}
        />
      </View>

      <View style={styles.previewButtonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setStep(creationMode === 'partial' ? 'customize' : 'mode')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        {creationMode !== 'manual' && (
          <TouchableOpacity
            style={styles.rerollButton}
            onPress={() => {
              if (creationMode === 'random') {
                const randomData = generateRandomCharacter();
                const newCharacter = { ...createDefaultCharacter(), ...randomData };
                setCharacter(newCharacter);
              } else {
                applyPartialRandomization();
              }
            }}
          >
            <Text style={styles.rerollButtonText}>Reroll</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSaveCharacter}
        >
          <Text style={styles.primaryButtonText}>Save Character</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getOptionDescription = (key: string): string => {
    const descriptions: { [key: string]: string } = {
      randomizeStats: 'Roll 4d6 drop lowest for all ability scores',
      randomizeRace: 'Randomly select from available races',
      randomizeClass: 'Randomly select from available classes',
      randomizeAlignment: 'Randomly select character alignment',
      randomizeSkills: 'Automatically assign skill points (coming soon)',
      randomizeFeats: 'Automatically select feats (coming soon)',
    };
    return descriptions[key] || '';
  };

  switch (step) {
    case 'mode':
      return renderModeSelection();
    case 'customize':
      return renderCustomizeOptions();
    case 'preview':
      return renderPreview();
    default:
      return renderModeSelection();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  manualMode: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  randomMode: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  partialMode: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  modeFeatures: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
  backButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  optionTitleActive: {
    color: '#007AFF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  optionDescriptionActive: {
    color: '#005bb5',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  rerollButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  rerollButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  previewHeader: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  nameInputContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  nameLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  characterFormContainer: {
    flex: 1,
  },
  previewButtonContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 34,
  },
});
