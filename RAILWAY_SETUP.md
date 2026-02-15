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

## Step 3: Initialize Database (ONE-TIME ONLY)

Once **wsms-server** is successfully deployed:

1. Navigate to **wsms-server** service in Railway
2. Click on **"Settings"** → Scroll to **"Run a Command"**
3. Enter this command:
   ```bash
   npm run init-db
   ```
4. Click "Run" and wait for success message
5. This creates all database tables and tariff rates

**Expected Output:**
```
Reading SQL from: /app/server/src/sql/schema.sql
Running migration...
Migration completed successfully.
```

---

## Step 4: Create Admin User (ONE-TIME ONLY)

After database initialization:

1. Still in **wsms-server** → **Settings** → **"Run a Command"**
2. Enter this command:
   ```bash
   npm run seed-users
   ```
3. Click "Run" and wait for success

**This creates default users:**
- **Admin:** `admin@wsms.com` / `admin123`
- **Manager:** `manager@wsms.com` / `manager123`
- **Collector:** `collector@wsms.com` / `collector123`

---

## Step 5: Verify Deployment

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

## Step 6: Test Login

1. Open the client URL in your browser
2. Log in with: `admin@wsms.com` / `admin123`
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
- Run the `npm run init-db` command in wsms-server
- Check server logs for any migration errors

### Can't login
- Ensure you ran `npm run seed-users`
- Check server logs for authentication errors
- Verify JWT_SECRET is set

---

## Service URLs

After deployment, save these URLs:

- **Server API:** `https://wsms-server-production.up.railway.app`
- **Client App:** `https://wsms-client-production.up.railway.app`
- **Database:** Internal Railway URL (not public)

---

## Optional: Add Dummy Data

If you want to test with sample customers and bills:

1. Go to **wsms-server** → **Settings** → **"Run a Command"**
2. Run:
   ```bash
   npm run seed-dummy
   ```

This adds sample customers, readings, and bills for testing.

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
