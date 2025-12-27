# Pimcore Voyager - Development Guide

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Expo CLI
- (Optional) iOS Simulator or Android Emulator
- (Optional) Expo Go app on your mobile device
- **Pimcore instance with Studio API enabled**

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
# Edit .env with your Pimcore Studio API URL
```

**Important**: Set `PIMCORE_STUDIO_API_URL` to your Pimcore instance Studio API endpoint (e.g., `https://your-instance.com/studio/api`)

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
│   │   ├── apiClient.ts   # Axios instance configured for Studio API
│   │   ├── authService.ts # Pimcore Studio API authentication
│   │   └── pimcoreService.ts # Pimcore Studio API data services
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

### 1. Pimcore Studio API Integration
- **Native Integration**: Uses Pimcore's built-in Studio API
- **Standard Endpoints**: 
  - `/studio/api/login` - Authentication
  - `/studio/api/data-objects/classes` - Class definitions
  - `/studio/api/data-objects` - Data objects CRUD
- **Session-Based Auth**: Cookie-based session management with `withCredentials`
- **Mock Fallback**: Falls back to mock data if Studio API unavailable

### 2. Authentication
- **Pimcore Studio Authentication**: Session-based authentication with cookies
- **No Token Storage**: Sessions managed automatically via HTTP cookies
- **Auto Logout**: Automatic logout on 401 errors
- **Development Mode**: Falls back to mock auth when backend unavailable

### 3. State Management
- **Zustand** for lightweight, performant state management
- **authStore**: Manages authentication state
- **appStore**: Manages app-wide state (class definitions, etc.)

### 4. API Integration
- Axios-based HTTP client with interceptors
- Automatic cookie handling for session management
- Error handling with 401 session expiration detection
- Mock data support for offline development

### 5. Navigation
- Bottom Tab Navigation for main sections
- Stack Navigation for hierarchical screens
- Authentication flow (Login → Main App)

### 6. UI Components
- **React Native Paper** for Material Design components
- Consistent theming and styling
- Responsive layouts

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Pimcore Studio API URL (required)
PIMCORE_STUDIO_API_URL=https://your-pimcore-instance.com/studio/api

# App Configuration
APP_ENV=development
```

**Note**: The Studio API is typically available at `https://your-pimcore-domain.com/studio/api`

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

### Pimcore Studio API Endpoints

The app uses the following Pimcore Studio API endpoints:

**Authentication:**
- `POST /studio/api/login` - User login
- `POST /studio/api/logout` - User logout

**Data Objects:**
- `GET /studio/api/data-objects/classes` - List all class definitions
- `GET /studio/api/data-objects/classes/{id}` - Get specific class definition
- `GET /studio/api/data-objects` - List objects (with filters)
- `GET /studio/api/data-objects/{id}` - Get specific object
- `PATCH /studio/api/data-objects/{id}` - Update object
- `POST /studio/api/data-objects` - Create object
- `DELETE /studio/api/data-objects/{id}` - Delete object

### Authentication Flow

1. User enters Pimcore credentials
2. App sends POST to Studio API `/login` endpoint
3. Server establishes session and sets HTTP-only cookies
4. Cookies automatically included in all subsequent API requests
5. Automatic logout on 401 errors (session expired)

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

1. Test with real Pimcore Studio API instance
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
- Verify `.env` file exists and has correct Studio API URL
- Check network connectivity to Pimcore instance
- Verify Pimcore Studio API is enabled and accessible
- Check Pimcore user credentials are correct

**Studio API not found:**
- Ensure Pimcore Studio bundle is installed and enabled
- Verify the API URL format: `https://domain.com/studio/api`
- Check Pimcore logs for API errors

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT License - See [LICENSE](LICENSE) file for details.
