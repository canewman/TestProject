import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, CharacterProfile } from '../types/Character';

const CHARACTERS_KEY = 'dnd35_characters';
const PROFILES_KEY = 'dnd35_character_profiles';
const CURRENT_CHARACTER_KEY = 'dnd35_current_character';

export class CharacterStorageService {
  // Save a character
  static async saveCharacter(character: Character): Promise<void> {
    try {
      // Update the character's updatedAt timestamp
      character.updatedAt = new Date();
      
      // Get existing characters
      const existingCharacters = await this.getAllCharacters();
      
      // Find and update existing character or add new one
      const characterIndex = existingCharacters.findIndex(c => c.id === character.id);
      if (characterIndex >= 0) {
        existingCharacters[characterIndex] = character;
      } else {
        existingCharacters.push(character);
      }
      
      // Save updated characters list
      await AsyncStorage.setItem(CHARACTERS_KEY, JSON.stringify(existingCharacters));
      
      // Update character profiles
      await this.updateCharacterProfile(character);
      
      console.log(`Character "${character.name}" saved successfully`);
    } catch (error) {
      console.error('Error saving character:', error);
      throw new Error('Failed to save character');
    }
  }

  // Load a character by ID
  static async loadCharacter(characterId: string): Promise<Character | null> {
    try {
      const characters = await this.getAllCharacters();
      const character = characters.find(c => c.id === characterId);
      
      if (character) {
        // Set as current character
        await AsyncStorage.setItem(CURRENT_CHARACTER_KEY, characterId);
        console.log(`Character "${character.name}" loaded successfully`);
        return character;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading character:', error);
      throw new Error('Failed to load character');
    }
  }

  // Get all characters
  static async getAllCharacters(): Promise<Character[]> {
    try {
      const charactersJson = await AsyncStorage.getItem(CHARACTERS_KEY);
      if (charactersJson) {
        const characters = JSON.parse(charactersJson);
        // Convert date strings back to Date objects
        return characters.map((char: any) => ({
          ...char,
          createdAt: new Date(char.createdAt),
          updatedAt: new Date(char.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting all characters:', error);
      return [];
    }
  }

  // Get character profiles (lightweight version for listing)
  static async getCharacterProfiles(): Promise<CharacterProfile[]> {
    try {
      const profilesJson = await AsyncStorage.getItem(PROFILES_KEY);
      if (profilesJson) {
        const profiles = JSON.parse(profilesJson);
        return profiles.map((profile: any) => ({
          ...profile,
          lastPlayed: new Date(profile.lastPlayed),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting character profiles:', error);
      return [];
    }
  }

  // Update character profile
  private static async updateCharacterProfile(character: Character): Promise<void> {
    try {
      const profiles = await this.getCharacterProfiles();
      
      const profile: CharacterProfile = {
        id: character.id,
        name: character.name,
        level: character.level,
        race: character.race,
        characterClass: character.characterClass,
        lastPlayed: new Date(),
      };
      
      const profileIndex = profiles.findIndex(p => p.id === character.id);
      if (profileIndex >= 0) {
        profiles[profileIndex] = profile;
      } else {
        profiles.push(profile);
      }
      
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error('Error updating character profile:', error);
    }
  }

  // Delete a character
  static async deleteCharacter(characterId: string): Promise<void> {
    try {
      // Remove from characters
      const characters = await this.getAllCharacters();
      const updatedCharacters = characters.filter(c => c.id !== characterId);
      await AsyncStorage.setItem(CHARACTERS_KEY, JSON.stringify(updatedCharacters));
      
      // Remove from profiles
      const profiles = await this.getCharacterProfiles();
      const updatedProfiles = profiles.filter(p => p.id !== characterId);
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles));
      
      // Clear current character if it was deleted
      const currentCharacterId = await AsyncStorage.getItem(CURRENT_CHARACTER_KEY);
      if (currentCharacterId === characterId) {
        await AsyncStorage.removeItem(CURRENT_CHARACTER_KEY);
      }
      
      console.log(`Character with ID "${characterId}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting character:', error);
      throw new Error('Failed to delete character');
    }
  }

  // Get current character ID
  static async getCurrentCharacterId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(CURRENT_CHARACTER_KEY);
    } catch (error) {
      console.error('Error getting current character ID:', error);
      return null;
    }
  }

  // Set current character
  static async setCurrentCharacter(characterId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENT_CHARACTER_KEY, characterId);
    } catch (error) {
      console.error('Error setting current character:', error);
    }
  }

  // Get current character
  static async getCurrentCharacter(): Promise<Character | null> {
    try {
      const currentCharacterId = await this.getCurrentCharacterId();
      if (currentCharacterId) {
        return await this.loadCharacter(currentCharacterId);
      }
      return null;
    } catch (error) {
      console.error('Error getting current character:', error);
      return null;
    }
  }

  // Clear all data (for testing/debugging)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CHARACTERS_KEY, PROFILES_KEY, CURRENT_CHARACTER_KEY]);
      console.log('All character data cleared');
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  // Export character data (returns JSON string)
  static async exportCharacter(characterId: string): Promise<string | null> {
    try {
      const character = await this.loadCharacter(characterId);
      if (character) {
        return JSON.stringify(character, null, 2);
      }
      return null;
    } catch (error) {
      console.error('Error exporting character:', error);
      return null;
    }
  }

  // Import character data (from JSON string)
  static async importCharacter(characterJson: string): Promise<Character> {
    try {
      const character = JSON.parse(characterJson) as Character;
      
      // Generate new ID to avoid conflicts
      character.id = Date.now().toString();
      character.createdAt = new Date();
      character.updatedAt = new Date();
      
      await this.saveCharacter(character);
      return character;
    } catch (error) {
      console.error('Error importing character:', error);
      throw new Error('Failed to import character');
    }
  }
}
