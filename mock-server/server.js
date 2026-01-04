/**
 * Pimcore Studio API Mock Server
 * Simulates the Pimcore Studio API for E2E testing
 * Types based on @pimcore/studio-ui-bundle
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Mock session storage
const sessions = new Map();

// Helper to check authentication
const requireAuth = (req, res, next) => {
  const sessionId = req.cookies?.PHPSESSID || req.headers['x-session-id'];
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = sessions.get(sessionId);
  next();
};

// ===================
// Helper Functions
// ===================

const createPermissions = (full = true) => ({
  list: full,
  view: full,
  publish: full,
  delete: full,
  rename: full,
  create: full,
  settings: full,
  versions: full,
  properties: full,
});

const createCustomAttributes = (icon = null) => ({
  icon: icon,
  tooltip: null,
  additionalIcons: [],
  key: null,
  additionalCssClasses: [],
});

const createIcon = (name) => ({
  type: 'name',
  value: name,
});

// ===================
// AUTH ENDPOINTS
// ===================

// Valid test credentials
const validCredentials = {
  admin: 'admin',
  test: 'test123',
};

app.post('/pimcore-studio/api/login', (req, res) => {
  const { username, password } = req.body;

  // Validate credentials
  if (!username || !password) {
    return res.status(401).json({ error: 'Username and password required' });
  }

  // Check if credentials are valid
  if (validCredentials[username] !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const sessionId = 'mock-session-' + Date.now();
  sessions.set(sessionId, { username, id: 1 });

  res.cookie('PHPSESSID', sessionId, { httpOnly: true });
  res.json({
    success: true,
    user: {
      id: 1,
      username: username,
      email: `${username}@test.local`,
      roles: ['ROLE_PIMCORE_ADMIN'],
    },
  });
});

app.post('/pimcore-studio/api/logout', (req, res) => {
  const sessionId = req.cookies?.PHPSESSID;
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.clearCookie('PHPSESSID');
  res.json({ success: true });
});

app.get('/pimcore-studio/api/session', requireAuth, (req, res) => {
  res.json({
    user: req.user,
    valid: true,
  });
});

// ===================
// ASSETS - Pimcore Types
// ===================

const mockAssets = [
  {
    id: 100,
    parentId: 1,
    path: '/',
    icon: createIcon('folder'),
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1559902252,
    modificationDate: 1620033099,
    elementType: 'asset',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: false,
    hasWorkflowWithPermissions: false,
    hasChildren: true,
    type: 'folder',
    filename: 'Car Images',
    mimeType: null,
    hasMetadata: false,
    fullPath: '/Car Images',
    permissions: createPermissions(),
    metadata: [],
    fileSize: 0,
  },
  {
    id: 101,
    parentId: 100,
    path: '/Car Images/',
    icon: createIcon('image'),
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1559902260,
    modificationDate: 1620033100,
    elementType: 'asset',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: false,
    hasWorkflowWithPermissions: false,
    hasChildren: false,
    type: 'image',
    filename: 'porsche-911-front.jpg',
    mimeType: 'image/jpeg',
    hasMetadata: true,
    fullPath: '/Car Images/porsche-911-front.jpg',
    permissions: createPermissions(),
    metadata: [],
    fileSize: 245000,
  },
  {
    id: 102,
    parentId: 100,
    path: '/Car Images/',
    icon: createIcon('image'),
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1559902265,
    modificationDate: 1620033101,
    elementType: 'asset',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: false,
    hasWorkflowWithPermissions: false,
    hasChildren: false,
    type: 'image',
    filename: 'porsche-911-side.jpg',
    mimeType: 'image/jpeg',
    hasMetadata: true,
    fullPath: '/Car Images/porsche-911-side.jpg',
    permissions: createPermissions(),
    metadata: [],
    fileSize: 312000,
  },
  {
    id: 103,
    parentId: 100,
    path: '/Car Images/',
    icon: createIcon('image'),
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1559902270,
    modificationDate: 1620033102,
    elementType: 'asset',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: false,
    hasWorkflowWithPermissions: false,
    hasChildren: false,
    type: 'image',
    filename: 'bmw-m3-front.jpg',
    mimeType: 'image/jpeg',
    hasMetadata: true,
    fullPath: '/Car Images/bmw-m3-front.jpg',
    permissions: createPermissions(),
    metadata: [],
    fileSize: 289000,
  },
  {
    id: 110,
    parentId: 1,
    path: '/',
    icon: createIcon('folder'),
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1566287896,
    modificationDate: 1620033101,
    elementType: 'asset',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: false,
    hasWorkflowWithPermissions: false,
    hasChildren: true,
    type: 'folder',
    filename: 'Documents',
    mimeType: null,
    hasMetadata: false,
    fullPath: '/Documents',
    permissions: createPermissions(),
    metadata: [],
    fileSize: 0,
  },
  {
    id: 111,
    parentId: 110,
    path: '/Documents/',
    icon: createIcon('pdf'),
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1620132057,
    modificationDate: 1620132057,
    elementType: 'asset',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: false,
    hasWorkflowWithPermissions: false,
    hasChildren: false,
    type: 'document',
    filename: 'car-manual.pdf',
    mimeType: 'application/pdf',
    hasMetadata: false,
    fullPath: '/Documents/car-manual.pdf',
    permissions: createPermissions(),
    metadata: [],
    fileSize: 1245000,
  },
];

// Get assets tree
app.get('/pimcore-studio/api/assets/tree', requireAuth, (req, res) => {
  const { parentId = 1, page = 1, pageSize = 100, excludeFolders } = req.query;

  let items = mockAssets.filter(a => a.parentId === parseInt(parentId));

  if (excludeFolders === 'true') {
    items = items.filter(a => a.type !== 'folder');
  }

  res.json({
    totalItems: items.length,
    items,
  });
});

// Get asset by ID
app.get('/pimcore-studio/api/assets/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const asset = mockAssets.find(a => a.id === id);

  if (asset) {
    res.json(asset);
  } else {
    res.status(404).json({ error: 'Asset not found' });
  }
});

// Asset image stream (return placeholder)
app.get('/pimcore-studio/api/assets/:id/image/stream/preview', (req, res) => {
  res.redirect('https://via.placeholder.com/200x200?text=Mock+Image');
});

// ===================
// DATA OBJECTS - Pimcore Types
// ===================

const mockDataObjects = [
  {
    id: 1,
    parentId: 0,
    path: '/',
    icon: createIcon('folder'),
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1559902200,
    modificationDate: 1620033000,
    elementType: 'data-object',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: false,
    hasWorkflowWithPermissions: false,
    hasChildren: true,
    type: 'folder',
    key: 'Products',
    fullPath: '/Products',
    permissions: createPermissions(),
    published: true,
    className: null,
  },
  {
    id: 2,
    parentId: 1,
    path: '/Products/',
    icon: createIcon('Car'),
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1704067200,
    modificationDate: 1704153600,
    elementType: 'data-object',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: true,
    hasWorkflowWithPermissions: false,
    hasChildren: false,
    type: 'object',
    key: 'Car-001',
    className: 'Car',
    fullPath: '/Products/Car-001',
    permissions: createPermissions(),
    published: true,
  },
  {
    id: 3,
    parentId: 1,
    path: '/Products/',
    icon: createIcon('Car'),
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1704067200,
    modificationDate: 1704153600,
    elementType: 'data-object',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: true,
    hasWorkflowWithPermissions: false,
    hasChildren: false,
    type: 'object',
    key: 'Car-002',
    className: 'Car',
    fullPath: '/Products/Car-002',
    permissions: createPermissions(),
    published: true,
  },
  {
    id: 4,
    parentId: 1,
    path: '/Products/',
    icon: createIcon('Car'),
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1704067200,
    modificationDate: 1704153600,
    elementType: 'data-object',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: true,
    hasWorkflowWithPermissions: false,
    hasChildren: false,
    type: 'object',
    key: 'Car-003',
    className: 'Car',
    fullPath: '/Products/Car-003',
    permissions: createPermissions(),
    published: false,
  },
];

const mockObjectDetails = {
  2: {
    id: 2,
    parentId: 1,
    path: '/Products/',
    icon: { type: 'path', value: '/static/images/icons/car_yellow.svg' },
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1704067200,
    modificationDate: 1704153600,
    elementType: 'data-object',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: true,
    hasWorkflowWithPermissions: false,
    hasChildren: false,
    type: 'object',
    key: 'Car-001',
    filename: 'Car-001',
    className: 'Car',
    fullPath: '/Products/Car-001',
    permissions: { ...createPermissions(), save: true, unpublish: true, localizedEdit: 'default,en,de', localizedView: 'default,en,de' },
    published: true,
    index: 0,
    childrenSortBy: 'key',
    childrenSortOrder: 'ASC',
    allowVariants: false,
    showVariants: false,
    allowInheritance: true,
    hasPreview: true,
    objectData: {
      localizedfields: {
        name: { default: null, en: 'Porsche 911 GT3', de: 'Porsche 911 GT3' },
        description: { default: null, en: '<p>The Porsche 911 GT3 is a high-performance sports car.</p>', de: '<p>Der Porsche 911 GT3 ist ein Hochleistungssportwagen.</p>' },
      },
      series: '911 GT3',
      manufacturer: { type: 'object', id: 10, fullPath: '/Manufacturers/Porsche', subtype: 'object', isPublished: true },
      bodyStyle: { type: 'object', id: 20, fullPath: '/Body-Styles/Coupe', subtype: 'object', isPublished: true },
      carClass: 'sports car',
      productionYear: 2024,
      color: 'yellow',
      country: 'DE',
      isAvailable: true,
      releaseDate: 1704067200,
      website: { type: 'external', path: 'https://www.porsche.com/911-gt3', text: 'Porsche 911 GT3' },
      categories: [
        { id: 6, type: 'object', subtype: 'Category', fullPath: '/Categories/Sports Cars', isPublished: true },
        { id: 7, type: 'object', subtype: 'Category', fullPath: '/Categories/Performance', isPublished: true },
      ],
      mainImage: { type: 'asset', id: 101, subtype: 'image', fullPath: '/Car Images/porsche-911-front.jpg' },
      genericImages: [
        { hotspots: [], marker: [], crop: [], image: { type: 'asset', id: 101, subtype: 'image', fullPath: '/Car Images/porsche-911-front.jpg' } },
        { hotspots: [], marker: [], crop: [], image: { type: 'asset', id: 102, subtype: 'image', fullPath: '/Car Images/porsche-911-side.jpg' } },
      ],
      location: { latitude: 48.7758, longitude: 9.1829 },
      attributes: {
        Bodywork: { numberOfDoors: 2, numberOfSeats: 2, cargoCapacity: null },
        Dimensions: {
          length: { value: 4573, unitId: 'mm' },
          width: { value: 1852, unitId: 'mm' },
          wheelbase: { value: 2457, unitId: 'mm' },
          weight: { value: 1435, unitId: 'kg' },
        },
        Engine: {
          cylinders: 6,
          capacity: { value: 3996, unitId: 'ccm' },
          power: { value: 375, unitId: 'kw' },
          engineLocation: 'rear',
        },
        Transmission: { wheelDrive: 'rear-wheel-drive' },
      },
      specifications: {
        engineSpecs: {
          displacement: '4.0L',
          cylinders: 6,
          fuelType: 'petrol',
          fuelConsumption: 12.4,
        },
        safetyFeatures: {
          airbags: 8,
          hasABS: true,
          hasESP: true,
          hasLaneAssist: true,
          ncapRating: '5',
        },
      },
    },
    inheritanceData: [],
    draftData: null,
  },
  3: {
    id: 3,
    parentId: 1,
    path: '/Products/',
    icon: { type: 'path', value: '/static/images/icons/car_white.svg' },
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1704067200,
    modificationDate: 1704153600,
    elementType: 'data-object',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: true,
    hasWorkflowWithPermissions: false,
    hasChildren: false,
    type: 'object',
    key: 'Car-002',
    filename: 'Car-002',
    className: 'Car',
    fullPath: '/Products/Car-002',
    permissions: { ...createPermissions(), save: true, unpublish: true },
    published: true,
    index: 1,
    allowVariants: false,
    showVariants: false,
    allowInheritance: true,
    hasPreview: true,
    objectData: {
      localizedfields: {
        name: { default: null, en: 'BMW M3 Competition', de: 'BMW M3 Competition' },
        description: { default: null, en: '<p>Performance sedan with excellent handling.</p>', de: '<p>Sportlimousine mit hervorragender Fahrdynamik.</p>' },
      },
      series: 'M3',
      manufacturer: { type: 'object', id: 11, fullPath: '/Manufacturers/BMW', subtype: 'object', isPublished: true },
      bodyStyle: { type: 'object', id: 21, fullPath: '/Body-Styles/Sedan', subtype: 'object', isPublished: true },
      carClass: 'sports sedan',
      productionYear: 2023,
      color: 'white',
      country: 'DE',
      isAvailable: true,
      releaseDate: 1680307200,
      categories: [
        { id: 6, type: 'object', subtype: 'Category', fullPath: '/Categories/Sports Cars', isPublished: true },
      ],
      mainImage: { type: 'asset', id: 103, subtype: 'image', fullPath: '/Car Images/bmw-m3-front.jpg' },
      genericImages: [
        { hotspots: [], marker: [], crop: [], image: { type: 'asset', id: 103, subtype: 'image', fullPath: '/Car Images/bmw-m3-front.jpg' } },
      ],
      attributes: {
        Bodywork: { numberOfDoors: 4, numberOfSeats: 5, cargoCapacity: 480 },
        Dimensions: {
          length: { value: 4794, unitId: 'mm' },
          width: { value: 1903, unitId: 'mm' },
          wheelbase: { value: 2857, unitId: 'mm' },
          weight: { value: 1730, unitId: 'kg' },
        },
        Engine: {
          cylinders: 6,
          capacity: { value: 2993, unitId: 'ccm' },
          power: { value: 375, unitId: 'kw' },
          engineLocation: 'front',
        },
        Transmission: { wheelDrive: 'rear-wheel-drive' },
      },
      specifications: {
        engineSpecs: {
          displacement: '3.0L Twin-Turbo',
          cylinders: 6,
          fuelType: 'petrol',
          fuelConsumption: 10.2,
        },
        safetyFeatures: {
          airbags: 6,
          hasABS: true,
          hasESP: true,
          hasLaneAssist: true,
          ncapRating: '5',
        },
        warranty: {
          years: 3,
          kilometers: 100000,
          conditions: 'Standard manufacturer warranty',
        },
      },
    },
    inheritanceData: [],
    draftData: null,
  },
  4: {
    id: 4,
    parentId: 1,
    path: '/Products/',
    icon: { type: 'path', value: '/static/images/icons/car_black.svg' },
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1704067200,
    modificationDate: 1704153600,
    elementType: 'data-object',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: true,
    hasWorkflowWithPermissions: false,
    hasChildren: false,
    type: 'object',
    key: 'Car-003',
    filename: 'Car-003',
    className: 'Car',
    fullPath: '/Products/Car-003',
    permissions: { ...createPermissions(), save: true, unpublish: true },
    published: false,
    index: 2,
    allowVariants: false,
    showVariants: false,
    allowInheritance: true,
    hasPreview: false,
    objectData: {
      localizedfields: {
        name: { default: null, en: 'Mercedes AMG GT', de: 'Mercedes AMG GT' },
        description: { default: null, en: '<p>Grand tourer with spectacular design.</p>', de: null },
      },
      series: 'AMG GT',
      manufacturer: { type: 'object', id: 12, fullPath: '/Manufacturers/Mercedes-Benz', subtype: 'object', isPublished: true },
      carClass: 'grand tourer',
      productionYear: 2024,
      color: 'black',
      country: 'DE',
      isAvailable: false,
      categories: [],
      attributes: {
        Engine: {
          cylinders: 8,
          capacity: { value: 3982, unitId: 'ccm' },
          power: { value: 430, unitId: 'kw' },
          engineLocation: 'front',
        },
      },
    },
    inheritanceData: [],
    draftData: null,
  },
};

// Layout definition for Car class
// Note: The app expects the layout directly (not wrapped in layoutDefinition)
const carLayout = {
  fieldtype: 'panel',
  datatype: 'layout',
  name: 'Car',
  title: 'Car',
  children: [
    {
      fieldtype: 'tabpanel',
      datatype: 'layout',
      name: 'Main',
      children: [
        {
          fieldtype: 'panel',
          datatype: 'layout',
          name: 'Basic Info',
          title: 'Basic Information',
          children: [
            { fieldtype: 'localizedfields', datatype: 'data', name: 'localizedfields', title: 'Localized Fields', children: [
              { fieldtype: 'input', datatype: 'data', name: 'name', title: 'Name', mandatory: true },
              { fieldtype: 'wysiwyg', datatype: 'data', name: 'description', title: 'Description' },
            ]},
            { fieldtype: 'input', datatype: 'data', name: 'series', title: 'Series' },
            { fieldtype: 'manyToOneRelation', datatype: 'data', name: 'manufacturer', title: 'Manufacturer' },
            { fieldtype: 'manyToOneRelation', datatype: 'data', name: 'bodyStyle', title: 'Body Style' },
            { fieldtype: 'input', datatype: 'data', name: 'carClass', title: 'Car Class' },
            { fieldtype: 'numeric', datatype: 'data', name: 'productionYear', title: 'Production Year' },
            { fieldtype: 'select', datatype: 'data', name: 'color', title: 'Color', options: [
              { key: 'red', value: 'Red' },
              { key: 'blue', value: 'Blue' },
              { key: 'black', value: 'Black' },
              { key: 'white', value: 'White' },
              { key: 'yellow', value: 'Yellow' },
            ]},
            { fieldtype: 'country', datatype: 'data', name: 'country', title: 'Country' },
            { fieldtype: 'checkbox', datatype: 'data', name: 'isAvailable', title: 'Available' },
            { fieldtype: 'date', datatype: 'data', name: 'releaseDate', title: 'Release Date' },
            { fieldtype: 'link', datatype: 'data', name: 'website', title: 'Manufacturer Website' },
          ],
        },
        {
          fieldtype: 'panel',
          datatype: 'layout',
          name: 'Relations',
          title: 'Relations',
          children: [
            { fieldtype: 'manyToManyObjectRelation', datatype: 'data', name: 'categories', title: 'Categories' },
          ],
        },
        {
          fieldtype: 'panel',
          datatype: 'layout',
          name: 'Media',
          title: 'Media',
          children: [
            { fieldtype: 'image', datatype: 'data', name: 'mainImage', title: 'Main Image' },
            { fieldtype: 'imageGallery', datatype: 'data', name: 'genericImages', title: 'Gallery' },
          ],
        },
        {
          fieldtype: 'panel',
          datatype: 'layout',
          name: 'Location',
          title: 'Location',
          children: [
            { fieldtype: 'geopoint', datatype: 'data', name: 'location', title: 'Showroom Location' },
          ],
        },
        {
          fieldtype: 'panel',
          datatype: 'layout',
          name: 'Attributes',
          title: 'Attributes',
          children: [
            { fieldtype: 'objectbricks', datatype: 'data', name: 'attributes', title: 'Attributes' },
          ],
        },
        {
          fieldtype: 'panel',
          datatype: 'layout',
          name: 'Specifications',
          title: 'Specifications',
          children: [
            { fieldtype: 'objectbricks', datatype: 'data', name: 'specifications', title: 'Specifications' },
          ],
        },
      ],
    },
  ],
};

// Object Brick Layouts - for both 'attributes' and 'specifications' objectbricks
const objectBrickLayouts = {
  items: {
    // Attributes bricks
    Bodywork: {
      layoutDefinition: {
        fieldtype: 'panel',
        datatype: 'layout',
        name: 'Bodywork',
        title: 'Bodywork',
        children: [
          { fieldtype: 'numeric', datatype: 'data', name: 'numberOfDoors', title: 'Number of Doors' },
          { fieldtype: 'numeric', datatype: 'data', name: 'numberOfSeats', title: 'Number of Seats' },
          { fieldtype: 'numeric', datatype: 'data', name: 'cargoCapacity', title: 'Cargo Capacity (L)' },
        ],
      },
    },
    Dimensions: {
      layoutDefinition: {
        fieldtype: 'panel',
        datatype: 'layout',
        name: 'Dimensions',
        title: 'Dimensions',
        children: [
          { fieldtype: 'quantityValue', datatype: 'data', name: 'length', title: 'Length' },
          { fieldtype: 'quantityValue', datatype: 'data', name: 'width', title: 'Width' },
          { fieldtype: 'quantityValue', datatype: 'data', name: 'wheelbase', title: 'Wheelbase' },
          { fieldtype: 'quantityValue', datatype: 'data', name: 'weight', title: 'Weight' },
        ],
      },
    },
    Engine: {
      layoutDefinition: {
        fieldtype: 'panel',
        datatype: 'layout',
        name: 'Engine',
        title: 'Engine',
        children: [
          { fieldtype: 'numeric', datatype: 'data', name: 'cylinders', title: 'Cylinders' },
          { fieldtype: 'quantityValue', datatype: 'data', name: 'capacity', title: 'Capacity' },
          { fieldtype: 'quantityValue', datatype: 'data', name: 'power', title: 'Power' },
          { fieldtype: 'select', datatype: 'data', name: 'engineLocation', title: 'Engine Location', options: [
            { key: 'front', value: 'Front' },
            { key: 'mid', value: 'Mid' },
            { key: 'rear', value: 'Rear' },
          ]},
        ],
      },
    },
    Transmission: {
      layoutDefinition: {
        fieldtype: 'panel',
        datatype: 'layout',
        name: 'Transmission',
        title: 'Transmission',
        children: [
          { fieldtype: 'select', datatype: 'data', name: 'wheelDrive', title: 'Wheel Drive', options: [
            { key: 'front-wheel-drive', value: 'Front Wheel Drive' },
            { key: 'rear-wheel-drive', value: 'Rear Wheel Drive' },
            { key: 'all-wheel-drive', value: 'All Wheel Drive' },
          ]},
        ],
      },
    },
    // Specifications bricks
    engineSpecs: {
      layoutDefinition: {
        fieldtype: 'panel',
        datatype: 'layout',
        name: 'engineSpecs',
        title: 'Engine Specifications',
        children: [
          { fieldtype: 'input', datatype: 'data', name: 'displacement', title: 'Displacement' },
          { fieldtype: 'numeric', datatype: 'data', name: 'cylinders', title: 'Cylinders' },
          { fieldtype: 'select', datatype: 'data', name: 'fuelType', title: 'Fuel Type', options: [
            { key: 'petrol', value: 'Petrol' },
            { key: 'diesel', value: 'Diesel' },
            { key: 'electric', value: 'Electric' },
            { key: 'hybrid', value: 'Hybrid' },
          ]},
          { fieldtype: 'numeric', datatype: 'data', name: 'fuelConsumption', title: 'Fuel Consumption (L/100km)' },
        ],
      },
    },
    safetyFeatures: {
      layoutDefinition: {
        fieldtype: 'panel',
        datatype: 'layout',
        name: 'safetyFeatures',
        title: 'Safety Features',
        children: [
          { fieldtype: 'numeric', datatype: 'data', name: 'airbags', title: 'Number of Airbags' },
          { fieldtype: 'checkbox', datatype: 'data', name: 'hasABS', title: 'ABS' },
          { fieldtype: 'checkbox', datatype: 'data', name: 'hasESP', title: 'ESP' },
          { fieldtype: 'checkbox', datatype: 'data', name: 'hasLaneAssist', title: 'Lane Assist' },
          { fieldtype: 'select', datatype: 'data', name: 'ncapRating', title: 'NCAP Rating', options: [
            { key: '5', value: '5 Stars' },
            { key: '4', value: '4 Stars' },
            { key: '3', value: '3 Stars' },
          ]},
        ],
      },
    },
    warranty: {
      layoutDefinition: {
        fieldtype: 'panel',
        datatype: 'layout',
        name: 'warranty',
        title: 'Warranty',
        children: [
          { fieldtype: 'numeric', datatype: 'data', name: 'years', title: 'Years' },
          { fieldtype: 'numeric', datatype: 'data', name: 'kilometers', title: 'Kilometers' },
          { fieldtype: 'date', datatype: 'data', name: 'validUntil', title: 'Valid Until' },
          { fieldtype: 'textarea', datatype: 'data', name: 'conditions', title: 'Conditions' },
        ],
      },
    },
  },
};

// Get data objects tree
app.get('/pimcore-studio/api/data-objects/tree', requireAuth, (req, res) => {
  const { parentId = 0, page = 1, pageSize = 100 } = req.query;

  const items = mockDataObjects.filter(obj => obj.parentId === parseInt(parentId));

  res.json({
    totalItems: items.length,
    items,
  });
});

// Get data object by ID
app.get('/pimcore-studio/api/data-objects/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const obj = mockObjectDetails[id] || mockDataObjects.find(o => o.id === id);

  if (obj) {
    res.json(obj);
  } else {
    res.status(404).json({ error: 'Object not found' });
  }
});

// Get data object layout
app.get('/pimcore-studio/api/data-objects/:id/layout', requireAuth, (req, res) => {
  res.json(carLayout);
});

// Get object brick layouts
app.get('/pimcore-studio/api/class/object-brick/:objectId/object/layout', requireAuth, (req, res) => {
  res.json(objectBrickLayouts);
});

// Get field collection layouts
app.get('/pimcore-studio/api/class/field-collection/:objectId/object/layout', requireAuth, (req, res) => {
  res.json({ items: {} });
});

// Update data object
app.put('/pimcore-studio/api/data-objects/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const obj = mockObjectDetails[id];

  if (obj) {
    const updated = { ...obj, modificationDate: Math.floor(Date.now() / 1000) };
    if (req.body?.data?.editableData) {
      updated.objectData = { ...updated.objectData, ...req.body.data.editableData };
    }
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Object not found' });
  }
});

// ===================
// DOCUMENTS - Pimcore Types
// ===================

const mockDocuments = [
  {
    id: 1,
    parentId: 0,
    path: '/',
    icon: createIcon('folder'),
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1559902200,
    modificationDate: 1620033000,
    elementType: 'document',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: false,
    hasWorkflowWithPermissions: false,
    hasChildren: true,
    type: 'folder',
    key: 'Home',
    fullPath: '/Home',
    permissions: createPermissions(),
    published: true,
  },
  {
    id: 10,
    parentId: 1,
    path: '/Home/',
    icon: createIcon('page'),
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1559902300,
    modificationDate: 1620033100,
    elementType: 'document',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: false,
    hasWorkflowWithPermissions: false,
    hasChildren: false,
    type: 'page',
    key: 'about-us',
    fullPath: '/Home/about-us',
    title: 'About Us',
    permissions: createPermissions(),
    published: true,
  },
  {
    id: 11,
    parentId: 1,
    path: '/Home/',
    icon: createIcon('page'),
    userOwner: 2,
    userModification: 2,
    locked: null,
    isLocked: false,
    creationDate: 1559902400,
    modificationDate: 1620033200,
    elementType: 'document',
    additionalAttributes: [],
    customAttributes: createCustomAttributes(),
    hasWorkflowAvailable: false,
    hasWorkflowWithPermissions: false,
    hasChildren: false,
    type: 'page',
    key: 'contact',
    fullPath: '/Home/contact',
    title: 'Contact',
    permissions: createPermissions(),
    published: true,
  },
];

// Get documents tree
app.get('/pimcore-studio/api/documents/tree', requireAuth, (req, res) => {
  const { parentId = 1, page = 1, pageSize = 100 } = req.query;

  const items = mockDocuments.filter(d => d.parentId === parseInt(parentId));

  res.json({
    totalItems: items.length,
    items,
  });
});

// Get document by ID
app.get('/pimcore-studio/api/documents/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const doc = mockDocuments.find(d => d.id === id);

  if (doc) {
    res.json(doc);
  } else {
    res.status(404).json({ error: 'Document not found' });
  }
});

// ===================
// SEARCH
// ===================

app.get('/pimcore-studio/api/search', requireAuth, (req, res) => {
  const { searchTerm = '', page = 1, pageSize = 20 } = req.query;
  const query = searchTerm.toLowerCase();

  const results = [];

  mockDataObjects.forEach(obj => {
    if (obj.key.toLowerCase().includes(query) || obj.fullPath.toLowerCase().includes(query)) {
      results.push({
        id: obj.id,
        type: obj.type,
        elementType: 'data-object',
        path: obj.fullPath,
        icon: obj.icon,
      });
    }
  });

  mockAssets.forEach(asset => {
    if (asset.filename.toLowerCase().includes(query) || asset.fullPath.toLowerCase().includes(query)) {
      results.push({
        id: asset.id,
        type: asset.type,
        elementType: 'asset',
        path: asset.fullPath,
        icon: asset.icon,
      });
    }
  });

  res.json({
    totalItems: results.length,
    items: results.slice(0, parseInt(pageSize)),
  });
});

// ===================
// CLASS DEFINITIONS
// ===================

const mockClassDefinitions = [
  {
    id: 'Car',
    name: 'Car',
    description: 'Car data class for automotive products',
  },
  {
    id: 'Category',
    name: 'Category',
    description: 'Category for organizing products',
  },
];

app.get('/pimcore-studio/api/class/collection', requireAuth, (req, res) => {
  res.json({ items: mockClassDefinitions });
});

app.get('/pimcore-studio/api/class-definitions', requireAuth, (req, res) => {
  res.json({ items: mockClassDefinitions });
});

app.get('/pimcore-studio/api/class/definition/:classId', requireAuth, (req, res) => {
  const classDef = mockClassDefinitions.find(c => c.id === req.params.classId);
  if (classDef) {
    res.json(classDef);
  } else {
    res.status(404).json({ error: 'Class not found' });
  }
});

app.get('/pimcore-studio/api/class/folder/:folderId', requireAuth, (req, res) => {
  res.json({ items: mockClassDefinitions.map(c => ({ id: c.id, name: c.name })) });
});

// ===================
// WORKFLOWS
// ===================

app.get('/pimcore-studio/api/workflows/details', requireAuth, (req, res) => {
  res.json({ items: [] });
});

app.post('/pimcore-studio/api/workflows/action', requireAuth, (req, res) => {
  res.json({ success: true });
});

// ===================
// HEALTH CHECK
// ===================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'pimcore-mock' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════════════╗
  ║   Pimcore Studio API Mock Server                           ║
  ╠════════════════════════════════════════════════════════════╣
  ║   Server running at: http://localhost:${PORT}                 ║
  ║   API Base: http://localhost:${PORT}/pimcore-studio/api       ║
  ║                                                            ║
  ║   Test Credentials: any username/password                  ║
  ║                                                            ║
  ║   Types based on @pimcore/studio-ui-bundle                 ║
  ╚════════════════════════════════════════════════════════════╝
  `);
});
