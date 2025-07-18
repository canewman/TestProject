import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { CharacterSheet } from './src/screens/CharacterSheet';
import { CreateCharacter } from './src/screens/CreateCharacter';
import { ActionsScreen } from './src/screens/ActionsScreen';
import { SpellsScreen } from './src/screens/SpellsScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'D&D 3.5e Character Manager',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="CharacterSheet" 
          component={CharacterSheet}
          options={{
            title: 'Character Sheet',
          }}
        />
        <Stack.Screen 
          name="CreateCharacter" 
          component={CreateCharacter}
          options={{
            title: 'Create Character',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Actions" 
          component={ActionsScreen}
          options={{
            title: 'Actions',
          }}
        />
        <Stack.Screen 
          name="Spells" 
          component={SpellsScreen}
          options={{
            title: 'Spells',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;