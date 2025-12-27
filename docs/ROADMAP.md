# Pimcore Voyager - Roadmap

Status: 27.12.2025

## Übersicht

Dieser Roadmap beschreibt die geplante Entwicklung von Pimcore Voyager - einer generischen Mobile Companion App für Pimcore.

## Phase 1: Foundation (Sprint 1-2)

### 1.1 Projekt Setup ✅
- [x] Repository initialisiert
- [x] React Native/Expo Projektstruktur aufgesetzt
- [x] Build-Konfiguration (package.json, tsconfig.json)
- [x] Linting & Formatting (ESLint, Prettier)
- [x] Git Ignore & CI/CD Basis

### 1.2 Dokumentation ✅
- [x] README.md
- [x] CONTRIBUTING.md
- [x] ARCHITECTURE.md
- [x] DATA_TYPE_IMPLEMENTATION.md
- [x] PROJECT_STRUCTURE.md

### 1.3 Core Architecture (In Progress)
- [ ] Type Registry Setup
- [ ] Base Components (Button, Card, Input, etc.)
- [ ] Navigation Setup
- [ ] State Management Setup (Zustand/Redux)
- [ ] API Client Skeleton

## Phase 2: Authentication & API Integration (Sprint 3-4)

### 2.1 Authentication
- [ ] Login Screen UI
- [ ] OAuth2/JWT Implementation
- [ ] Secure Token Storage (Expo SecureStore)
- [ ] Token Refresh Logic
- [ ] Logout Functionality
- [ ] Error Handling

### 2.2 Pimcore API Client
- [ ] Base HTTP Client
- [ ] Authentication Interceptor
- [ ] Error Handling
- [ ] Request/Response Transformers
- [ ] Class Definitions API
- [ ] Data Objects API
- [ ] Assets API (basic)

### 2.3 Testing
- [ ] API Client Tests
- [ ] Authentication Flow Tests
- [ ] Mock API Server für Tests

## Phase 3: Basic Data Types (Sprint 5-8)

Implementierung der grundlegenden Text- und Eingabe-Typen:

### 3.1 Text Input Types (Priority: High)
- [ ] #43 Input
- [ ] #67 Textarea
- [ ] #28 Email
- [ ] #59 Password
- [ ] #29 Encrypted

### 3.2 Numeric Types (Priority: High)
- [ ] #56 Numeric
- [ ] #64 Slider
- [ ] #44 Input Quantity Value

### 3.3 Boolean/Simple Selection (Priority: High)
- [ ] #23 Checkbox
- [ ] #13 Boolean Select
- [ ] #24 Consent

### 3.4 Testing & Documentation
- [ ] Unit Tests für alle Typen
- [ ] Integration Tests
- [ ] User Documentation

## Phase 4: Lists & Detail Views (Sprint 9-10)

### 4.1 Data Object List
- [ ] List Screen UI
- [ ] Pagination
- [ ] Search Functionality
- [ ] Filter by Class
- [ ] Pull-to-Refresh
- [ ] Empty States
- [ ] Loading States

### 4.2 Data Object Detail
- [ ] Detail Screen UI
- [ ] Dynamic Form Rendering
- [ ] Read-Only Mode
- [ ] Edit Mode Toggle
- [ ] Save Functionality
- [ ] Validation Display

### 4.3 Testing
- [ ] E2E Tests für List & Detail Flow
- [ ] Performance Tests

## Phase 5: Selection & Date Types (Sprint 11-13)

### 5.1 Selection Types (Priority: High)
- [ ] #63 Select
- [ ] #53 Multiselect
- [ ] #33 Gender
- [ ] #45 Language
- [ ] #46 Language Multiselect
- [ ] #25 Country Multiselect

### 5.2 Date/Time Types (Priority: High)
- [ ] #26 Date
- [ ] #27 DateTime
- [ ] #68 Time

### 5.3 Special Input Types
- [ ] #32 Firstname
- [ ] #47 Lastname
- [ ] #69 URL Slug
- [ ] #72 WYSIWYG (basic)

## Phase 6: Media Types (Sprint 14-16)

### 6.1 Basic Image Support (Priority: Medium)
- [ ] #39 Image
- [ ] Image Picker Integration
- [ ] Image Upload
- [ ] Thumbnail Display
- [ ] Image Preview

### 6.2 Advanced Image Types
- [ ] #40 Image Advanced
- [ ] #41 Image Advanced with Hotspots
- [ ] #38 Hot Spot Image
- [ ] #42 Image Gallery
- [ ] #30 External Image

### 6.3 Video Support
- [ ] #71 Video
- [ ] Video Player
- [ ] Video Upload

## Phase 7: Relation Types (Sprint 17-20)

### 7.1 Basic Relations (Priority: Medium)
- [ ] #51 Many-to-One Relation
- [ ] #50 Many-to-Many Relation
- [ ] #52 Many-to-Many Object Relation
- [ ] #57 Objects
- [ ] #48 Link

