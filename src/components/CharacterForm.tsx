import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Character, AbilityScores, Skill, Feat, Equipment, Attack } from '../types/Character';
import { calculateAllAbilityModifiers, RACES, CLASSES, ALIGNMENTS, SKILLS_LIST } from '../utils/dnd35Utils';

interface CharacterFormProps {
  character: Character;
  onCharacterChange: (character: Character) => void;
  readOnly?: boolean;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({
  character,
  onCharacterChange,
  readOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState('basics');

  // Update ability modifiers when ability scores change
  useEffect(() => {
    const updatedModifiers = calculateAllAbilityModifiers(character.abilityScores);
    if (JSON.stringify(updatedModifiers) !== JSON.stringify(character.abilityModifiers)) {
      onCharacterChange({
        ...character,
        abilityModifiers: updatedModifiers,
      });
    }
  }, [character.abilityScores]);

  const updateCharacter = (updates: Partial<Character>) => {
    onCharacterChange({ ...character, ...updates });
  };

  const updateAbilityScore = (ability: keyof AbilityScores, value: string) => {
    const numValue = parseInt(value) || 0;
    updateCharacter({
      abilityScores: {
        ...character.abilityScores,
        [ability]: numValue,
      },
    });
  };

  const updateSkill = (index: number, field: keyof Skill, value: any) => {
    const updatedSkills = [...character.skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    updateCharacter({ skills: updatedSkills });
  };

  const addFeat = () => {
    const newFeat: Feat = {
      name: 'New Feat',
      description: '',
      prerequisites: '',
    };
    updateCharacter({
      feats: [...character.feats, newFeat],
    });
  };

  const updateFeat = (index: number, field: keyof Feat, value: string) => {
    const updatedFeats = [...character.feats];
    updatedFeats[index] = { ...updatedFeats[index], [field]: value };
    updateCharacter({ feats: updatedFeats });
  };

  const removeFeat = (index: number) => {
    const updatedFeats = character.feats.filter((_, i) => i !== index);
    updateCharacter({ feats: updatedFeats });
  };

  const addEquipment = () => {
    const newEquipment: Equipment = {
      name: 'New Item',
      quantity: 1,
      weight: 0,
      description: '',
      equipped: false,
    };
    updateCharacter({
      equipment: [...character.equipment, newEquipment],
    });
  };

  const updateEquipment = (index: number, field: keyof Equipment, value: any) => {
    const updatedEquipment = [...character.equipment];
    updatedEquipment[index] = { ...updatedEquipment[index], [field]: value };
    updateCharacter({ equipment: updatedEquipment });
  };

  const removeEquipment = (index: number) => {
    const updatedEquipment = character.equipment.filter((_, i) => i !== index);
    updateCharacter({ equipment: updatedEquipment });
  };

  const addAttack = () => {
    const newAttack: Attack = {
      name: 'New Attack',
      attackBonus: 0,
      damage: '1d4',
      critical: '20/x2',
      range: 'Melee',
      type: 'Slashing',
    };
    updateCharacter({
      attacks: [...character.attacks, newAttack],
    });
  };

  const updateAttack = (index: number, field: keyof Attack, value: any) => {
    const updatedAttacks = [...character.attacks];
    updatedAttacks[index] = { ...updatedAttacks[index], [field]: value };
    updateCharacter({ attacks: updatedAttacks });
  };

  const removeAttack = (index: number) => {
    const updatedAttacks = character.attacks.filter((_, i) => i !== index);
    updateCharacter({ attacks: updatedAttacks });
  };

  const renderTabButton = (tabKey: string, title: string) => (
    <TouchableOpacity
      key={tabKey}
      style={[styles.tabButton, activeTab === tabKey && styles.activeTabButton]}
      onPress={() => setActiveTab(tabKey)}
    >
      <Text style={[styles.tabButtonText, activeTab === tabKey && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderTextInput = (
    label: string,
    value: string | number,
    onChangeText: (text: string) => void,
    placeholder?: string,
    keyboardType: 'default' | 'numeric' = 'default'
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, readOnly && styles.readOnlyInput]}
        value={value.toString()}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        editable={!readOnly}
      />
    </View>
  );

  const renderBasicsTab = () => (
    <ScrollView style={styles.tabContent}>
      {renderTextInput('Character Name', character.name, (text) => updateCharacter({ name: text }))}
      {renderTextInput('Player Name', character.playerName, (text) => updateCharacter({ playerName: text }))}
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Race</Text>
        {readOnly ? (
          <Text style={styles.readOnlyText}>{character.race}</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
            {RACES.map((race) => (
              <TouchableOpacity
                key={race}
                style={[styles.optionButton, character.race === race && styles.selectedOption]}
                onPress={() => updateCharacter({ race })}
              >
                <Text style={[styles.optionText, character.race === race && styles.selectedOptionText]}>
                  {race}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Class</Text>
        {readOnly ? (
          <Text style={styles.readOnlyText}>{character.characterClass}</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
            {CLASSES.map((characterClass) => (
              <TouchableOpacity
                key={characterClass}
                style={[styles.optionButton, character.characterClass === characterClass && styles.selectedOption]}
                onPress={() => updateCharacter({ characterClass })}
              >
                <Text style={[styles.optionText, character.characterClass === characterClass && styles.selectedOptionText]}>
                  {characterClass}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {renderTextInput('Level', character.level, (text) => updateCharacter({ level: parseInt(text) || 1 }), '1', 'numeric')}
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Alignment</Text>
        {readOnly ? (
          <Text style={styles.readOnlyText}>{character.alignment}</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
            {ALIGNMENTS.map((alignment) => (
              <TouchableOpacity
                key={alignment}
                style={[styles.optionButton, character.alignment === alignment && styles.selectedOption]}
                onPress={() => updateCharacter({ alignment })}
              >
                <Text style={[styles.optionText, character.alignment === alignment && styles.selectedOptionText]}>
                  {alignment}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {renderTextInput('Deity', character.deity, (text) => updateCharacter({ deity: text }))}
      {renderTextInput('Age', character.age, (text) => updateCharacter({ age: parseInt(text) || 0 }), '25', 'numeric')}
      {renderTextInput('Gender', character.gender, (text) => updateCharacter({ gender: text }))}
      {renderTextInput('Height', character.height, (text) => updateCharacter({ height: text }))}
      {renderTextInput('Weight', character.weight, (text) => updateCharacter({ weight: text }))}
      {renderTextInput('Eyes', character.eyes, (text) => updateCharacter({ eyes: text }))}
      {renderTextInput('Hair', character.hair, (text) => updateCharacter({ hair: text }))}
      {renderTextInput('Skin', character.skin, (text) => updateCharacter({ skin: text }))}
    </ScrollView>
  );

  const renderStatsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Ability Scores</Text>
      {Object.entries(character.abilityScores).map(([ability, score]) => (
        <View key={ability} style={styles.abilityScoreRow}>
          <Text style={styles.abilityLabel}>{ability.charAt(0).toUpperCase() + ability.slice(1)}</Text>
          <TextInput
            style={[styles.abilityInput, readOnly && styles.readOnlyInput]}
            value={score.toString()}
            onChangeText={(text) => updateAbilityScore(ability as keyof AbilityScores, text)}
            keyboardType="numeric"
            editable={!readOnly}
          />
          <Text style={styles.modifierText}>
            ({character.abilityModifiers[ability as keyof AbilityScores] >= 0 ? '+' : ''}
            {character.abilityModifiers[ability as keyof AbilityScores]})
          </Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Hit Points</Text>
      <View style={styles.hitPointsContainer}>
        {renderTextInput(
          'Current HP',
          character.hitPoints.current,
          (text) => updateCharacter({
            hitPoints: { ...character.hitPoints, current: parseInt(text) || 0 }
          }),
          undefined,
          'numeric'
        )}
        {renderTextInput(
          'Maximum HP',
          character.hitPoints.maximum,
          (text) => updateCharacter({
            hitPoints: { ...character.hitPoints, maximum: parseInt(text) || 0 }
          }),
          undefined,
          'numeric'
        )}
        {renderTextInput(
          'Temporary HP',
          character.hitPoints.temporary,
          (text) => updateCharacter({
            hitPoints: { ...character.hitPoints, temporary: parseInt(text) || 0 }
          }),
          undefined,
          'numeric'
        )}
      </View>

      <Text style={styles.sectionTitle}>Armor Class</Text>
      <View style={styles.armorClassContainer}>
        <Text style={styles.acTotal}>Total AC: {character.armorClass.total}</Text>
        {renderTextInput(
          'Armor',
          character.armorClass.armor,
          (text) => updateCharacter({
            armorClass: { ...character.armorClass, armor: parseInt(text) || 0 }
          }),
          undefined,
          'numeric'
        )}
        {renderTextInput(
          'Shield',
          character.armorClass.shield,
          (text) => updateCharacter({
            armorClass: { ...character.armorClass, shield: parseInt(text) || 0 }
          }),
          undefined,
          'numeric'
        )}
        <Text style={styles.acBreakdown}>
          10 + {character.armorClass.armor} (armor) + {character.armorClass.shield} (shield) + {character.armorClass.dex} (dex) + {character.armorClass.size} (size) + {character.armorClass.natural} (natural) + {character.armorClass.deflection} (deflection) + {character.armorClass.misc} (misc)
        </Text>
      </View>

      {renderTextInput('Base Attack Bonus', character.baseAttackBonus, (text) => updateCharacter({ baseAttackBonus: parseInt(text) || 0 }), undefined, 'numeric')}

      <Text style={styles.sectionTitle}>Saving Throws</Text>
      {renderTextInput(
        'Fortitude',
        character.savingThrows.fortitude,
        (text) => updateCharacter({
          savingThrows: { ...character.savingThrows, fortitude: parseInt(text) || 0 }
        }),
        undefined,
        'numeric'
      )}
      {renderTextInput(
        'Reflex',
        character.savingThrows.reflex,
        (text) => updateCharacter({
          savingThrows: { ...character.savingThrows, reflex: parseInt(text) || 0 }
        }),
        undefined,
        'numeric'
      )}
      {renderTextInput(
        'Will',
        character.savingThrows.will,
        (text) => updateCharacter({
          savingThrows: { ...character.savingThrows, will: parseInt(text) || 0 }
        }),
        undefined,
        'numeric'
      )}
    </ScrollView>
  );

  const renderSkillsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Skills</Text>
      {character.skills.map((skill, index) => (
        <View key={skill.name} style={styles.skillRow}>
          <Text style={styles.skillName}>{skill.name}</Text>
          <TextInput
            style={[styles.skillInput, readOnly && styles.readOnlyInput]}
            value={skill.ranks.toString()}
            onChangeText={(text) => updateSkill(index, 'ranks', parseInt(text) || 0)}
            keyboardType="numeric"
            placeholder="Ranks"
            editable={!readOnly}
          />
          <TouchableOpacity
            style={[styles.classSkillButton, skill.isClassSkill && styles.classSkillActive]}
            onPress={() => !readOnly && updateSkill(index, 'isClassSkill', !skill.isClassSkill)}
            disabled={readOnly}
          >
            <Text style={styles.classSkillText}>Class</Text>
          </TouchableOpacity>
          <Text style={styles.skillTotal}>
            Total: {skill.ranks + character.abilityModifiers[skill.abilityScore] + skill.miscModifier + (skill.isClassSkill && skill.ranks > 0 ? 3 : 0)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderFeatsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Feats</Text>
        {!readOnly && (
          <TouchableOpacity style={styles.addButton} onPress={addFeat}>
            <Text style={styles.addButtonText}>Add Feat</Text>
          </TouchableOpacity>
        )}
      </View>
      {character.feats.map((feat, index) => (
        <View key={index} style={styles.featContainer}>
          <TextInput
            style={[styles.featName, readOnly && styles.readOnlyInput]}
            value={feat.name}
            onChangeText={(text) => updateFeat(index, 'name', text)}
            placeholder="Feat Name"
            editable={!readOnly}
          />
          <TextInput
            style={[styles.featDescription, readOnly && styles.readOnlyInput]}
            value={feat.description}
            onChangeText={(text) => updateFeat(index, 'description', text)}
            placeholder="Description"
            multiline
            editable={!readOnly}
          />
          <TextInput
            style={[styles.featPrerequisites, readOnly && styles.readOnlyInput]}
            value={feat.prerequisites}
            onChangeText={(text) => updateFeat(index, 'prerequisites', text)}
            placeholder="Prerequisites"
            editable={!readOnly}
          />
          {!readOnly && (
            <TouchableOpacity style={styles.removeButton} onPress={() => removeFeat(index)}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderCombatTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Attacks</Text>
        {!readOnly && (
          <TouchableOpacity style={styles.addButton} onPress={addAttack}>
            <Text style={styles.addButtonText}>Add Attack</Text>
          </TouchableOpacity>
        )}
      </View>
      {character.attacks.map((attack, index) => (
        <View key={index} style={styles.attackContainer}>
          <TextInput
            style={[styles.attackName, readOnly && styles.readOnlyInput]}
            value={attack.name}
            onChangeText={(text) => updateAttack(index, 'name', text)}
            placeholder="Attack Name"
            editable={!readOnly}
          />
          <View style={styles.attackRow}>
            <TextInput
              style={[styles.attackInput, readOnly && styles.readOnlyInput]}
              value={attack.attackBonus.toString()}
              onChangeText={(text) => updateAttack(index, 'attackBonus', parseInt(text) || 0)}
              placeholder="Attack Bonus"
              keyboardType="numeric"
              editable={!readOnly}
            />
            <TextInput
              style={[styles.attackInput, readOnly && styles.readOnlyInput]}
              value={attack.damage}
              onChangeText={(text) => updateAttack(index, 'damage', text)}
              placeholder="Damage"
              editable={!readOnly}
            />
            <TextInput
              style={[styles.attackInput, readOnly && styles.readOnlyInput]}
              value={attack.critical}
              onChangeText={(text) => updateAttack(index, 'critical', text)}
              placeholder="Critical"
              editable={!readOnly}
            />
          </View>
          {!readOnly && (
            <TouchableOpacity style={styles.removeButton} onPress={() => removeAttack(index)}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderEquipmentTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Equipment</Text>
        {!readOnly && (
          <TouchableOpacity style={styles.addButton} onPress={addEquipment}>
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        )}
      </View>
      {character.equipment.map((item, index) => (
        <View key={index} style={styles.equipmentContainer}>
          <TextInput
            style={[styles.equipmentName, readOnly && styles.readOnlyInput]}
            value={item.name}
            onChangeText={(text) => updateEquipment(index, 'name', text)}
            placeholder="Item Name"
            editable={!readOnly}
          />
          <View style={styles.equipmentRow}>
            <TextInput
              style={[styles.equipmentInput, readOnly && styles.readOnlyInput]}
              value={item.quantity.toString()}
              onChangeText={(text) => updateEquipment(index, 'quantity', parseInt(text) || 1)}
              placeholder="Qty"
              keyboardType="numeric"
              editable={!readOnly}
            />
            <TextInput
              style={[styles.equipmentInput, readOnly && styles.readOnlyInput]}
              value={item.weight.toString()}
              onChangeText={(text) => updateEquipment(index, 'weight', parseFloat(text) || 0)}
              placeholder="Weight"
              keyboardType="numeric"
              editable={!readOnly}
            />
            <TouchableOpacity
              style={[styles.equippedButton, item.equipped && styles.equippedActive]}
              onPress={() => !readOnly && updateEquipment(index, 'equipped', !item.equipped)}
              disabled={readOnly}
            >
              <Text style={styles.equippedText}>Equipped</Text>
            </TouchableOpacity>
          </View>
          {!readOnly && (
            <TouchableOpacity style={styles.removeButton} onPress={() => removeEquipment(index)}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Money</Text>
      <View style={styles.moneyContainer}>
        {renderTextInput(
          'Platinum',
          character.money.platinum,
          (text) => updateCharacter({
            money: { ...character.money, platinum: parseInt(text) || 0 }
          }),
          undefined,
          'numeric'
        )}
        {renderTextInput(
          'Gold',
          character.money.gold,
          (text) => updateCharacter({
            money: { ...character.money, gold: parseInt(text) || 0 }
          }),
          undefined,
          'numeric'
        )}
        {renderTextInput(
          'Silver',
          character.money.silver,
          (text) => updateCharacter({
            money: { ...character.money, silver: parseInt(text) || 0 }
          }),
          undefined,
          'numeric'
        )}
        {renderTextInput(
          'Copper',
          character.money.copper,
          (text) => updateCharacter({
            money: { ...character.money, copper: parseInt(text) || 0 }
          }),
          undefined,
          'numeric'
        )}
      </View>
    </ScrollView>
  );

  const renderNotesTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Notes</Text>
      <TextInput
        style={[styles.notesInput, readOnly && styles.readOnlyInput]}
        value={character.notes}
        onChangeText={(text) => updateCharacter({ notes: text })}
        placeholder="Character notes, backstory, etc..."
        multiline
        textAlignVertical="top"
        editable={!readOnly}
      />
    </ScrollView>
  );

  const tabs = [
    { key: 'basics', title: 'Basics', render: renderBasicsTab },
    { key: 'stats', title: 'Stats', render: renderStatsTab },
    { key: 'skills', title: 'Skills', render: renderSkillsTab },
    { key: 'feats', title: 'Feats', render: renderFeatsTab },
    { key: 'combat', title: 'Combat', render: renderCombatTab },
    { key: 'equipment', title: 'Equipment', render: renderEquipmentTab },
    { key: 'notes', title: 'Notes', render: renderNotesTab },
  ];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {tabs.map(tab => renderTabButton(tab.key, tab.title))}
      </ScrollView>
      {tabs.find(tab => tab.key === activeTab)?.render()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  readOnlyInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#666',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#fff',
  },
  abilityScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  abilityLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  abilityInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  modifierText: {
    fontSize: 16,
    color: '#666',
    minWidth: 40,
  },
  hitPointsContainer: {
    marginBottom: 16,
  },
  armorClassContainer: {
    marginBottom: 16,
  },
  acTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  acBreakdown: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  skillName: {
    flex: 2,
    fontSize: 14,
    color: '#333',
  },
  skillInput: {
    width: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 4,
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  classSkillButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
  },
  classSkillActive: {
    backgroundColor: '#4CAF50',
  },
  classSkillText: {
    fontSize: 12,
    color: '#666',
  },
  skillTotal: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  featContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  featName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
  },
  featDescription: {
    fontSize: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
    minHeight: 60,
  },
  featPrerequisites: {
    fontSize: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
  },
  attackContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  attackName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
  },
  attackRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  attackInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginRight: 4,
    backgroundColor: '#fff',
  },
  equipmentContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  equippedButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  equippedActive: {
    backgroundColor: '#4CAF50',
  },
  equippedText: {
    fontSize: 12,
    color: '#666',
  },
  moneyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 200,
  },
});
