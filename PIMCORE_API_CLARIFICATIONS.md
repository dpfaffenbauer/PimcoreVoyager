# Pimcore Studio API - Implementation Questions

## Current Status

The implementation currently uses **assumed** Pimcore Studio API endpoints and authentication method based on common REST API patterns.

## Questions for Clarification

### 1. Authentication Method
**Question:** Welche Authentifizierungsmethode verwendet die Pimcore Studio API?

Current implementation uses:
- Bearer Token authentication
- Token received from `/studio/api/login`
- Token sent in `Authorization: Bearer <token>` header

**Possible alternatives:**
- Session-based authentication with cookies
- API Keys
- Basic Authentication
- Other method?

### 2. API Endpoints
**Question:** Was sind die tatsächlichen Pimcore Studio API Endpunkte?

Current implementation assumes:
```
Authentication:
POST /studio/api/login

Data Objects:
GET  /studio/api/data-objects/classes       # List class definitions
GET  /studio/api/data-objects/classes/{id}  # Get class definition
GET  /studio/api/data-objects              # List objects
GET  /studio/api/data-objects/{id}         # Get object
PATCH /studio/api/data-objects/{id}        # Update object
POST /studio/api/data-objects              # Create object
DELETE /studio/api/data-objects/{id}       # Delete object
```

**Need to know:**
- Are these the correct endpoints?
- Are there additional endpoints we should use?
- Is the URL structure different?
- What is the actual API response format?

## Next Steps

Once we have clarity on:
1. The actual authentication method
2. The correct API endpoint structure

We can update the implementation to match the real Pimcore Studio API.

## Documentation Sources Needed

- Pimcore Studio API documentation URL
- Pimcore Studio API OpenAPI/Swagger spec
- Or: Example API calls from Pimcore Studio UI Bundle

---

**Created**: 2025-12-27
**Status**: Waiting for clarification from @dpfaffenbauer
