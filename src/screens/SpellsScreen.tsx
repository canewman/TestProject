import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { Character, Spell } from '../types/Character';
import { CharacterStorageService } from '../services/characterStorage';

interface SpellsScreenProps {
  navigation: any;
}

export const SpellsScreen: React.FC<SpellsScreenProps> = ({ navigation }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [showSpellModal, setShowSpellModal] = useState(false);
  const [showAddSpellModal, setShowAddSpellModal] = useState(false);
  const [newSpell, setNewSpell] = useState<Spell>({
    name: '',
    level: 0,
    school: '',
    description: '',
    prepared: false,
  });
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [filterSchool, setFilterSchool] = useState<string | null>(null);

  const spellSchools = [
    'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
    'Evocation', 'Illusion', 'Necromancy', 'Transmutation'
  ];

  useEffect(() => {
    loadCurrentCharacter();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: character ? `${character.name} - Spells` : 'Spells',
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowAddSpellModal(true)}
        >
          <Text style={styles.headerButtonText}>Add Spell</Text>
        </TouchableOpacity>
      ),
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

  const saveCharacter = async (updatedCharacter: Character) => {
    try {
      await CharacterStorageService.saveCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
    } catch (error) {
      console.error('Error saving character:', error);
      Alert.alert('Error', 'Failed to save character');
    }
  };

  const toggleSpellPrepared = async (spellIndex: number) => {
    if (!character) return;

    const updatedSpells = [...character.spells];
    updatedSpells[spellIndex] = {
      ...updatedSpells[spellIndex],
      prepared: !updatedSpells[spellIndex].prepared,
    };

    const updatedCharacter = {
      ...character,
      spells: updatedSpells,
    };

    await saveCharacter(updatedCharacter);
  };

  const addSpell = async () => {
    if (!character) return;

    if (!newSpell.name.trim()) {
      Alert.alert('Error', 'Please enter a spell name');
      return;
    }

    const updatedSpells = [...character.spells, { ...newSpell }];
    const updatedCharacter = {
      ...character,
      spells: updatedSpells,
    };

    await saveCharacter(updatedCharacter);
    
    setNewSpell({
      name: '',
      level: 0,
      school: '',
      description: '',
      prepared: false,
    });
    setShowAddSpellModal(false);
    Alert.alert('Success', 'Spell added successfully!');
  };

  const removeSpell = async (spellIndex: number) => {
    if (!character) return;

    const spellName = character.spells[spellIndex].name;
    
    Alert.alert(
      'Remove Spell',
      `Are you sure you want to remove "${spellName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedSpells = character.spells.filter((_, index) => index !== spellIndex);
            const updatedCharacter = {
              ...character,
              spells: updatedSpells,
            };
            await saveCharacter(updatedCharacter);
          },
        },
      ]
    );
  };

  const getFilteredSpells = () => {
    if (!character) return [];

    let filtered = character.spells;

    if (filterLevel !== null) {
      filtered = filtered.filter(spell => spell.level === filterLevel);
    }

    if (filterSchool) {
      filtered = filtered.filter(spell => 
        spell.school.toLowerCase() === filterSchool.toLowerCase()
      );
    }

    return filtered.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.name.localeCompare(b.name);
    });
  };

  const getSpellsByLevel = () => {
    if (!character) return {};

    const spellsByLevel: { [level: number]: Spell[] } = {};
    
    character.spells.forEach(spell => {
      if (!spellsByLevel[spell.level]) {
        spellsByLevel[spell.level] = [];
      }
      spellsByLevel[spell.level].push(spell);
    });

    // Sort spells within each level
    Object.keys(spellsByLevel).forEach(level => {
      spellsByLevel[parseInt(level)].sort((a, b) => a.name.localeCompare(b.name));
    });

    return spellsByLevel;
  };

  const renderSpellCard = (spell: Spell, index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.spellCard, spell.prepared && styles.preparedSpell]}
      onPress={() => {
        setSelectedSpell(spell);
        setShowSpellModal(true);
      }}
      onLongPress={() => removeSpell(index)}
    >
      <View style={styles.spellHeader}>
        <Text style={styles.spellName}>{spell.name}</Text>
        <TouchableOpacity
          style={[styles.preparedButton, spell.prepared && styles.preparedButtonActive]}
          onPress={() => toggleSpellPrepared(index)}
        >
          <Text style={[styles.preparedButtonText, spell.prepared && styles.preparedButtonTextActive]}>
            {spell.prepared ? 'Prepared' : 'Prepare'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.spellInfo}>
        <Text style={styles.spellLevel}>Level {spell.level}</Text>
        <Text style={styles.spellSchool}>{spell.school}</Text>
      </View>
      {spell.description && (
        <Text style={styles.spellPreview} numberOfLines={2}>
          {spell.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderSpellModal = () => (
    <Modal
      visible={showSpellModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSpellModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{selectedSpell?.name}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowSpellModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
        
        {selectedSpell && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.spellDetailHeader}>
              <Text style={styles.spellDetailLevel}>Level {selectedSpell.level}</Text>
              <Text style={styles.spellDetailSchool}>{selectedSpell.school}</Text>
              <Text style={[
                styles.spellDetailPrepared,
                selectedSpell.prepared && styles.spellDetailPreparedActive
              ]}>
                {selectedSpell.prepared ? 'Prepared' : 'Not Prepared'}
              </Text>
            </View>
            
            <View style={styles.spellDescription}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>
                {selectedSpell.description || 'No description available.'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.togglePreparedButton, selectedSpell.prepared && styles.togglePreparedButtonActive]}
              onPress={() => {
                const spellIndex = character?.spells.findIndex(s => s === selectedSpell);
                if (spellIndex !== undefined && spellIndex >= 0) {
                  toggleSpellPrepared(spellIndex);
                  setSelectedSpell({
                    ...selectedSpell,
                    prepared: !selectedSpell.prepared,
                  });
                }
              }}
            >
              <Text style={[styles.togglePreparedButtonText, selectedSpell.prepared && styles.togglePreparedButtonTextActive]}>
                {selectedSpell.prepared ? 'Remove from Prepared' : 'Mark as Prepared'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  const renderAddSpellModal = () => (
    <Modal
      visible={showAddSpellModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddSpellModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add New Spell</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowAddSpellModal(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Spell Name *</Text>
            <TextInput
              style={styles.textInput}
              value={newSpell.name}
              onChangeText={(text) => setNewSpell({ ...newSpell, name: text })}
              placeholder="Enter spell name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Level</Text>
            <View style={styles.levelContainer}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[styles.levelButton, newSpell.level === level && styles.levelButtonActive]}
                  onPress={() => setNewSpell({ ...newSpell, level })}
                >
                  <Text style={[styles.levelButtonText, newSpell.level === level && styles.levelButtonTextActive]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>School</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.schoolContainer}>
              {spellSchools.map(school => (
                <TouchableOpacity
                  key={school}
                  style={[styles.schoolButton, newSpell.school === school && styles.schoolButtonActive]}
                  onPress={() => setNewSpell({ ...newSpell, school })}
                >
                  <Text style={[styles.schoolButtonText, newSpell.school === school && styles.schoolButtonTextActive]}>
                    {school}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={newSpell.description}
              onChangeText={(text) => setNewSpell({ ...newSpell, description: text })}
              placeholder="Enter spell description..."
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={addSpell}>
            <Text style={styles.addButtonText}>Add Spell</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading spells...</Text>
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

  const spellsByLevel = getSpellsByLevel();
  const levels = Object.keys(spellsByLevel).map(Number).sort((a, b) => a - b);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Character Info */}
        <View style={styles.characterInfo}>
          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={styles.characterDetails}>
            {character.spells.length} spell{character.spells.length !== 1 ? 's' : ''} • {character.spells.filter(s => s.prepared).length} prepared
          </Text>
        </View>

        {/* Filter Options */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Filter by Level:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterButton, filterLevel === null && styles.filterButtonActive]}
              onPress={() => setFilterLevel(null)}
            >
              <Text style={[styles.filterButtonText, filterLevel === null && styles.filterButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
              <TouchableOpacity
                key={level}
                style={[styles.filterButton, filterLevel === level && styles.filterButtonActive]}
                onPress={() => setFilterLevel(level)}
              >
                <Text style={[styles.filterButtonText, filterLevel === level && styles.filterButtonTextActive]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Spells by Level */}
        {character.spells.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No spells found</Text>
            <Text style={styles.emptyStateSubtext}>
              Add spells using the "Add Spell" button above
            </Text>
          </View>
        ) : (
          levels.map(level => (
            <View key={level} style={styles.levelSection}>
              <Text style={styles.levelTitle}>
                Level {level} Spells ({spellsByLevel[level].length})
              </Text>
              {spellsByLevel[level].map((spell, index) => {
                const originalIndex = character.spells.findIndex(s => s === spell);
                return renderSpellCard(spell, originalIndex);
              })}
            </View>
          ))
        )}
      </ScrollView>

      {renderSpellModal()}
      {renderAddSpellModal()}
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
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButtonText: {
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
  filterContainer: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  levelSection: {
    marginBottom: 20,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  spellCard: {
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
    borderLeftColor: '#9C27B0',
  },
  preparedSpell: {
    borderLeftColor: '#4CAF50',
  },
  spellHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spellName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  preparedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  preparedButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  preparedButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  preparedButtonTextActive: {
    color: '#fff',
  },
  spellInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  spellLevel: {
    fontSize: 14,
    color: '#9C27B0',
    fontWeight: '600',
    marginRight: 16,
  },
  spellSchool: {
    fontSize: 14,
    color: '#666',
  },
  spellPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  spellDetailHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  spellDetailLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 4,
  },
  spellDetailSchool: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  spellDetailPrepared: {
    fontSize: 14,
    color: '#999',
  },
  spellDetailPreparedActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  spellDescription: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  togglePreparedButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  togglePreparedButtonActive: {
    backgroundColor: '#4CAF50',
  },
  togglePreparedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  togglePreparedButtonTextActive: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
  },
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  levelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  levelButtonActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  levelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  levelButtonTextActive: {
    color: '#fff',
  },
  schoolContainer: {
    flexDirection: 'row',
  },
  schoolButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  schoolButtonActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  schoolButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  schoolButtonTextActive: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
