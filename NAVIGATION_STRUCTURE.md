# Navigation Structure Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Pimcore Voyager App                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼────────┐              ┌──────▼──────┐
            │ Authenticated? │              │    Login    │
            └───────┬────────┘              │   Screens   │
                    │                       └─────────────┘
                    │ YES
                    │
        ┌───────────▼───────────┐
        │  Drawer Navigator     │◄─── Provides Burger Menu
        │  (Hamburger Menu)     │
        └───────────┬───────────┘
                    │
        ┌───────────┴────────────────────────────────────┐
        │                                                 │
  ┌─────▼──────┐  ┌──────────┐  ┌──────────┐  ┌────────▼─────────┐
  │  MainTabs  │  │ Settings │  │  Search  │  │  Notifications   │
  │  (default) │  │          │  │(Placeholder)│  │  (Placeholder)   │
  └─────┬──────┘  └──────────┘  └──────────┘  └──────────────────┘
        │
        │
┌───────┴────────────────────────────────────────────────────┐
│              Bottom Tab Navigator (MainTabs)               │
│  ┌──────────────┬──────────────┬──────────────┐           │
│  │              │              │              │           │
│  │ Data-Objects │   Assets     │  Documents   │           │
│  │   (Active)   │(Placeholder) │(Placeholder) │           │
│  └──────┬───────┴──────┬───────┴──────┬───────┘           │
└─────────┼──────────────┼──────────────┼───────────────────┘
          │              │              │
          │              │              │
┌─────────▼─────────┐ ┌──▼──────────┐ ┌▼──────────────┐
│ DataObjects Stack│ │ Assets Stack│ │Documents Stack│
│                  │ │             │ │               │
│ ┌──────────────┐ │ │ ┌─────────┐ │ │ ┌───────────┐ │
│ │ Objekt-Baum  │ │ │ │ Assets  │ │ │ │Documents  │ │
│ │ (Home)       │ │ │ │ Home    │ │ │ │Home       │ │
│ └──────┬───────┘ │ │ └─────────┘ │ │ └───────────┘ │
│        │         │ └─────────────┘ └───────────────┘
│        │         │
│  ┌─────┴─────────┴──────────┐
│  │                           │
│  ▼                           ▼
│ ┌──────────────┐  ┌──────────────┐
│ │FolderDetail  │  │ ObjectList   │
│ └──────────────┘  └──────┬───────┘
│                          │
│                    ┌─────▼───────┐
│                    │ObjectDetail │
│                    └─────────────┘
└────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                            Header Structure                             │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │  [☰] Burger Menu     Title            [👤] User Button       │     │
│  │      (Opens Drawer)                      (Opens Settings)     │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                         │
│                       Main Content Area                                │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │                                                              │     │
│  │                  Content (Tree View, etc.)                   │     │
│  │                                                              │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │  [📦 Data-Objects] [🖼️ Assets] [📄 Documents]                 │     │
│  │       (Active)      (Inactive)   (Inactive)                  │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                      Bottom Tab Bar                                   │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                         Drawer Menu (Opened)                           │
│                                                                         │
│  ┌────────────────────────┐                                            │
│  │  [🏠] Home             │  ◄─── MainTabs (default view)              │
│  │  [⚙️] Settings          │  ◄─── User Profile & Instances             │
│  │  [🔍] Search            │  ◄─── Placeholder                          │
│  │  [🔔] Notifications     │  ◄─── Placeholder                          │
│  └────────────────────────┘                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘


Legend:
- [☰] = Hamburger/Burger Menu Icon
- [👤] = User Account Icon
- [📦] = Database/Data-Objects Icon
- [🖼️] = Images/Assets Icon
- [📄] = Documents Icon
- [🏠] = Home Icon
- [⚙️] = Settings/Cog Icon
- [🔍] = Search/Magnify Icon
- [🔔] = Bell/Notifications Icon

Colors:
- Active Tab/Menu Item: Purple (#6200ee)
- Inactive Tab/Menu Item: Gray
- User Button: Purple (#6200ee)
```

## Key Features

### 1. User Button (Top Right)
- Always visible in header
- Provides quick access to Settings
- Purple color (#6200ee) for visibility
- Icon: account-circle (MaterialCommunityIcons)

### 2. Bottom Tabs
- Three main tabs for content types
- Data-Objects is active and functional
- Assets and Documents are placeholders
- Tab icons change color when active (purple)

### 3. Burger Menu (Top Left)
- Provides access to additional features
- Contains Home, Settings, Search, Notifications
- Search and Notifications are placeholders
- Purple highlight for active menu item

### 4. Navigation Flow
```
Login → MainTabs (Data-Objects) → Navigation within stack
                ↓
                Settings (via User Button)
                ↓
                Drawer Menu (via Burger Menu)
```

## Screen Stack Depths

```
Level 1: Drawer Navigator
   ↓
Level 2: MainTabs (Bottom Tabs)
   ↓
Level 3: Stack Navigator (per tab)
   ↓
Level 4: Individual Screens (Home, FolderDetail, ObjectList, ObjectDetail)
```

## Benefits of This Structure

1. **Clear Hierarchy**: Three main content types are immediately visible
2. **Quick Access**: User button provides direct access to settings
3. **Organized**: Additional features tucked away in drawer menu
4. **Extensible**: Easy to add new tabs or menu items
5. **Familiar**: Standard mobile app patterns (bottom tabs + drawer)
6. **Efficient**: Each tab maintains its own navigation stack
