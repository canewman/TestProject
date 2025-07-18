import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Character } from '../types/Character';
import { CharacterStorageService } from '../services/characterStorage';
import { CharacterForm } from '../components/CharacterForm';
import { createDefaultCharacter } from '../utils/dnd35Utils';

interface CharacterSheetProps {
  navigation: any;
  route: any;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ navigation, route }) => {
  const [character, setCharacter] = useState<Character>(createDefaultCharacter());
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadCharacter();
  }, []);

  useEffect(() => {
    // Set up navigation header
    navigation.setOptions({
      title: character.name || 'Character Sheet',
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSave}
          >
            <Text style={[styles.headerButtonText, hasUnsavedChanges && styles.unsavedText]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, character.name, hasUnsavedChanges]);

  const loadCharacter = async () => {
    try {
      setIsLoading(true);
      const characterId = route.params?.characterId;
      
      if (characterId) {
        const loadedCharacter = await CharacterStorageService.loadCharacter(characterId);
        if (loadedCharacter) {
          setCharacter(loadedCharacter);
          await CharacterStorageService.setCurrentCharacter(characterId);
        } else {
          Alert.alert('Error', 'Character not found');
          navigation.goBack();
        }
      } else {
        // No character ID provided, check for current character
        const currentCharacter = await CharacterStorageService.getCurrentCharacter();
        if (currentCharacter) {
          setCharacter(currentCharacter);
        } else {
          // No current character, use default
          const newCharacter = createDefaultCharacter();
          setCharacter(newCharacter);
          await CharacterStorageService.setCurrentCharacter(newCharacter.id);
        }
      }
    } catch (error) {
      console.error('Error loading character:', error);
      Alert.alert('Error', 'Failed to load character');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCharacterChange = (updatedCharacter: Character) => {
    setCharacter(updatedCharacter);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      await CharacterStorageService.saveCharacter(character);
      setHasUnsavedChanges(false);
      Alert.alert('Success', 'Character saved successfully!');
    } catch (error) {
      console.error('Error saving character:', error);
      Alert.alert('Error', 'Failed to save character');
    }
  };

  const handleAutoSave = async () => {
    try {
      await CharacterStorageService.saveCharacter(character);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, character]);

  // Handle back navigation with unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!hasUnsavedChanges) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save before leaving?',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Save',
            onPress: async () => {
              await handleSave();
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading character...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {hasUnsavedChanges && (
          <View style={styles.unsavedBanner}>
            <Text style={styles.unsavedBannerText}>
              You have unsaved changes • Auto-save in progress...
            </Text>
          </View>
        )}
        
        <CharacterForm
          character={character}
          onCharacterChange={handleCharacterChange}
        />
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.bottomButtonText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.bottomButton, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={[styles.bottomButtonText, styles.saveButtonText]}>
            {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => {
            Alert.alert(
              'Character Actions',
              'Choose an action',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Export Character',
                  onPress: async () => {
                    try {
                      const exportData = await CharacterStorageService.exportCharacter(character.id);
                      if (exportData) {
                        // In a real app, you'd implement sharing/export functionality here
                        Alert.alert('Export', 'Character export functionality would be implemented here');
                      }
                    } catch (error) {
                      Alert.alert('Error', 'Failed to export character');
                    }
                  },
                },
                {
                  text: 'Duplicate Character',
                  onPress: async () => {
                    try {
                      const duplicatedCharacter = {
                        ...character,
                        id: Date.now().toString(),
                        name: `${character.name} (Copy)`,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      };
                      await CharacterStorageService.saveCharacter(duplicatedCharacter);
                      Alert.alert('Success', 'Character duplicated successfully!');
                    } catch (error) {
                      Alert.alert('Error', 'Failed to duplicate character');
                    }
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.bottomButtonText}>More</Text>
        </TouchableOpacity>
      </View>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  unsavedText: {
    color: '#FF9500',
  },
  unsavedBanner: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEAA7',
  },
  unsavedBannerText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 34, // Extra padding for safe area
  },
  bottomButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  saveButtonText: {
    color: '#fff',
  },
});
