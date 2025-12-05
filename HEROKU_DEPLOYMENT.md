# Heroku Deployment Guide

This guide walks through deploying the CleanBlogApp to Heroku.

## Prerequisites

1. **Heroku Account**: Sign up at https://www.heroku.com
2. **Heroku CLI**: Install from https://devcenter.heroku.com/articles/heroku-cli
3. **Git**: Initialize and configure git in your local project

## Setup Steps

### 1. Initialize Git Repository

If you haven't already, initialize a git repository:

```powershell
cd c:\code\CleanBlogApp
git init
git add .
git commit -m "Initial commit: CleanBlogApp ready for Heroku"
```

### 2. Install Heroku CLI

Download and install from: https://devcenter.heroku.com/articles/heroku-cli

### 3. Login to Heroku

```powershell
heroku login
```

This opens a browser window to authenticate.

### 4. Create Heroku App

```powershell
heroku create your-app-name
```

Replace `your-app-name` with a unique name. If omitted, Heroku generates one.

### 5. Set Environment Variables

Set the required environment variables in Heroku:

```powershell
heroku config:set MONGODB_URI="your_mongodb_atlas_uri"
heroku config:set SESSION_SECRET="your_secure_random_string"
```

**Important**:

- For `MONGODB_URI`, use your actual MongoDB Atlas connection string (format: `mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]`)
- For `SESSION_SECRET`, generate a strong random string:
  ```powershell
  [System.Guid]::NewGuid().ToString()
  ```

### 6. Deploy to Heroku

Push your code to Heroku:

```powershell
git push heroku main
```

If using `master` branch instead:

```powershell
git push heroku master
```

### 7. View App

Open your deployed app:

```powershell
heroku open
```

Or visit: `https://your-app-name.herokuapp.com`

### 8. Monitor Logs

View real-time logs:

```powershell
heroku logs --tail
```

## Configuration

### Files Already Updated for Heroku

1. **Procfile** - Tells Heroku how to start the app (`web: node index.js`)
2. **package.json**

   - `"engines": { "node": "18.x" }` - Specifies Node version
   - `"start": "node index.js"` - Production start command
   - `"dev": "nodemon index.js"` - Local development command

3. **index.js**
   - Updated to use `process.env.PORT` from Heroku or default to 4000

### Environment Variables

See `.env.example` for required variables:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `SESSION_SECRET`: A random secure string for session encryption

## MongoDB Atlas Configuration

Ensure your MongoDB Atlas IP whitelist allows Heroku connections:

1. Login to MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Go to your cluster's Network Access
3. Add `0.0.0.0/0` to allow all IPs (or add Heroku's IP range if available)
4. Ensure your database user has the appropriate permissions

## Testing Deployment

After deployment, test these features:

1. **Homepage**: Visit app and see blog posts
2. **Authentication**: Register a new account
3. **Login/Logout**: Test user authentication
4. **Create Post**: Create a new blog post with image
5. **Search**: Search for posts
6. **Image Gallery**: Verify images load from MongoDB

## Troubleshooting

### App crashes on startup

```powershell
heroku logs --tail
```

Check logs for errors. Usually due to:

- Missing environment variables
- Incorrect MONGODB_URI
- Port binding issues

### Images not loading

- Verify MongoDB connection from Heroku
- Check IMAGE model is properly referenced
- Ensure file uploads are working

### Session/login issues

- Verify SESSION_SECRET is set in Heroku Config Vars
- Check express-session configuration

## Useful Heroku Commands

```powershell
# View config variables
heroku config

# Add/update config variable
heroku config:set KEY=value

# Remove config variable
heroku config:unset KEY

# View app on Heroku dashboard
heroku apps

# Restart app
heroku restart

# View all recent logs
heroku logs

# View logs with follow (live)
heroku logs --tail
```

## Scale and Performance

Default Heroku deployment uses one free dyno. For production:

```powershell
# Scale to multiple dynos
heroku ps:scale web=2
```

## Updating Deployment

After making changes locally:

```powershell
git add .
git commit -m "Your commit message"
git push heroku main
```

The app will automatically redeploy.

## Rollback to Previous Version

```powershell
heroku releases
heroku rollback
```

## Conclusion

Your CleanBlogApp is now live on Heroku! Monitor performance and logs regularly to ensure smooth operation.
