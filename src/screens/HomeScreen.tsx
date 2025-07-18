import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { CharacterProfile } from '../types/Character';
import { CharacterStorageService } from '../services/characterStorage';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [characterProfiles, setCharacterProfiles] = useState<CharacterProfile[]>([]);
  const [currentCharacterName, setCurrentCharacterName] = useState<string>('');
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadCharacterProfiles();
    getCurrentCharacterName();
  }, [refreshKey]);

  // Focus listener to refresh when coming back from other screens
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setRefreshKey(prev => prev + 1);
    });

    return unsubscribe;
  }, [navigation]);

  const loadCharacterProfiles = async () => {
    try {
      const profiles = await CharacterStorageService.getCharacterProfiles();
      setCharacterProfiles(profiles.sort((a, b) => b.lastPlayed.getTime() - a.lastPlayed.getTime()));
    } catch (error) {
      console.error('Error loading character profiles:', error);
      Alert.alert('Error', 'Failed to load character profiles');
    }
  };

  const getCurrentCharacterName = async () => {
    try {
      const currentCharacter = await CharacterStorageService.getCurrentCharacter();
      setCurrentCharacterName(currentCharacter?.name || 'No character loaded');
    } catch (error) {
      console.error('Error getting current character:', error);
      setCurrentCharacterName('No character loaded');
    }
  };

  const handleLoadCharacter = (profile: CharacterProfile) => {
    setShowLoadModal(false);
    navigation.navigate('CharacterSheet', { characterId: profile.id });
  };

  const handleSaveCharacter = async () => {
    try {
      const currentCharacter = await CharacterStorageService.getCurrentCharacter();
      if (currentCharacter) {
        await CharacterStorageService.saveCharacter(currentCharacter);
        Alert.alert('Success', `Character "${currentCharacter.name}" saved successfully!`);
        setRefreshKey(prev => prev + 1);
      } else {
        Alert.alert('No Character', 'No character is currently loaded to save.');
      }
    } catch (error) {
      console.error('Error saving character:', error);
      Alert.alert('Error', 'Failed to save character');
    }
  };

  const handleDeleteCharacter = async (characterId: string, characterName: string) => {
    Alert.alert(
      'Delete Character',
      `Are you sure you want to delete "${characterName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CharacterStorageService.deleteCharacter(characterId);
              setRefreshKey(prev => prev + 1);
              Alert.alert('Success', `Character "${characterName}" deleted successfully`);
            } catch (error) {
              console.error('Error deleting character:', error);
              Alert.alert('Error', 'Failed to delete character');
            }
          },
        },
      ]
    );
  };

  const handleCustomizeUI = () => {
    Alert.alert(
      'Customize UI',
      'UI customization features will be available in a future update!',
      [{ text: 'OK' }]
    );
  };

  const renderCharacterProfile = ({ item }: { item: CharacterProfile }) => (
    <TouchableOpacity
      style={styles.characterCard}
      onPress={() => handleLoadCharacter(item)}
      onLongPress={() => handleDeleteCharacter(item.id, item.name)}
    >
      <View style={styles.characterInfo}>
        <Text style={styles.characterName}>{item.name}</Text>
        <Text style={styles.characterDetails}>
          Level {item.level} {item.race} {item.characterClass}
        </Text>
        <Text style={styles.lastPlayed}>
          Last played: {item.lastPlayed.toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.characterActions}>
        <Text style={styles.tapText}>Tap to load</Text>
        <Text style={styles.holdText}>Hold to delete</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>D&D 3.5e Character Manager</Text>
        <Text style={styles.subtitle}>Current Character: {currentCharacterName}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity
          style={[styles.menuButton, styles.primaryButton]}
          onPress={() => setShowLoadModal(true)}
        >
          <Text style={styles.menuButtonText}>Load Character</Text>
          <Text style={styles.menuButtonSubtext}>
            {characterProfiles.length} character{characterProfiles.length !== 1 ? 's' : ''} available
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.secondaryButton]}
          onPress={handleSaveCharacter}
        >
          <Text style={styles.menuButtonText}>Save Character</Text>
          <Text style={styles.menuButtonSubtext}>Save current character progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.primaryButton]}
          onPress={() => navigation.navigate('CreateCharacter')}
        >
          <Text style={styles.menuButtonText}>Create New Character</Text>
          <Text style={styles.menuButtonSubtext}>Start a new character adventure</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.actionButton]}
          onPress={() => navigation.navigate('Actions')}
        >
          <Text style={styles.menuButtonText}>Actions</Text>
          <Text style={styles.menuButtonSubtext}>Roll dice, cast spells, and take actions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.tertiaryButton]}
          onPress={handleCustomizeUI}
        >
          <Text style={styles.menuButtonText}>Customize UI</Text>
          <Text style={styles.menuButtonSubtext}>Personalize your experience</Text>
        </TouchableOpacity>

        {characterProfiles.length > 0 && (
          <View style={styles.recentCharactersSection}>
            <Text style={styles.sectionTitle}>Recent Characters</Text>
            {characterProfiles.slice(0, 3).map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={styles.recentCharacterCard}
                onPress={() => handleLoadCharacter(profile)}
              >
                <Text style={styles.recentCharacterName}>{profile.name}</Text>
                <Text style={styles.recentCharacterDetails}>
                  Lv.{profile.level} {profile.race} {profile.characterClass}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showLoadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLoadModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Load Character</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLoadModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {characterProfiles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No characters found</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first character to get started!
              </Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => {
                  setShowLoadModal(false);
                  navigation.navigate('CreateCharacter');
                }}
              >
                <Text style={styles.createFirstButtonText}>Create Character</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={characterProfiles}
              renderItem={renderCharacterProfile}
              keyExtractor={(item) => item.id}
              style={styles.characterList}
              contentContainerStyle={styles.characterListContent}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  menuButton: {
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
  primaryButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  secondaryButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  tertiaryButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  actionButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  menuButtonSubtext: {
    fontSize: 14,
    color: '#666',
  },
  recentCharactersSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  recentCharacterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentCharacterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recentCharacterDetails: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
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
  characterList: {
    flex: 1,
  },
  characterListContent: {
    padding: 20,
  },
  characterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  characterInfo: {
    marginBottom: 8,
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  characterDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastPlayed: {
    fontSize: 12,
    color: '#999',
  },
  characterActions: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  tapText: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
  },
  holdText: {
    fontSize: 12,
    color: '#FF3B30',
    textAlign: 'center',
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
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
