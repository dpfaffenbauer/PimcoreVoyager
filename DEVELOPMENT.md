# Pimcore Voyager - Development Guide

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Expo CLI
- (Optional) iOS Simulator or Android Emulator
- (Optional) Expo Go app on your mobile device

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dpfaffenbauer/PimcoreVoyager.git
cd PimcoreVoyager
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Pimcore API configuration
```

### Running the App

#### Development Mode

Start the Expo development server:
```bash
npm start
```

This will open Expo DevTools in your browser. You can then:
- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Scan QR code with Expo Go app on your phone

#### Platform-specific commands

```bash
npm run ios      # Run on iOS simulator
npm run android  # Run on Android emulator
npm run web      # Run in web browser
```

## Project Structure

```
PimcoreVoyager/
├── src/
│   ├── apis/              # API services for Pimcore communication
│   │   ├── apiClient.ts   # Axios instance with interceptors
│   │   ├── authService.ts # Authentication service
│   │   └── pimcoreService.ts # Pimcore API service
│   ├── components/        # Reusable UI components
│   ├── config/            # Configuration files
│   │   └── env.ts         # Environment configuration
│   ├── navigation/        # Navigation setup
│   │   └── AppNavigation.tsx
│   ├── screens/           # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ObjectListScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── store/             # State management (Zustand)
│   │   ├── authStore.ts   # Authentication state
│   │   └── appStore.ts    # Application state
│   ├── types/             # TypeScript type definitions
│   │   ├── auth.ts
│   │   └── pimcore.ts
│   └── utils/             # Utility functions
├── assets/                # Images, fonts, etc.
├── .env.example           # Example environment variables
├── App.tsx                # Root component
├── app.json               # Expo configuration
├── eas.json               # EAS Build configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## Key Features

### 1. Authentication
- Mock authentication for development (any username/password works)
- OAuth2 ready (placeholder for production implementation)
- Secure token storage using Expo SecureStore
- Automatic token expiration handling

### 2. State Management
- **Zustand** for lightweight, performant state management
- **authStore**: Manages authentication state
- **appStore**: Manages app-wide state (class definitions, etc.)

### 3. API Integration
- Axios-based HTTP client with interceptors
- Automatic token injection for authenticated requests
- Error handling and token refresh logic
- Mock data support for offline development

### 4. Navigation
- Bottom Tab Navigation for main sections
- Stack Navigation for hierarchical screens
- Authentication flow (Login → Main App)

### 5. UI Components
- **React Native Paper** for Material Design components
- Consistent theming and styling
- Responsive layouts

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PIMCORE_API_URL=https://your-pimcore-instance.com/api
PIMCORE_CLIENT_ID=your-client-id
PIMCORE_CLIENT_SECRET=your-client-secret
OAUTH_REDIRECT_URI=pimcorevoyager://oauth/callback
OAUTH_AUTHORIZATION_ENDPOINT=/oauth/authorize
OAUTH_TOKEN_ENDPOINT=/oauth/token
APP_ENV=development
```

### Expo Configuration (app.json)

Key settings in `app.json`:
- App name and slug
- Platform-specific configurations (iOS/Android)
- Bundle identifiers
- EAS project ID

## Building for Production

### Using EAS Build

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

4. Build for Android:
```bash
eas build --platform android --profile production
```

5. Build for iOS:
```bash
eas build --platform ios --profile production
```

### Build Profiles

Defined in `eas.json`:
- **development**: For development builds with dev client
- **preview**: Internal testing builds
- **production**: Release builds for app stores

## CI/CD

GitHub Actions workflow (`.github/workflows/expo-eas-build.yml`) automatically:
- Runs TypeScript checks
- Builds the app on EAS for main/develop branches
- Uses different profiles based on branch

### Required Secrets

Add these secrets to your GitHub repository:
- `EXPO_TOKEN`: Your Expo authentication token

## Connecting to Pimcore

### API Endpoints

The app expects the following Pimcore REST API endpoints:

- `GET /classes` - List all class definitions
- `GET /classes/:id` - Get specific class definition
- `GET /objects?className=:name` - List objects by class
- `GET /objects/:id` - Get specific object
- `PUT /objects/:id` - Update object
- `POST /objects` - Create object
- `DELETE /objects/:id` - Delete object

### Authentication Flow

1. User enters credentials
2. App requests OAuth2 token from Pimcore
3. Token stored securely in device
4. Token included in all API requests
5. Automatic token refresh when expired

## Development Tips

### Hot Reloading

Expo supports hot reloading. Just save your files and changes will appear automatically.

### Debugging

- Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android) for dev menu
- Enable Remote JS Debugging or use React DevTools
- Check logs in terminal where `npm start` is running

### TypeScript

The project uses TypeScript for type safety. Run type checks:
```bash
npx tsc --noEmit
```

## Next Steps

### Immediate TODOs

1. Implement actual OAuth2 flow using `expo-auth-session`
2. Add GraphQL support for more efficient data fetching
3. Implement offline data synchronization
4. Add object editing forms with validation
5. Implement search and filter functionality
6. Add unit and integration tests

### Future Enhancements

- Offline mode with local database
- Push notifications for updates
- Media upload/management
- Multi-language support
- Dark mode theme
- Advanced search and filtering
- Batch operations on objects

## Troubleshooting

### Common Issues

**Build fails on `npm install`:**
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Use `--legacy-peer-deps` if peer dependency issues

**App won't start:**
- Check Expo CLI version: `expo --version`
- Clear Expo cache: `expo start -c`

**Authentication not working:**
- Verify `.env` file exists and has correct values
- Check network connectivity to Pimcore instance

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT License - See [LICENSE](LICENSE) file for details.
