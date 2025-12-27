# Pimcore Studio API - Implementation Details ✅ VERIFIED

## API Documentation Source

**Official OpenAPI Specification**: https://github.com/pimcore/studio-ui-bundle/blob/1.x/assets/build/api/docs.jsonopenapi.json

- **Version**: 0.10.21
- **Title**: Studio Backend API
- **Base Path**: `/pimcore-studio/api` (NOT `/studio/api`)

## Authentication Method ✅ CONFIRMED

**Pimcore Studio API uses:** Session-based authentication with cookies

### Implementation Details:
- **Login**: POST `/pimcore-studio/api/login` with username/password
- **Session Management**: Server sets HTTP-only cookies
- **API Requests**: Cookies automatically sent with `withCredentials: true`
- **Logout**: POST `/pimcore-studio/api/logout` to clear session

### Changes Made:
- ✅ Removed ****** authentication
- ✅ Added `withCredentials: true` to axios configuration
- ✅ Removed token storage from auth store
- ✅ Session managed automatically via cookies
- ✅ Updated LoginScreen to work with session auth

## API Endpoints ✅ VERIFIED

Based on official OpenAPI specification:

### Authentication
```
POST /pimcore-studio/api/login          # Session login
POST /pimcore-studio/api/logout         # Session logout
POST /pimcore-studio/api/login/token    # Token-based login (alternative)
```

### Class Definitions
```
GET  /pimcore-studio/api/class/collection                    # List all classes
GET  /pimcore-studio/api/class/definition/{dataObjectClass}  # Get class definition
GET  /pimcore-studio/api/class/custom-layout/collection/{dataObjectClass}  # Get custom layouts
```

### Data Objects
```
GET    /pimcore-studio/api/data-objects/{id}          # Get single object
GET    /pimcore-studio/api/data-objects               # List objects (with filters)
POST   /pimcore-studio/api/data-objects/add/{parentId} # Create object
PATCH  /pimcore-studio/api/data-objects               # Update object
DELETE /pimcore-studio/api/data-objects/batch-delete  # Delete object(s)
```

### Data Object Grid
```
GET  /pimcore-studio/api/data-object/grid/available-columns
GET  /pimcore-studio/api/data-object/grid/configuration/{folderId}/{classId}
POST /pimcore-studio/api/data-object/grid/configuration/save/{classId}
```

## Key Differences from Initial Implementation

### Base Path
- **Initial Assumption**: `/studio/api`
- **Actual API**: `/pimcore-studio/api` ✅ CORRECTED

### Class Definitions
- **Initial**: `/data-objects/classes`
- **Actual**: `/class/collection` ✅ CORRECTED

### Create Data Object
- **Initial**: `POST /data-objects`
- **Actual**: `POST /data-objects/add/{parentId}` ✅ CORRECTED
- **Note**: Requires parent folder/object ID

### Update Data Object
- **Initial**: `PATCH /data-objects/{id}`
- **Actual**: `PATCH /data-objects` (with id in request body) ✅ CORRECTED

### Delete Data Object
- **Initial**: `DELETE /data-objects/{id}`
- **Actual**: `DELETE /data-objects/batch-delete` (with ids array) ✅ CORRECTED
- **Note**: Batch operation, single delete wraps ID in array

## Implementation Status ✅ COMPLETE

- ✅ Authentication method confirmed (session-based)
- ✅ API endpoints verified against OpenAPI spec
- ✅ Base path corrected (`/pimcore-studio/api`)
- ✅ All endpoint paths updated
- ✅ Request/response formats aligned with spec
- ✅ Documentation created (`PIMCORE_API_REFERENCE.md`)
- ✅ Helper text updated in UI (correct URL format)

## Usage in App

### Adding Instance
When adding a Pimcore instance, users should enter the full API URL:

**Correct Format**: `https://your-domain.com/pimcore-studio/api`

Example URLs:
- `https://demo.pimcore.com/pimcore-studio/api`
- `https://my-shop.com/pimcore-studio/api`
- `http://localhost:8080/pimcore-studio/api`

### Multi-Tenant Support
Each configured instance can have a different URL, allowing connection to:
- Production environments
- Staging environments
- Development/local instances
- Different customer installations

---

**Last Updated**: 2025-12-27
**Status**: All endpoints verified against official OpenAPI specification ✅
**OpenAPI Version**: 0.10.21
