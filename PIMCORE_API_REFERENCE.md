# Pimcore Studio API Integration

## API Documentation Source

Based on official Pimcore Studio API OpenAPI specification:
- **Source**: https://github.com/pimcore/studio-ui-bundle/blob/1.x/assets/build/api/docs.jsonopenapi.json
- **Version**: 0.10.21
- **Base Path**: `/pimcore-studio/api`

## Authentication

### Session-Based Authentication

**Endpoint**: `POST /pimcore-studio/api/login`

**Request Body**:
```json
{
  "username": "your-username",
  "password": "your-password"
}
```

**Response**: Returns user information and sets HTTP-only session cookie

**Implementation**: 
- Uses `withCredentials: true` in axios
- Session managed automatically via cookies
- No token storage needed in app

**Logout**: `POST /pimcore-studio/api/logout`

## Class Definitions

### Get All Class Definitions

**Endpoint**: `GET /pimcore-studio/api/class/collection`

**Description**: Get collection of all class definitions

**Response**: Array of class definition objects

### Get Specific Class Definition

**Endpoint**: `GET /pimcore-studio/api/class/definition/{dataObjectClass}`

**Parameters**:
- `dataObjectClass` (path) - The class name/ID

**Response**: Class definition object with fields and configuration

## Data Objects

### Get Data Object by ID

**Endpoint**: `GET /pimcore-studio/api/data-objects/{id}`

**Parameters**:
- `id` (path) - The data object ID

**Response**: Data object details

### List Data Objects

**Endpoint**: `GET /pimcore-studio/api/data-objects`

**Query Parameters**:
- `classId` - Filter by class
- `page` - Page number for pagination
- `pageSize` - Number of items per page

**Response**: Paginated list of data objects

**Note**: For grid-based listing, use `/pimcore-studio/api/data-object/grid/*` endpoints

### Create Data Object

**Endpoint**: `POST /pimcore-studio/api/data-objects/add/{parentId}`

**Parameters**:
- `parentId` (path) - Parent folder/object ID

**Request Body**: Object data with class-specific fields

**Response**: Created data object

### Update Data Object

**Endpoint**: `PATCH /pimcore-studio/api/data-objects`

**Request Body**:
```json
{
  "id": 123,
  "field1": "value1",
  "field2": "value2"
}
```

**Response**: Updated data object

### Delete Data Object(s)

**Endpoint**: `DELETE /pimcore-studio/api/data-objects/batch-delete`

**Request Body**:
```json
{
  "ids": [123, 456, 789]
}
```

**Description**: Batch delete operation. Deletion is asynchronous and returns a jobRun ID.

**Note**: To delete a single object, wrap the ID in an array: `{ "ids": [123] }`

## Data Object Grid

For advanced listing and filtering, use the grid endpoints:

- `GET /pimcore-studio/api/data-object/grid/available-columns` - Get available columns
- `GET /pimcore-studio/api/data-object/grid/configuration/{folderId}/{classId}` - Get grid configuration
- `POST /pimcore-studio/api/data-object/grid/configuration/save/{classId}` - Save grid configuration

## Custom Layouts

**Endpoint**: `GET /pimcore-studio/api/class/custom-layout/collection/{dataObjectClass}`

Get custom layouts for a specific class

## Current Implementation

### Instance URL Format

When adding a Pimcore instance in the app, use the full base path:

**Correct**: `https://your-domain.com/pimcore-studio/api`

**Incorrect**: ~~`https://your-domain.com/studio/api`~~ (old assumption)

### Endpoints Used

1. **Authentication**: `/login`, `/logout`
2. **Class Definitions**: `/class/collection`, `/class/definition/{id}`
3. **Data Objects**: `/data-objects/{id}`, `/data-objects`, `/data-objects/add/{parentId}`
4. **Batch Operations**: `/data-objects/batch-delete`

### API Client Configuration

```typescript
const apiClient = axios.create({
  baseURL: 'https://your-instance.com/pimcore-studio/api',
  withCredentials: true,  // Required for session cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
```

## Migration from Old Implementation

### Changes Made

1. **Base Path**: Changed from `/studio/api` to `/pimcore-studio/api`
2. **Class Endpoints**: 
   - Old: `/data-objects/classes`
   - New: `/class/collection`
3. **Class Definition**:
   - Old: `/data-objects/classes/{id}`
   - New: `/class/definition/{id}`
4. **Create Object**:
   - Old: `/data-objects`
   - New: `/data-objects/add/{parentId}` (requires parent ID)
5. **Update Object**:
   - Old: `PATCH /data-objects/{id}`
   - New: `PATCH /data-objects` (with id in body)
6. **Delete Object**:
   - Old: `DELETE /data-objects/{id}`
   - New: `DELETE /data-objects/batch-delete` (with ids array)

## Testing

### Mock Fallback

The app includes mock data for offline development. If the API is unavailable:
- Mock class definitions (Product, Category) are returned
- Mock authentication accepts any credentials

### URL Validation

When adding instances, the app validates:
- URL format (must be valid HTTP/HTTPS)
- Includes the full path: `https://domain.com/pimcore-studio/api`

## References

- Official OpenAPI Spec: https://github.com/pimcore/studio-ui-bundle/blob/1.x/assets/build/api/docs.jsonopenapi.json
- Pimcore Studio UI Bundle: https://www.npmjs.com/package/@pimcore/studio-ui-bundle
- Pimcore Documentation: https://pimcore.com/docs/

## Notes

- All endpoints require session-based authentication (except `/login`)
- Batch operations are asynchronous and return jobRun IDs
- Grid endpoints provide advanced filtering and sorting capabilities
- Custom layouts allow for tailored data object views