### 7.2 Advanced Relations
- [ ] #11 Advanced Many-to-Many Relation
- [ ] #10 Advanced Many-to-Many Object Relation
- [ ] #61 Reverse Many-to-Many Object Relation
- [ ] #58 Objects Metadata

### 7.3 Relation UI/UX
- [ ] Search/Autocomplete
- [ ] Lazy Loading
- [ ] Preview Cards
- [ ] Quick Actions

## Phase 8: Geographic & Complex Types (Sprint 21-23)

### 8.1 Geographic Types (Priority: Low)
- [ ] #35 Geopoint
- [ ] #34 Geobounds
- [ ] #36 Geopolygon
- [ ] #37 Geopolyline
- [ ] Map Integration (react-native-maps)

### 8.2 Structured Types (Priority: Medium)
- [ ] #66 Table
- [ ] #65 Structured Table
- [ ] #31 Fieldcollections
- [ ] #49 Localizedfields
- [ ] #12 Block

### 8.3 Special Types
- [ ] #62 RGBAColor
- [ ] #60 Quantity Value
- [ ] #54 Newsletter Active
- [ ] #55 Newsletter Confirmed
- [ ] #14 Calculated Value (read-only)
- [ ] #70 User

## Phase 9: Offline & Sync (Sprint 24-25)

### 9.1 Offline Support
- [ ] Local Storage Implementation
- [ ] Offline Queue
- [ ] Conflict Detection
- [ ] Conflict Resolution UI
- [ ] Background Sync

### 9.2 Performance
- [ ] Caching Strategy
- [ ] Optimistic Updates
- [ ] Request Deduplication
- [ ] Image Optimization

## Phase 10: Build & CI/CD (Sprint 26)

### 10.1 Build Pipeline (#6, #1)
- [ ] GitHub Actions Workflow
- [ ] Android Build (APK)
- [ ] iOS Build (IPA/TestFlight)
- [ ] EAS Build Configuration
- [ ] Signing & Secrets

### 10.2 Release Process
- [ ] Semantic Versioning
- [ ] Changelog Generation
- [ ] Release Notes
- [ ] OTA Updates
- [ ] Beta Testing Process

## Phase 11: Polish & Production (Sprint 27-28)

### 11.1 User Experience
- [ ] Onboarding Flow
- [ ] Help/Documentation in App
- [ ] Error Messages Refinement
- [ ] Loading States
- [ ] Empty States
- [ ] Skeleton Screens

### 11.2 Accessibility
- [ ] Screen Reader Support
- [ ] High Contrast Mode
- [ ] Touch Target Sizes
- [ ] Keyboard Navigation

### 11.3 Performance Optimization
- [ ] Bundle Size Optimization
- [ ] Startup Time
- [ ] Memory Usage
- [ ] Battery Usage

### 11.4 Production Readiness
- [ ] Security Audit
- [ ] Performance Testing
- [ ] Load Testing
- [ ] Final Bug Fixes
- [ ] Production Deployment

## Prioritäten

### Must Have (MVP)
- Authentication
- Basic Data Types (Text, Number, Boolean, Date)
- List & Detail Views
- Edit & Save Functionality
- Basic Validation

### Should Have
- Selection Types
- Media Types (Image)
- Relations
- Offline Support
- Search & Filter

### Nice to Have
- Advanced Media (Video, Gallery)
- Geographic Types
- Complex Structured Types
- Advanced Offline Sync
- Analytics

## Metriken & Erfolg

### Development Metrics
- Code Coverage > 80%
- TypeScript Strict Mode
- Zero ESLint Errors
- Build Time < 5 min

### Performance Metrics
- App Startup < 2s
- Screen Transition < 200ms
- API Response Handling < 100ms
- Memory Usage < 200MB

### Quality Metrics
- Crash Rate < 1%
- User Satisfaction > 4.5/5
- Bug Resolution < 48h

## Risiken & Abhängigkeiten

### Technische Risiken
- Expo/React Native Breaking Changes
- Pimcore API Änderungen
- Performance auf älteren Geräten
- iOS/Android Platform Unterschiede

### Abhängigkeiten
- Pimcore REST/GraphQL API Verfügbarkeit
- Expo EAS Build Service
- App Store/Play Store Review Prozess

## Nächste Schritte

1. ✅ Projekt Setup & Dokumentation
2. 🔄 Core Architecture Implementation
3. ⏳ Authentication & API Integration
4. ⏳ Basic Data Types Implementation

## Ressourcen

- **Team Size**: 1-2 Entwickler
- **Sprint Länge**: 2 Wochen
- **Geschätzte Dauer**: 6-9 Monate bis MVP
- **Geschätzte Dauer**: 12-14 Monate bis v1.0

## Updates

- **27.12.2025**: Initial Roadmap erstellt
- **27.12.2025**: Phase 1 (Setup & Dokumentation) abgeschlossen
