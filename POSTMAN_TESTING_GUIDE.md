# Postman Testing Guide - API Routes

This guide shows you how to test your API routes with and without authentication in Postman.

---

## 📋 Table of Contents
1. [Testing Public Routes (No Auth Required)](#1-testing-public-routes)
2. [Testing Protected Routes (With Auth)](#2-testing-protected-routes-with-auth)
3. [Temporarily Testing Routes Without AuthMiddleware](#3-temporarily-testing-without-authmiddleware)
4. [Quick Reference](#quick-reference)

---

## 1. Testing Public Routes (No Auth Required)

### Route: `GET /api/concerns/control-number/:controlNumber`

This route doesn't require authentication, so you can test it directly.

**Postman Setup:**
1. **Method:** `GET`
2. **URL:** `http://localhost:5002/api/concerns/control-number/RMF-ABC-2024-01-001`
   - Replace `RMF-ABC-2024-01-001` with an actual control number
3. **Headers:** None required
4. **Body:** None

**Example Request:**
```
GET http://localhost:5002/api/concerns/control-number/RMF-ABC-2024-01-001
```

**Expected Response:**
```json
{
  "id": 1,
  "controlNumber": "RMF-ABC-2024-01-001",
  "description": "Sample concern",
  ...
}
```

---

## 2. Testing Protected Routes (With Auth)

Protected routes require a JWT token. Follow these steps:

### Step 1: Get a JWT Token (Login)

**Postman Setup:**
1. **Method:** `POST`
2. **URL:** `http://localhost:5002/api/user/login`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Example Request:**
```
POST http://localhost:5002/api/user/login
Content-Type: application/json

{
  "email": "sison0422@gmail.com",
  "password": "your-password"
}
```

**Expected Response:**
```json
{
  "error": false,
  "user": {
    "id": 1,
    "email": "sison0422@gmail.com",
    "username": "sison0422",
    "roleId": 1
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoic2lzb24wNDIyQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoic2lzb24wNDIyIiwiaWF0IjoxNzM0NTY3ODkwLCJleHAiOjE3MzQ2NTQyOTB9.xxxxx",
  "message": "Login successful"
}
```

**⚠️ IMPORTANT:** Copy the `accessToken` value - you'll need it for protected routes!

---

### Step 2: Use Token in Protected Routes

Now use the token you received in the Authorization header.

#### Example 1: Get All Concerns

**Postman Setup:**
1. **Method:** `GET`
2. **URL:** `http://localhost:5002/api/concerns`
3. **Headers:**
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - Replace `YOUR_TOKEN_HERE` with the token from Step 1

**Example Request:**
```
GET http://localhost:5002/api/concerns
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Postman UI Steps:**
1. Go to **Headers** tab
2. Add new header:
   - **Key:** `Authorization`
   - **Value:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your full token)

---

#### Example 2: Create a Concern

**Postman Setup:**
1. **Method:** `POST`
2. **URL:** `http://localhost:5002/api/concerns`
3. **Headers:**
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "description": "Test concern from Postman",
  "location": "1",
  "item": "1",
  "reportedBy": "Test User",
  "endUser": "End User",
  "levelOfRepair": "Minor",
  "status": "Pending"
}
```

---

#### Example 3: Update a Concern

**Postman Setup:**
1. **Method:** `PUT`
2. **URL:** `http://localhost:5002/api/concerns/1`
   - Replace `1` with actual concern ID
3. **Headers:**
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "description": "Updated description",
  "status": "In Progress"
}
```

---

#### Example 4: Delete a Concern

**Postman Setup:**
1. **Method:** `DELETE`
2. **URL:** `http://localhost:5002/api/concerns/1`
   - Replace `1` with actual concern ID
3. **Headers:**
   - `Authorization: Bearer YOUR_TOKEN_HERE`

---

### Using Postman Environment Variables (Recommended)

To avoid copying/pasting tokens repeatedly:

1. **Create Environment:**
   - Click **Environments** → **+** (Create)
   - Name: `NDC_RMS Local`
   - Add variable: `token` (leave value empty for now)
   - Click **Save**

2. **Set Token After Login:**
   - After login request, go to **Tests** tab
   - Add this script:
   ```javascript
   if (pm.response.code === 200) {
       const jsonData = pm.response.json();
       if (jsonData.accessToken) {
           pm.environment.set("token", jsonData.accessToken);
           console.log("Token saved to environment!");
       }
   }
   ```
   - Run login request → token auto-saves!

3. **Use Token in Other Requests:**
   - In **Headers**, use: `Authorization: Bearer {{token}}`
   - Postman will automatically replace `{{token}}` with the saved value

---

## 3. Temporarily Testing Without AuthMiddleware

If you want to test routes **without** authentication (for development/debugging):

### Option A: Comment Out AuthMiddleware (Temporary)

**File:** `server/routes/ConcernRoutes.js`

**Before:**
```javascript
router.get("/", authMiddleware, getConcerns);
```

**After (temporarily):**
```javascript
router.get("/", getConcerns);  // authMiddleware commented out for testing
// router.get("/", authMiddleware, getConcerns);
```

**⚠️ WARNING:** Remember to uncomment it after testing! This is a security risk.

---

### Option B: Create Test Routes (Better Approach)

Create a separate test route file that doesn't use authMiddleware:

**File:** `server/routes/TestRoutes.js`
```javascript
import express from "express";
import { getConcerns } from "../controllers/ConcernController.js";

const router = express.Router();

// Test routes without auth (ONLY FOR DEVELOPMENT)
router.get("/test/concerns", getConcerns);

export default router;
```

**File:** `server/index.js`
```javascript
// Add this ONLY in development
if (process.env.NODE_ENV !== 'production') {
  import TestRoutes from "./routes/TestRoutes.js";
  app.use("/api/test", TestRoutes);
}
```

Then test: `GET http://localhost:5002/api/test/concerns`

---

## Quick Reference

### All Concern Routes:

| Route | Method | Auth Required | Postman URL |
|-------|--------|---------------|-------------|
| Get all concerns | `GET` | ✅ Yes | `http://localhost:5002/api/concerns` |
| Get concern by ID | `GET` | ✅ Yes | `http://localhost:5002/api/concerns/1` |
| Get by control number | `GET` | ❌ No | `http://localhost:5002/api/concerns/control-number/RMF-ABC-2024-01-001` |
| Create concern | `POST` | ✅ Yes | `http://localhost:5002/api/concerns` |
| Update concern | `PUT` | ✅ Yes | `http://localhost:5002/api/concerns/1` |
| Delete concern | `DELETE` | ✅ Yes | `http://localhost:5002/api/concerns/1` |

### Auth Routes:

| Route | Method | Auth Required | Postman URL |
|-------|--------|---------------|-------------|
| Login | `POST` | ❌ No | `http://localhost:5002/api/user/login` |
| Register | `POST` | ❌ No | `http://localhost:5002/api/user/create-account` |

---

## Common Errors & Solutions

### Error: `401 Unauthorized` or `"No token provided"`
**Problem:** Missing or incorrect Authorization header  
**Solution:** 
- Check that header is: `Authorization: Bearer YOUR_TOKEN`
- Make sure there's a space between "Bearer" and the token
- Verify token is not expired (tokens expire after 24h by default)

### Error: `403 Forbidden` or `"Invalid token"`
**Problem:** Token is invalid or expired  
**Solution:**
- Get a new token by logging in again
- Check that `JWT_SECRET` environment variable is set correctly

### Error: `CORS error`
**Problem:** CORS blocking the request  
**Solution:**
- Your server allows all origins (`origin: "*"`), so this shouldn't happen
- If it does, check server is running on correct port

### Error: `Connection refused`
**Problem:** Server is not running  
**Solution:**
- Start your server: `npm start` or `node server/index.js`
- Verify server is running on port 5002 (or your configured port)

---

## Postman Collection Setup

### Create a Collection:

1. Click **New** → **Collection**
2. Name it: `NDC_RMS API`
3. Add requests:
   - `Login` (POST /user/login)
   - `Get All Concerns` (GET /concerns)
   - `Create Concern` (POST /concerns)
   - etc.

### Pre-request Script (Auto-login):

Add this to your collection's **Pre-request Script** tab:

```javascript
// Auto-login if token is missing or expired
const token = pm.environment.get("token");
const tokenExpiry = pm.environment.get("tokenExpiry");

if (!token || (tokenExpiry && Date.now() > tokenExpiry)) {
    pm.sendRequest({
        url: pm.environment.get("baseUrl") + "/api/user/login",
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: pm.environment.get("testEmail"),
                password: pm.environment.get("testPassword")
            })
        }
    }, function (err, res) {
        if (res.code === 200) {
            const jsonData = res.json();
            pm.environment.set("token", jsonData.accessToken);
            console.log("Auto-logged in!");
        }
    });
}
```

---

## Testing Checklist

- [ ] Test public route (status check) - should work without token
- [ ] Test login - should return token
- [ ] Test protected route WITHOUT token - should return 401
- [ ] Test protected route WITH token - should work
- [ ] Test with expired/invalid token - should return 403
- [ ] Test all CRUD operations with valid token

---

**Happy Testing! 🚀**

