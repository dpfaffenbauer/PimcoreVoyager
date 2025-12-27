# Project Structure

This document describes the directory structure of the Pimcore Voyager project.

## Root Directory

```
PimcoreVoyager/
├── .github/                    # GitHub configuration
│   └── workflows/             # CI/CD workflows
├── assets/                    # Static assets
│   ├── icon.png              # App icon
│   ├── splash.png            # Splash screen
│   └── adaptive-icon.png     # Android adaptive icon
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md       # Architecture documentation
│   └── DATA_TYPE_IMPLEMENTATION.md  # Implementation guide
├── src/                       # Source code
│   ├── components/           # React Native components
│   │   ├── dataTypes/       # Data type components
│   │   ├── forms/           # Form components
│   │   └── ui/              # UI base components
│   ├── screens/             # App screens
│   ├── services/            # Services layer
│   │   └── pimcore/        # Pimcore API client
│   ├── store/              # State management
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── __tests__/               # Tests
├── App.tsx                  # App entry point
├── app.json                 # Expo configuration
├── babel.config.js          # Babel configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── .gitignore              # Git ignore rules
├── CONTRIBUTING.md         # Contribution guide
├── LICENSE                 # License file
└── README.md               # Project README
```

## Source Directory Structure

### `/src/components/dataTypes/`

Each data type has its own directory:

```
dataTypes/
├── Input/
│   ├── index.ts
│   ├── InputDisplay.tsx
│   ├── InputEdit.tsx
│   ├── Input.validator.ts
│   ├── Input.transformer.ts
│   ├── Input.types.ts
│   └── Input.test.tsx
├── Textarea/
├── Numeric/
├── Select/
└── ... (69+ more types)
```

### `/src/components/forms/`

Form-related components:

```
forms/
├── DynamicForm.tsx          # Main dynamic form component
├── FieldRenderer.tsx        # Renders individual fields
├── FormField.tsx            # Form field wrapper
└── ValidationMessage.tsx    # Validation error display
```

### `/src/components/ui/`

Reusable UI components:

```
ui/
├── Button.tsx
├── Card.tsx
├── Input.tsx
├── Loading.tsx
├── Modal.tsx
└── ... (more base components)
```

### `/src/screens/`

App screens:

```
screens/
├── AuthScreen.tsx           # Login/Authentication
├── HomeScreen.tsx           # Home screen
├── ObjectListScreen.tsx     # List of data objects
├── ObjectDetailScreen.tsx   # Object detail view
├── ObjectEditScreen.tsx     # Object editing
└── SettingsScreen.tsx       # App settings
```

### `/src/services/pimcore/`

Pimcore API integration:

```
pimcore/
├── PimcoreClient.ts         # Main API client
├── auth.ts                  # Authentication service
├── dataObjects.ts           # Data objects API
├── classDefinitions.ts      # Class definitions API
├── assets.ts                # Assets API
└── types.ts                 # API type definitions
```

### `/src/store/`

State management:

```
store/
├── index.ts                 # Store setup
├── authStore.ts             # Authentication state
├── dataObjectStore.ts       # Data objects state
├── uiStore.ts              # UI state
└── types.ts                # Store type definitions
```

### `/src/types/`

TypeScript definitions:

```
types/
├── api.ts                  # API types
├── dataTypes.ts            # Data type types
├── navigation.ts           # Navigation types
└── common.ts               # Common types
```

## Asset Organization

```
assets/
├── images/                 # Images
│   ├── logo.png
│   └── placeholders/
├── fonts/                  # Custom fonts (if any)
└── icons/                  # Icon sets
```

## Test Organization

```
__tests__/
├── components/
│   ├── dataTypes/
│   │   ├── Input.test.tsx
│   │   └── ...
│   └── forms/
├── services/
│   └── pimcore/
├── utils/
└── integration/
```

## Documentation Structure

```
docs/
├── ARCHITECTURE.md                  # System architecture
├── DATA_TYPE_IMPLEMENTATION.md     # Implementation guide
├── API.md                          # API documentation
├── TESTING.md                      # Testing guide
└── DEPLOYMENT.md                   # Deployment guide
```

## Build Artifacts (not in git)

These directories are created during build/runtime but excluded from git:

```
.expo/                      # Expo build cache
.expo-shared/              # Expo shared resources
node_modules/              # Node.js dependencies
dist/                      # Distribution builds
coverage/                  # Test coverage reports
ios/                       # iOS native project
android/                   # Android native project
```

## Configuration Files

- **app.json**: Expo app configuration
- **babel.config.js**: Babel transpiler configuration
- **tsconfig.json**: TypeScript compiler configuration
- **.eslintrc.js**: ESLint linter rules
- **.prettierrc**: Prettier code formatter rules
- **.gitignore**: Files to ignore in git
- **package.json**: NPM package configuration

## Future Additions

As the project grows, we may add:

- `/e2e/` - End-to-end tests
- `/scripts/` - Build and deployment scripts
- `/locales/` - Internationalization files
- `/theme/` - Theming configuration
