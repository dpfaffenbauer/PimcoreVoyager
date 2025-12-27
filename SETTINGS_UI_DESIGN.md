# Settings UI Restructuring - Design Documentation

## Overview
This document describes the design decisions and implementation of the restructured Settings UI for Pimcore Voyager.

## Design Goals
1. Make the main content types (Data-Objects, Assets, Documents) easily accessible
2. Provide quick access to user settings via a prominent user button
3. Organize additional features in a collapsible burger menu
4. Maintain a clean, intuitive interface despite Pimcore's complexity

## Implementation Details

### 1. Navigation Structure

#### Top-Level: Drawer Navigation
- **Purpose**: Provides the burger menu functionality and overall navigation structure
- **Components**:
  - Main Tabs (default view)
  - Settings
  - Additional placeholder items (Search, Notifications)

#### Second Level: Bottom Tab Navigation (Main Tabs)
- **Tab 1: Data-Objects** (Active/Functional)
  - Icon: `database`
  - Color: Purple (#6200ee) when active
  - Contains the full tree view and object management functionality
  
- **Tab 2: Assets** (Placeholder)
  - Icon: `image-multiple`
  - Displays placeholder screen indicating future functionality
  
- **Tab 3: Documents** (Placeholder)
  - Icon: `file-document-multiple`
  - Displays placeholder screen indicating future functionality

#### Third Level: Stack Navigation (within each tab)
- **Data-Objects Stack**:
  - Home Screen (tree view)
  - Folder Detail Screen
  - Object List Screen
  - Object Detail Screen

- **Assets Stack**:
  - Assets Home (placeholder)

- **Documents Stack**:
  - Documents Home (placeholder)

### 2. Header Components

#### User Button
- **Location**: Top-right corner of header (fixed)
- **Icon**: `account-circle` (MaterialCommunityIcons)
- **Color**: Purple (#6200ee)
- **Size**: 32px
- **Function**: Direct navigation to Settings screen
- **Design Rationale**: 
  - Positioned in standard location for user account access
  - Always visible for quick settings access
  - Uses recognizable user account icon
  - Purple color matches primary brand color

#### Burger Menu Button
- **Location**: Top-left corner of header (default drawer behavior)
- **Icon**: Standard hamburger menu (provided by drawer navigator)
- **Function**: Opens drawer with additional menu items
- **Design Rationale**:
  - Standard position for navigation drawer
  - Familiar pattern for mobile apps

### 3. Color Scheme
- **Primary Color**: #6200ee (Purple)
  - Used for active tab indicators
  - Used for user button
  - Used for active drawer items
  
- **Inactive Color**: Gray
  - Used for inactive tab icons
  - Used for inactive drawer items

- **Background Colors**:
  - White (#fff) for main content areas
  - Light gray (#f5f5f5) for settings background

### 4. Menu Structure

#### Drawer Menu Items
1. **Home** (MainTabs)
   - Icon: `home`
   - Opens the main tabs view
   
2. **Settings**
   - Icon: `cog`
   - Opens settings screen with user profile and instance management
   
3. **Search** (Placeholder)
   - Icon: `magnify`
   - Future search functionality
   
4. **Notifications** (Placeholder)
   - Icon: `bell`
   - Future notification functionality

### 5. User Experience Considerations

#### Navigation Flow
1. User logs in → Sees Data-Objects tab active by default
2. User can switch between Data-Objects, Assets, Documents via bottom tabs
3. User can access Settings quickly via user button in header
4. User can access additional features via burger menu
5. Each tab maintains its own navigation stack

#### Progressive Disclosure
- Main functionality (Data-Objects) is immediately visible
- Additional features (Settings, Search, Notifications) are accessible but not cluttering the main interface
- Placeholder screens inform users about future functionality

#### Consistency with Pimcore
- Three main content types mirror Pimcore's structure
- Color scheme maintains professional appearance
- Icons chosen to be intuitive and match common patterns

## Technical Implementation

### Files Created
1. `src/screens/AssetsScreen.tsx` - Placeholder for assets management
2. `src/screens/DocumentsScreen.tsx` - Placeholder for documents management
3. `src/screens/PlaceholderScreen.tsx` - Generic placeholder for future features

### Files Modified
1. `src/navigation/AppNavigation.tsx` - Complete restructuring:
   - Added drawer navigator import
   - Created separate stack navigators for each tab
   - Implemented MainTabs with three tabs
   - Implemented DrawerNavigator with menu items
   - Added user button to header
   - Updated main rendering to use DrawerNavigator

### Dependencies Used
- `@react-navigation/drawer` - For burger menu functionality
- `@react-navigation/bottom-tabs` - For main tabs
- `@react-navigation/stack` - For hierarchical navigation within tabs
- `@expo/vector-icons` (MaterialCommunityIcons) - For consistent iconography

## Future Enhancements

### Short Term
1. Implement actual Assets management functionality
2. Implement actual Documents management functionality
3. Add real Search functionality
4. Add Notifications system

### Long Term
1. Customizable tab order
2. User preferences for default tab
3. Badge indicators for notifications
4. Contextual actions in header based on current screen

## Testing Notes

The restructured navigation should be tested for:
1. Smooth transitions between tabs
2. Proper stack navigation within each tab
3. Settings accessible from user button
4. Burger menu opens and closes smoothly
5. Back button behavior within nested navigation
6. State persistence when switching between tabs

## Screenshots

Note: Screenshots will be added after testing on actual devices/simulators.

Key views to capture:
1. Main screen with Data-Objects tab active
2. Bottom tabs showing all three options
3. Drawer menu opened showing all items
4. User button highlighted in header
5. Settings screen accessed from user button
6. Assets placeholder screen
7. Documents placeholder screen
8. Generic placeholder screen (Search or Notifications)
