# MongoDB Setup Guide

## Prerequisites
- MongoDB installed and running
- MongoDB connection URI in `.env.local`
- MongoDB Compass (optional, for GUI)

## Quick Setup (All Collections)

### Option 1: Using MongoDB Shell (mongosh)

1. **Connect to your MongoDB instance:**
   ```bash
   mongosh "mongodb+srv://AccuCoder:AccucoderMONGODB@cluster0.hhijtee.mongodb.net/?appName=Cluster0"
   ```
   
   Replace `<db_password>` with your actual database password.

2. **Switch to your database:**
   ```javascript
   use accucoder
   ```

3. **Run the complete setup script:**
   ```bash
   load("guide/mongodb/00-complete-setup.js")
   ```

### Option 2: Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to your MongoDB instance
3. Select your database (e.g., `accucoder`)
4. Click on the "Mongosh" tab at the bottom
5. Copy and paste the contents of `00-complete-setup.js`
6. Press Enter to execute

### Option 3: Run Individual Scripts

Execute each script in order:

```bash
# Connect to MongoDB
mongosh "mongodb+srv://AccuCoder:<db_password>@cluster0.hhijtee.mongodb.net/?appName=Cluster0"

# Switch to database
use accucoder

# Run scripts in order
load("guide/mongodb/01-chathistories.js")
load("guide/mongodb/02-auditlogs.js")
load("guide/mongodb/03-notifications.js")
load("guide/mongodb/04-indexes-users.js")
load("guide/mongodb/05-indexes-reviews.js")
load("guide/mongodb/06-indexes-sessions.js")
```

## Verify Setup

After running the scripts, verify the setup:

```javascript
// List all collections
show collections

// Check indexes for each collection
db.chathistories.getIndexes()
db.auditlogs.getIndexes()
db.notifications.getIndexes()
db.users.getIndexes()
db.reviews.getIndexes()
db.sessions.getIndexes()

// Check collection stats
db.chathistories.stats()
db.auditlogs.stats()
db.notifications.stats()
```

## Connection URI Format

Your MongoDB connection URI should be in `.env.local`:

```env
MONGODB_URI=mongodb+srv://AccuCoder:<db_password>@cluster0.hhijtee.mongodb.net/accucoder?retryWrites=true&w=majority&appName=Cluster0
```

Replace `<db_password>` with your actual database password.

Or for local MongoDB:

```env
MONGODB_URI=mongodb://localhost:27017/accucoder
```

## Troubleshooting

### "Collection already exists" error
This is safe to ignore. The scripts use `createCollection` which will skip if the collection already exists.

### "Index already exists" error
This is safe to ignore. MongoDB will skip creating duplicate indexes.

### Connection timeout
- Check your MongoDB URI in `.env.local`
- Ensure MongoDB is running
- Check firewall/network settings
- Verify database name matches your URI

### Permission denied
- Ensure your MongoDB user has write permissions
- Check database access rules (especially for MongoDB Atlas)

## What Each Script Does

| Script | Purpose |
|--------|---------|
| `00-complete-setup.js` | Runs all scripts in one go |
| `01-chathistories.js` | Creates ChatHistories collection with indexes |
| `02-auditlogs.js` | Creates AuditLogs collection with indexes |
| `03-notifications.js` | Creates Notifications collection with indexes |
| `04-indexes-users.js` | Adds indexes to Users collection |
| `05-indexes-reviews.js` | Adds indexes to Reviews collection |
| `06-indexes-sessions.js` | Adds indexes to Sessions collection (with TTL) |

## Next Steps

After setup is complete:
1. Restart your Next.js application
2. Test admin dashboard at `/admin`
3. Check that analytics are loading correctly
4. Verify review moderation works
