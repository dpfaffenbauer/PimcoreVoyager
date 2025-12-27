# Pimcore Studio API - Implementation Details

## Authentication Method ✅ CONFIRMED

**Pimcore Studio API uses:** Session-based authentication with cookies

### Implementation Details:
- **Login**: POST `/studio/api/login` with username/password
- **Session Management**: Server sets HTTP-only cookies
- **API Requests**: Cookies automatically sent with `withCredentials: true`
- **Logout**: POST `/studio/api/logout` to clear session

### Changes Made:
- ✅ Removed Bearer token authentication
- ✅ Added `withCredentials: true` to axios configuration
- ✅ Removed token storage from auth store
- ✅ Session managed automatically via cookies
- ✅ Updated LoginScreen to work with session auth

## API Endpoints (Still to verify)

Current implementation assumes:
```
Authentication:
POST /studio/api/login
POST /studio/api/logout
GET  /studio/api/session  # Check session validity

Data Objects:
GET  /studio/api/data-objects/classes       # List class definitions
GET  /studio/api/data-objects/classes/{id}  # Get class definition
GET  /studio/api/data-objects              # List objects
GET  /studio/api/data-objects/{id}         # Get object
PATCH /studio/api/data-objects/{id}        # Update object
POST /studio/api/data-objects              # Create object
DELETE /studio/api/data-objects/{id}       # Delete object
```

**Need to verify:**
- Are these the correct endpoints?
- Are there additional endpoints we should use?
- Is the URL structure different?
- What is the actual API response format?

## Documentation Sources

Would be helpful to have:
- Pimcore Studio API documentation URL
- Pimcore Studio API OpenAPI/Swagger spec
- Or: Example API calls from Pimcore Studio UI Bundle

---

**Created**: 2025-12-27
**Updated**: 2025-12-27
**Status**: Authentication method confirmed ✅ | Endpoints need verification ⏳
