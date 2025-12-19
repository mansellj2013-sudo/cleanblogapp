# Session-Based Gateway Configuration Guide

## Overview

This guide explains how to configure your second Heroku application to work with the CleanBlogApp gateway using **session-based validation** (not tokens).

Both applications will share the same MongoDB session store, allowing seamless authentication across the gateway.

---

## Architecture

```
┌─────────────────────────────────────┐
│   CleanBlogApp (Gateway)            │
│   ├─ Authentication Management      │
│   ├─ Shared MongoDB Session Store   │
│   └─ Routes /app/* -> Second App    │
└────────────┬────────────────────────┘
             │
             ├─ Session Validation
             └─> Second Heroku Application
                 ├─ Reads user session
                 └─ Returns app-specific data
```

---

## Prerequisites

- Node.js/Express application for the second app
- Same MongoDB Atlas cluster URI
- Same SESSION_SECRET value

---

## Step 1: Install Dependencies in Second App

```bash
npm install express express-session connect-mongo dotenv mongoose
```

---

## Step 2: Configure Environment Variables

Set these Heroku config variables for your second app:

```bash
heroku config:set MONGODB_URI="your_mongodb_atlas_uri" --app second-app-name
heroku config:set SESSION_SECRET="your_secure_random_string" --app second-app-name
heroku config:set NODE_ENV="production" --app second-app-name
```

**Important:** Use the **exact same** `MONGODB_URI` and `SESSION_SECRET` as your gateway app.

---

## Step 3: Configure Session Store in Second App

In your second app's main server file (e.g., `server.js`), configure express-session:

```javascript
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session with MongoDB store (CRITICAL: Same as gateway)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600, // lazy session update
    }),
    cookie: {
      secure: true, // Use true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// ... rest of your app
```

---

## Step 4: Read Session Info from Request Headers

The gateway attaches session information in request headers. Access it like this:

```javascript
app.get("/api/user", (req, res) => {
  // Get user info from headers (sent by gateway)
  const userId = req.headers["x-session-user-id"];
  const userEmail = req.headers["x-session-user-email"];

  // Or check if session exists directly
  if (req.session && req.session.userId) {
    return res.json({
      userId: req.session.userId,
      email: req.session.userEmail,
      authenticated: true,
    });
  }

  res.status(401).json({ error: "Unauthorized" });
});
```

---

## Step 5: Validate Session in Your Routes

Create middleware in your second app to check authentication:

```javascript
// middleware/authCheck.js
export const checkSession = (req, res, next) => {
  const userId = req.headers["x-session-user-id"] || 
                 (req.session && req.session.userId);

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Optional: Verify user exists in your database
  next();
};

// Usage in routes
app.get("/api/protected-resource", checkSession, (req, res) => {
  res.json({ data: "This is protected" });
});
```

---

## Step 6: Access Second App Through Gateway

Users access your second app through the gateway:

```
https://your-gateway-app.herokuapp.com/app/
https://your-gateway-app.herokuapp.com/app/api/user
https://your-gateway-app.herokuapp.com/app/api/protected-resource
```

---

## Available Gateway Endpoints

The gateway provides these utility endpoints:

### 1. Health Check
```
GET /gateway/health
```
Response:
```json
{
  "status": "ok",
  "gateway": "active",
  "secondAppUrl": "https://...",
  "timestamp": "2025-12-19T..."
}
```

### 2. Session Info
```
GET /gateway/session-info
```
Requires authentication. Returns current user's session details.

### 3. Logout
```
GET /gateway/logout
```
Destroys the user's session.

---

## Flow Diagram

1. **User logs in** at `https://gateway.herokuapp.com/login`
   - Session created in shared MongoDB store
   - Session cookie set with `SESSION_SECRET`

2. **User accesses app** at `https://gateway.herokuapp.com/app/api/user`
   - Gateway validates session exists
   - Attaches user info to headers
   - Proxies request to second app: `/api/user`

3. **Second app responds**
   - Reads session from MongoDB (same store)
   - Reads headers with user info
   - Returns authenticated response

4. **User logs out**
   - Session destroyed from MongoDB
   - Session cookie cleared
   - Access to `/app/*` routes denied

---

## Troubleshooting

### Issue: "No valid session found"
- Verify `SESSION_SECRET` is identical in both apps
- Check `MONGODB_URI` is the same
- Ensure MongoDB Atlas allows connections from both Heroku apps

### Issue: Session not persisting
- Check that MongoDB session collection exists: `db.sessions.find()`
- Verify `mongoUrl` is correct in both apps
- Check MongoDB Atlas connection string includes `retryWrites=true`

### Issue: User info not available in second app
- Verify headers are being sent: check `req.headers["x-session-user-id"]`
- Ensure `attachSessionInfo` middleware runs before proxy

---

## Security Notes

⚠️ **Important:**
- Keep `SESSION_SECRET` secure - never commit to Git
- Use `secure: true` for cookies in production with HTTPS
- Set `httpOnly: true` to prevent XSS attacks
- Whitelist allowed origins if adding CORS

---

## Example: Complete Second App Setup

```javascript
// server.js
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Session setup (identical to gateway)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600,
    }),
    cookie: { secure: true, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

// Middleware
app.use(express.json());

// Check session middleware
const checkSession = (req, res, next) => {
  const userId = req.headers["x-session-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  next();
};

// Routes
app.get("/api/user", checkSession, (req, res) => {
  res.json({
    userId: req.headers["x-session-user-id"],
    email: req.headers["x-session-user-email"],
  });
});

app.get("/api/protected", checkSession, (req, res) => {
  res.json({ data: "Protected resource" });
});

app.listen(PORT, () => console.log(`App on port ${PORT}`));
```

---

## Next Steps

1. Set up your second app using this configuration
2. Deploy to Heroku
3. Set environment variables on both apps
4. Test the gateway endpoints
5. Access your second app through `/app/` route prefix
