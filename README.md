# D&D 3.5e Character Manager

A comprehensive React Native application for managing Dungeons & Dragons 3.5 edition characters.

## Features

### Character Management
- **Create New Characters**: Manual entry, full random generation, or partial random generation
- **Save/Load Characters**: Persistent character storage with profile management
- **Character Sheets**: Complete editable character sheets with all D&D 3.5e fields
- **Auto-save**: Automatic saving to prevent data loss

### Character Creation Modes
1. **Manual Entry**: Complete control over all character aspects
2. **Full Random Generation**: Generates a completely random character using D&D 3.5e rules
3. **Partial Random Generation**: Choose which aspects to randomize (stats, race, class, alignment)

### Character Sheet Features
- **Ability Scores**: Full ability score management with automatic modifier calculation
- **Combat Stats**: Hit points, armor class, base attack bonus, saving throws
- **Skills**: Complete skill system with class skills and modifier calculations
- **Feats**: Manage character feats with descriptions and prerequisites
- **Equipment**: Equipment management with weight tracking and equipped status
- **Attacks**: Attack tracking with damage, critical, and range information
- **Magic**: Spell management (expandable for future features)
- **Notes**: Character backstory and miscellaneous notes

## Technical Implementation

### File Structure
```
src/
├── assets/               # Images, icons, and static resources
├── components/
│   └── CharacterForm.tsx # Main character form component
├── screens/
│   ├── HomeScreen.tsx    # Main menu and character selection
│   ├── CharacterSheet.tsx # Character sheet view and editing
│   └── CreateCharacter.tsx # Character creation wizard
├── services/
│   └── characterStorage.ts # Local storage management
├── types/
│   └── Character.ts      # TypeScript type definitions
└── utils/
    └── dnd35Utils.ts     # D&D 3.5e game logic and calculations
```

### Key Technologies
- **React Native 0.79**: Modern React Native for cross-platform development
- **TypeScript**: Type safety and better development experience
- **React Navigation**: Screen navigation and routing
- **AsyncStorage**: Local data persistence
- **React Native Paper**: Enhanced UI components

### D&D 3.5e Implementation
- **Ability Score Generation**: 4d6 drop lowest dice rolling
- **Modifier Calculations**: Automatic ability modifier calculations
- **Class-based Stats**: Hit points, base attack bonus, and saving throws by class
- **Experience Tables**: Level progression tracking
- **Skill System**: Complete skill list with ability score associations

## Installation and Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Metro bundler:
   ```bash
   npm start
   ```

3. Run on your preferred platform:
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

## Usage

### Creating a Character
1. From the home screen, tap "Create New Character"
2. Choose your creation mode:
   - **Manual**: Enter all details yourself
   - **Random**: Generate a completely random character
   - **Partial**: Choose what to randomize
3. Review and edit your character
4. Save the character

### Managing Characters
- **Load Character**: Select from saved character profiles
- **Save Character**: Save current character progress
- **Character Sheet**: Edit all character details across organized tabs
- **Delete Character**: Long-press a character in the load menu

### Character Sheet Navigation
The character sheet is organized into tabs:
- **Basics**: Name, race, class, alignment, physical description
- **Stats**: Ability scores, hit points, armor class, saves
- **Skills**: Complete skill management with modifiers
- **Feats**: Character feats and abilities
- **Combat**: Attacks and combat-related information
- **Equipment**: Inventory and money tracking
- **Notes**: Character backstory and notes

## Future Enhancements

### Planned Features
- **Spell System**: Complete spell management for casters
- **Equipment Database**: Predefined equipment with stats
- **Character Export/Import**: Share characters between devices
- **UI Customization**: Themes and layout options
- **Dice Roller**: Built-in dice rolling utilities
- **Level Up Wizard**: Guided character advancement
- **Multi-character Campaigns**: Campaign and party management

### Technical Improvements
- **Cloud Sync**: Character synchronization across devices
- **Offline Support**: Enhanced offline functionality
- **Performance Optimization**: Improved app performance
- **Accessibility**: Better accessibility support

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

This project is for personal use and D&D 3.5e content is property of Wizards of the Coast.

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
