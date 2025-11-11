# API Binding Confirmation ✅

## Frontend ↔ Backend Connection Status

The frontend is **fully connected** to your backend push notification endpoints.

### ✅ Endpoint 1: Register/Update Push Token

**Backend Endpoint:**
```
POST /api/v1/user/push-token
Headers: Authorization: Bearer <token>
Body: { "pushToken": "ExponentPushToken[...]" }
```

**Frontend Implementation:**
- **File:** `lib/api/notifications.ts`
- **Function:** `registerPushToken(token, pushToken)`
- **Route:** `/user/push-token` (automatically prefixed with `/api/v1` from baseURL)
- **Method:** POST
- **Auth:** ✅ Uses `Bearer ${token}` header
- **Body:** ✅ Sends `{ pushToken }`

**Response Handling:**
- ✅ Expects `{ success: boolean, message: string }`
- ✅ Handles 400 errors (missing/invalid token)
- ✅ Handles 500 errors

### ✅ Endpoint 2: Remove Push Token

**Backend Endpoint:**
```
DELETE /api/v1/user/push-token
Headers: Authorization: Bearer <token>
```

**Frontend Implementation:**
- **File:** `lib/api/notifications.ts`
- **Function:** `removePushToken(token)`
- **Route:** `/user/push-token` (automatically prefixed with `/api/v1` from baseURL)
- **Method:** DELETE
- **Auth:** ✅ Uses `Bearer ${token}` header

**Response Handling:**
- ✅ Expects `{ success: boolean, message: string }`
- ✅ Handles errors gracefully

## Automatic Integration

The push token registration happens automatically:

1. **On App Start** (`app/_layout.tsx`):
   - When user is authenticated → Automatically calls `registerPushToken()`

2. **On Logout** (`hooks/use-auth.ts`):
   - When user logs out → Automatically calls `removePushToken()`

3. **Notification Service** (`lib/notifications/notification-service.ts`):
   - Gets Expo push token from device
   - Sends it to backend via `registerPushToken()`
   - Handles errors gracefully

## API Base URL Configuration

**File:** `lib/api/client.ts`

```typescript
const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api/v1";
```

**To configure for your backend:**
1. Set `EXPO_PUBLIC_API_URL` in your `.env` file
2. Format: `http://your-backend-url:port/api/v1`
3. For mobile testing: Use your computer's IP (e.g., `http://192.168.1.100:8000/api/v1`)

## Testing the Connection

### Test 1: Register Push Token
```bash
# The app will automatically do this on login, but you can test manually:
# Check console logs when user logs in - should see:
# "Push token registered with backend: ExponentPushToken[...]"
```

### Test 2: Remove Push Token
```bash
# The app will automatically do this on logout
# Check console logs when user logs out - should see:
# "Push token unregistered from backend"
```

### Test 3: Manual API Test
```bash
# Using curl (replace with your actual token and push token):
curl -X POST http://localhost:8000/api/v1/user/push-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"pushToken": "ExponentPushToken[test123]"}'

# Expected response:
# {"success": true, "message": "Push token registered successfully"}
```

## Status: ✅ READY

Everything is connected and ready to use! Just make sure:

1. ✅ Your backend has the endpoints implemented
2. ✅ Your backend User model has the push token fields
3. ✅ Your backend is running and accessible
4. ✅ `EXPO_PUBLIC_API_URL` is set correctly (or using default localhost)

The frontend will automatically register/unregister push tokens when users log in/out.

