# Pimcore Voyager

**Pimcore Voyager** is a generic mobile companion app (React Native, Expo) for Pimcore – the enterprise open core data and experience management system.

## 🎯 Goal

The app provides fast and easy access to any Pimcore data objects from mobile devices (iOS/Android). It serves as an "outpost" for editing, browsing, and managing structured Pimcore data, even offline.

## ✨ Key Features

- **Dynamic Data Object Management:** Automatic reading of the Pimcore class definitions, list and detail views for any object classes.
- **Search & Filter:** Cross-object search and filter options by object classes and fields.
- **Editing & Validation:** Editing of data objects, validation according to the rules of the Pimcore class definitions.
- **Offline Support:** Data can be edited on the go and is synchronized once the connection is restored.
- **Secure Authentication:** Integration of the Pimcore Studio API authentication.
- **Cross-Platform:** Built with React Native, based on Expo.
- **70+ Data Object Types:** Support for all Pimcore data object types (in development).

## 👥 Who Is It For?

- Pimcore editors, field staff, content teams & admins who want to maintain or access data objects on the go.

## 🏗️ How Does It Work?

The app communicates with the **Pimcore Studio API** and generates interfaces dynamically based on the data classes maintained in the backend. Structure, fields, and validations are thus adopted automatically – no app updates are required when the backend changes.

### Technical Details

- **API Integration**: Uses the native Pimcore Studio API (`/studio/api`)
- **Authentication**: Uses the built-in Pimcore authentication
- **Data Model**: Compatible with Pimcore Studio API data structures
- **SDK Compatibility**: Implementation follows the same patterns as `@pimcore/studio-ui-bundle` (adapted for React Native)

## 🚀 Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/dpfaffenbauer/PimcoreVoyager.git
cd PimcoreVoyager

# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS (requires Xcode)
npm run ios

# Run on Android (requires Android Studio)
npm run android
\`\`\`

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- For iOS: Xcode (macOS only)
- For Android: Android Studio

## 📚 Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guide
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Architecture overview
- [docs/DATA_TYPE_IMPLEMENTATION.md](docs/DATA_TYPE_IMPLEMENTATION.md) - Data Type Implementation Guide
- [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) - Project structure
- [docs/ROADMAP.md](docs/ROADMAP.md) - Development roadmap

## 🎯 Status & Roadmap

**Current Status**: Phase 1 - Foundation ✅

The project is in its initial development phase. The basic structure is in place, and the implementation of the data object types will begin shortly.

See [ROADMAP.md](docs/ROADMAP.md) for detailed phase planning.

### Implemented Features
- ✅ Project setup & configuration
- ✅ Basic documentation
- ✅ Project structure

### In Development
- 🔄 Core Architecture (Type Registry, Base Components)
- ⏳ Authentication System
- ⏳ Pimcore API Integration

### Planned
- Data Object Types (70+ types)
- List & Detail Views
- Edit Functionality
- Offline Support
- CI/CD Pipeline

## 🏗️ Build & Release

Builds are created automatically via CI/CD workflows (Android/iOS/Expo). Releases are delivered as OTA updates, via TestFlight, or as direct APK downloads.

\`\`\`bash
# Production build for Android
eas build --platform android --profile production

# Production build for iOS
eas build --platform ios --profile production
\`\`\`

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details on the development process.

### Data Type Implementation

The project needs implementations for 70+ Pimcore data object types. Each type requires:
- Display Component (display)
- Edit Component (editing)
- Validator (validation)
- Transformer (API ↔ UI conversion)

See [DATA_TYPE_IMPLEMENTATION.md](docs/DATA_TYPE_IMPLEMENTATION.md) for a detailed implementation guide.

## 📦 Technology Stack

- **Frontend**: React Native, Expo, TypeScript
- **Navigation**: React Navigation
- **State Management**: Zustand/Redux, React Query
- **API**: Pimcore REST/GraphQL
- **Authentication**: OAuth2/JWT
- **Storage**: Expo SecureStore, AsyncStorage
- **Testing**: Jest, React Native Testing Library

## 📄 License

GPL-3.0 - See [LICENSE](LICENSE) for details.

## 🔗 Links

- [Pimcore](https://pimcore.com/)
- [Pimcore Studio UI Bundle](https://github.com/pimcore/studio-ui-bundle) (reference implementation)
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)

## 📧 Contact

For questions or suggestions, please create an [Issue](https://github.com/dpfaffenbauer/PimcoreVoyager/issues) or contact @dpfaffenbauer.

## Development

> **Note**: This is an active development project. The app is at an early stage. Contributions and feedback are very welcome!
