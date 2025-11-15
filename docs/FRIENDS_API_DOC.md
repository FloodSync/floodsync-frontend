# Friends & Family API Documentation

This document outlines all the backend API endpoints required for the friends and family connection feature.

## Base URL

All endpoints are prefixed with `/api/v1`

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <user_token>
```

---

## 1. Get Friends List

**GET** `/api/v1/friends`

Get the list of all friends for the authenticated user.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "friends": [
    {
      "_id": "6912e2c09c5bb1e00e41d376",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+959123456789",
      "city": "Yangon",
      "township": "Hlaing",
      "isSafe": true,
      "lastSeen": "2025-11-14T12:00:00.000Z",
      "createdAt": "2025-11-01T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## 2. Search Users

**GET** `/api/v1/friends/search?q=searchTerm`

Search for users by phone number.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `q` (string, required): Phone number to search (can include +, spaces, or just digits)

**Example:**

```
GET /api/v1/friends/search?q=+959123456789
GET /api/v1/friends/search?q=959123456789
GET /api/v1/friends/search?q=09123456789
```

**Note:** Backend should normalize phone numbers (remove spaces, handle country codes) for matching.

**Response (200 OK):**

```json
{
  "success": true,
  "users": [
    {
      "_id": "6912e2c09c5bb1e00e41d377",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+959123456789",
      "city": "Yangon",
      "township": "Hlaing"
    }
  ]
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Phone number is required"
}
```

---

## 3. Send Friend Request

**POST** `/api/v1/friends/request`

Send a friend request to another user.

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "friendId": "6912e2c09c5bb1e00e41d377"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Friend request sent successfully",
  "request": {
    "_id": "6912e700f3c54766a240ef54",
    "from": {
      "_id": "6912e2c09c5bb1e00e41d376",
      "name": "Current User",
      "email": "user@example.com",
      "phone": "+959123456789"
    },
    "to": {
      "_id": "6912e2c09c5bb1e00e41d377",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+959987654321"
    },
    "status": "pending",
    "createdAt": "2025-11-14T12:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request - Already friends:**

```json
{
  "success": false,
  "message": "Already friends with this user"
}
```

**400 Bad Request - Request already sent:**

```json
{
  "success": false,
  "message": "Friend request already sent"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 4. Accept Friend Request

**POST** `/api/v1/friends/accept/:requestId`

Accept a pending friend request.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `requestId` (string, required): The ID of the friend request

**Example:**

```
POST /api/v1/friends/accept/6912e700f3c54766a240ef54
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Friend request accepted",
  "request": {
    "_id": "6912e700f3c54766a240ef54",
    "from": {
      "_id": "6912e2c09c5bb1e00e41d376",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "to": {
      "_id": "6912e2c09c5bb1e00e41d377",
      "name": "Current User",
      "email": "user@example.com"
    },
    "status": "accepted",
    "createdAt": "2025-11-14T12:00:00.000Z"
  }
}
```

**Error Responses:**

**404 Not Found:**

```json
{
  "success": false,
  "message": "Friend request not found"
}
```

**400 Bad Request:**

```json
{
  "success": false,
  "message": "Request already processed"
}
```

---

## 5. Reject Friend Request

**POST** `/api/v1/friends/reject/:requestId`

Reject a pending friend request.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `requestId` (string, required): The ID of the friend request

**Example:**

```
POST /api/v1/friends/reject/6912e700f3c54766a240ef54
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Friend request rejected",
  "request": {
    "_id": "6912e700f3c54766a240ef54",
    "from": {
      "_id": "6912e2c09c5bb1e00e41d376",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "to": {
      "_id": "6912e2c09c5bb1e00e41d377",
      "name": "Current User",
      "email": "user@example.com"
    },
    "status": "rejected",
    "createdAt": "2025-11-14T12:00:00.000Z"
  }
}
```

**Error Responses:**

**404 Not Found:**

```json
{
  "success": false,
  "message": "Friend request not found"
}
```

---

## 6. Get Friend Requests

**GET** `/api/v1/friends/requests`

Get all pending friend requests (both sent and received).

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "requests": [
    {
      "_id": "6912e700f3c54766a240ef54",
      "from": {
        "_id": "6912e2c09c5bb1e00e41d376",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "to": {
        "_id": "6912e2c09c5bb1e00e41d377",
        "name": "Current User",
        "email": "user@example.com"
      },
      "status": "pending",
      "createdAt": "2025-11-14T12:00:00.000Z"
    }
  ]
}
```

**Note:** Only return requests with `status: "pending"`

---

## 7. Remove Friend

**DELETE** `/api/v1/friends/:friendId`

Remove a friend from the user's friends list.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `friendId` (string, required): The ID of the friend to remove

**Example:**

```
DELETE /api/v1/friends/6912e2c09c5bb1e00e41d377
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Friend removed successfully"
}
```

**Error Responses:**

**404 Not Found:**

```json
{
  "success": false,
  "message": "Friend not found"
}
```

**400 Bad Request:**

```json
{
  "success": false,
  "message": "User is not your friend"
}
```

---

## Database Schema Requirements

### User Model

The User model should have a `friends` field:

```javascript
{
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ];
}
```

### FriendRequest Model

You'll need a FriendRequest model:

```javascript
{
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

### Friend Status (Optional Enhancement)

To track friend safety status, you may want to add:

- `isSafe` (boolean): Whether the friend has reported as safe
- `lastSeen` (Date): Last time the friend was active

---

## Implementation Notes

1. **Accept Friend Request**: When a request is accepted, add both users to each other's `friends` array
2. **Remove Friend**: Remove the friend from both users' `friends` arrays
3. **Search Users**:
   - Search by phone number only (not email or name)
   - Normalize phone numbers for matching (remove spaces, handle country codes like +95, 959, 09)
   - Exclude the current user and already-friended users from search results
4. **Prevent Duplicates**: Check if users are already friends before allowing requests
5. **Request Validation**: Ensure users can't send requests to themselves
6. **Phone Number Normalization**:
   - Accept formats: `+959123456789`, `959123456789`, `09123456789`, `+95 9 123 456 789`
   - Normalize to a standard format (e.g., `+959123456789`) for storage and comparison
   - Myanmar phone numbers typically: `+959XXXXXXXXX` (11 digits after +95)

---

## Example Backend Route Structure (Express.js)

```javascript
// GET /api/v1/friends
router.get("/friends", authenticate, async (req, res) => {
  // Get user's friends
});

// GET /api/v1/friends/search
router.get("/friends/search", authenticate, async (req, res) => {
  // Search users
});

// POST /api/v1/friends/request
router.post("/friends/request", authenticate, async (req, res) => {
  // Send friend request
});

// POST /api/v1/friends/accept/:requestId
router.post("/friends/accept/:requestId", authenticate, async (req, res) => {
  // Accept request
});

// POST /api/v1/friends/reject/:requestId
router.post("/friends/reject/:requestId", authenticate, async (req, res) => {
  // Reject request
});

// GET /api/v1/friends/requests
router.get("/friends/requests", authenticate, async (req, res) => {
  // Get pending requests
});

// DELETE /api/v1/friends/:friendId
router.delete("/friends/:friendId", authenticate, async (req, res) => {
  // Remove friend
});
```

---

## Backend Changes Required Summary

### 1. **Search Endpoint - Phone Number Only**

**Change:** The search endpoint should **ONLY** search by phone number, not email or name.

**Implementation:**

```javascript
// GET /api/v1/friends/search
router.get("/friends/search", authenticate, async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required",
    });
  }

  // Normalize phone number
  const normalizePhone = (phone) => {
    let cleaned = phone.replace(/\s/g, "").replace(/[^\d+]/g, "");

    // Handle Myanmar phone formats
    if (cleaned.startsWith("09")) {
      // Local format: 09XXXXXXXXX -> +959XXXXXXXXX
      cleaned = "+95" + cleaned.slice(1);
    } else if (cleaned.startsWith("959") && !cleaned.startsWith("+")) {
      // Without +: 959XXXXXXXXX -> +959XXXXXXXXX
      cleaned = "+" + cleaned;
    } else if (!cleaned.startsWith("+")) {
      // If no country code, assume Myanmar
      cleaned = "+95" + cleaned;
    }

    return cleaned;
  };

  const normalizedQuery = normalizePhone(q);

  // Search in database - try multiple formats
  const users = await User.find({
    $or: [
      { phone: normalizedQuery },
      { phone: normalizedQuery.replace("+", "") },
      { phone: "0" + normalizedQuery.slice(3) }, // Convert +959 to 09
      { phone: normalizedQuery.replace("+95", "95") }, // +959 to 959
    ],
    _id: { $ne: req.user._id }, // Exclude current user
    _id: { $nin: req.user.friends }, // Exclude already-friended users
  }).select("name email phone city township");

  res.json({
    success: true,
    users: users,
  });
});
```

### 2. **FriendRequest Response - Include Phone**

**Change:** When returning friend requests, include the `phone` field in the `from` and `to` objects.

**Example Response:**

```json
{
  "success": true,
  "requests": [
    {
      "_id": "...",
      "from": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+959123456789"
      },
      "to": {
        "_id": "...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+959987654321"
      },
      "status": "pending"
    }
  ]
}
```

### 3. **Phone Number Storage**

**Recommendation:** Store phone numbers in a normalized format (e.g., `+959123456789`) in your database for consistent searching and matching.

**Normalization Function:**

```javascript
function normalizePhoneNumber(phone) {
  // Remove all spaces and special characters except +
  let cleaned = phone.replace(/\s/g, "").replace(/[^\d+]/g, "");

  // Handle Myanmar formats
  if (cleaned.startsWith("09")) {
    return "+95" + cleaned.slice(1); // 09XXXXXXXXX -> +959XXXXXXXXX
  } else if (cleaned.startsWith("959") && !cleaned.startsWith("+")) {
    return "+" + cleaned; // 959XXXXXXXXX -> +959XXXXXXXXX
  } else if (!cleaned.startsWith("+")) {
    return "+95" + cleaned; // Add country code if missing
  }

  return cleaned;
}
```

### 4. **Database Index**

**Recommendation:** Add an index on the `phone` field for faster searches:

```javascript
// In your User schema
phone: {
  type: String,
  required: true,
  index: true, // Add index for faster search
  unique: true // If phone should be unique
}
```

---

## Summary of Changes

1. ✅ **Search endpoint** - Only search by phone number (not email/name)
2. ✅ **Phone normalization** - Handle formats: `+959`, `959`, `09`
3. ✅ **Include phone in responses** - Add phone to friend request responses
4. ✅ **Normalize storage** - Store phone numbers in consistent format
5. ✅ **Add database index** - Index phone field for performance
