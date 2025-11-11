# API Endpoints Verification ✅

## Frontend ↔ Backend Endpoint Mapping

All endpoints are correctly configured and match your backend API:

### ✅ Authenticated User Endpoints

| Endpoint | Method | Frontend Function | Status |
|----------|--------|-------------------|--------|
| `/api/v1/user/push-token` | POST | `registerPushToken()` | ✅ Matches |
| `/api/v1/user/push-token` | DELETE | `removePushToken()` | ✅ Matches |
| `/api/v1/user/push-notifications` | PATCH | `togglePushNotifications()` | ✅ Matches |
| `/api/v1/user/test/push` | POST | `testPushNotification()` | ✅ Matches |

### ✅ Anonymous Device Endpoints

| Endpoint | Method | Frontend Function | Status |
|----------|--------|-------------------|--------|
| `/api/v1/device/push-token` | POST | `registerPushTokenUnauthenticated()` | ✅ Matches |

## Endpoint Details

### 7. Register/Update Push Token ✅
- **Frontend:** `notificationsApi.registerPushToken(token, pushToken)`
- **Backend:** `POST /api/v1/user/push-token`
- **Auth:** ✅ Bearer token
- **Body:** `{ "pushToken": "..." }`
- **Response:** `{ "success": true, "message": "..." }`

### 8. Remove Push Token ✅
- **Frontend:** `notificationsApi.removePushToken(token)`
- **Backend:** `DELETE /api/v1/user/push-token`
- **Auth:** ✅ Bearer token
- **Response:** `{ "success": true, "message": "..." }`

### 9. Toggle Push Notifications ✅
- **Frontend:** `notificationsApi.togglePushNotifications(token, enabled)`
- **Backend:** `PATCH /api/v1/user/push-notifications`
- **Auth:** ✅ Bearer token
- **Body:** `{ "enabled": true/false }`
- **Response:** `{ "success": true, "message": "..." }`

### 10. Test Push Notification ✅
- **Frontend:** `notificationsApi.testPushNotification(token)`
- **Backend:** `POST /api/v1/user/test/push`
- **Auth:** ✅ Bearer token
- **Response:** `{ "success": true/false, "message": "..." }`

### 12. Register Push Token (Anonymous) ✅
- **Frontend:** `notificationsApi.registerPushTokenUnauthenticated(pushToken)`
- **Backend:** `POST /api/v1/device/push-token`
- **Auth:** ❌ No authentication required
- **Body:** `{ "pushToken": "..." }`
- **Response:** `{ "success": true, "message": "..." }`

## Automatic Usage

The frontend automatically uses these endpoints:

1. **On App Start** → Registers push token (authenticated or anonymous)
2. **On Login** → Re-registers token with user account
3. **On Logout** → Removes push token from user account

## Manual Usage Examples

```typescript
import { notificationsApi } from "@/lib/api/notifications";
import { useAuthStore } from "@/stores/auth-store";

// Get auth token
const { token } = useAuthStore();

// Register push token (authenticated)
await notificationsApi.registerPushToken(token, pushToken);

// Register push token (anonymous)
await notificationsApi.registerPushTokenUnauthenticated(pushToken);

// Remove push token
await notificationsApi.removePushToken(token);

// Toggle notifications
await notificationsApi.togglePushNotifications(token, true);

// Test notification
await notificationsApi.testPushNotification(token);
```

## Status: ✅ ALL ENDPOINTS CONFIGURED

All your backend endpoints are correctly mapped in the frontend and ready to use!

