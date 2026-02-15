# Railway Deployment Guide - WSMS

## 🚀 Complete Setup Instructions

### Overview
This guide will help you deploy the Water Supply Management System (WSMS) to Railway with:
- **Postgres Database** (already created ✅)
- **wsms-server** (Backend API)
- **wsms-client** (Frontend React App)

---

## Step 1: Configure Environment Variables

### For `wsms-server` Service

Navigate to your Railway project → **wsms-server** → **Variables** tab and add:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=7f8a9c2b4e6d1f3a8b5c9e0d2f4a6b8c1e3d5f7a9b0c2d4e6f8a0b1c3d5e7f9a
PORT=8080
NODE_ENV=production
CLIENT_URL=${{wsms-client.RAILWAY_PUBLIC_DOMAIN}}
```

**Important Notes:**
- `DATABASE_URL=${{Postgres.DATABASE_URL}}` - This automatically links to your Postgres service
- The `CLIENT_URL` will auto-populate once the client is deployed
- Click "Add Variable" for each one

### For `wsms-client` Service

Navigate to your Railway project → **wsms-client** → **Variables** tab and add:

```bash
VITE_API_URL=${{wsms-server.RAILWAY_PUBLIC_DOMAIN}}/api
PORT=5173
```

**Important Note:**
- The `VITE_API_URL` will auto-populate once the server is deployed
- If auto-reference doesn't work, manually set it to: `https://wsms-server-production.up.railway.app/api` (replace with your actual server URL)

---

## Step 2: Deploy Services

After setting environment variables, both services should automatically redeploy. If not:

1. Go to **wsms-server** → **Deployments** → Click "Deploy"
2. Go to **wsms-client** → **Deployments** → Click "Deploy"
3. Wait for both to show "✅ Deployed"

---

## Step 3: Automatic Database Initialization ✨

Once **wsms-server** is successfully deployed, it will **automatically**:

1. ✅ Check if database tables exist
2. ✅ If not, create all tables from schema.sql
3. ✅ Seed initial roles (Admin, Reader, Viewer)
4. ✅ Create default user accounts
5. ✅ Start serving requests

**No manual commands needed!** The server handles everything on first startup.

**Check server logs to see:**
```
🚀 Starting WSMS Server...
🔍 Checking database status...
📦 Tables not found. Running initial migration...
⚙️  Creating database tables...
✅ Database schema created successfully!
👤 Seeding initial users...
   ✓ Created role: Admin
   ✓ Created role: Reader
   ✓ Created role: Viewer
   ✓ Created Admin: admin@wsms.com / 123456
   ✓ Created Reader: reader@wsms.com / 123456
   ✓ Created Viewer: viewer@wsms.com / 123456
🎉 Database initialization complete!
✅ Server is running on port 8080
```

**Default User Accounts Created:**
- **Admin:** `admin@wsms.com` / `123456`
- **Reader:** `reader@wsms.com` / `123456`
- **Viewer:** `viewer@wsms.com` / `123456`

---

## Step 4: Verify Deployment

### Check Server Health
Visit: `https://your-server-url.railway.app/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-02-15T07:59:00.000Z",
  "database": "connected"
}
```

### Check Client
Visit: `https://your-client-url.railway.app`

You should see the WSMS login page.

---

## Step 5: Test Login

1. Open the client URL in your browser
2. Log in with: `admin@wsms.com` / `123456`
3. You should be redirected to the dashboard

---

## Troubleshooting

### Server won't connect to database
- Verify `DATABASE_URL` is set correctly in wsms-server variables
- Check that Postgres service is online
- Restart wsms-server deployment

### Client shows "Network Error"
- Verify `VITE_API_URL` points to correct server URL
- Check that wsms-server is online
- Verify CORS is configured (it should be by default)

### Tables not found error
- Check server logs for auto-migration errors
- Verify DATABASE_URL is correctly set
- Ensure Postgres service is online
- Redeploy wsms-server to trigger migration again

### Can't login
- Check server logs for user seeding errors
- Verify DATABASE_URL connection
- Verify JWT_SECRET is set
- Try default credentials: admin@wsms.com / 123456

---

## Service URLs

After deployment, save these URLs:

- **Server API:** `https://wsms-server-production.up.railway.app`
- **Client App:** `https://wsms-client-production.up.railway.app`
- **Database:** Internal Railway URL (not public)

---

## Optional: Add Dummy Data

If you want to test with sample customers and bills, you can manually run the seed script locally:

```bash
# Connect to your Railway database and run:
npm run seed-dummy
```

This adds sample customers, readings, and bills for testing. (Note: Manual command execution requires local setup with Railway database credentials)

---

## Security Notes

🔒 **Important:**
- Change the default admin password immediately after first login
- Keep your JWT_SECRET secure (already generated)
- Don't commit `.env` files to git (already in .gitignore)
- The DATABASE_URL contains sensitive credentials

---

## Need Help?

If you encounter issues:
1. Check Railway logs for each service
2. Verify all environment variables are set
3. Ensure Postgres service is online
4. Confirm migration was successful

---

## Summary Checklist

- [ ] Set environment variables for wsms-server
- [ ] Set environment variables for wsms-client  
- [ ] Both services deployed successfully
- [ ] Ran `npm run init-db` (one-time)
- [ ] Ran `npm run seed-users` (one-time)
- [ ] Verified server health endpoint
- [ ] Tested login on client
- [ ] Changed default admin password

**Once all items are checked, your WSMS is fully deployed! 🎉**
