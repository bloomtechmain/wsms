# Quick Railway Deployment Steps

## 🚀 Fast Setup (3 Minutes) - Fully Automated!

### Step 1: Set Environment Variables (2 min)

#### In Railway → wsms-server → Variables:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=7f8a9c2b4e6d1f3a8b5c9e0d2f4a6b8c1e3d5f7a9b0c2d4e6f8a0b1c3d5e7f9a
PORT=8080
NODE_ENV=production
CLIENT_URL=${{wsms-client.RAILWAY_PUBLIC_DOMAIN}}
```

#### In Railway → wsms-client → Variables:
```
VITE_API_URL=${{wsms-server.RAILWAY_PUBLIC_DOMAIN}}/api
PORT=5173
```

### Step 2: Deploy (Auto) ✅
Both services will automatically redeploy after setting variables.

### Step 3: Deploy & Auto-Initialize ✅
Both services will automatically deploy and the database will initialize on first startup!

The server automatically:
- Creates all database tables
- Seeds default users
- Starts serving requests

### Step 4: Test Login ✅
- **URL:** Your wsms-client Railway URL
- **Login:** admin@wsms.com / admin123

---

## Default User Credentials

After running `npm run seed-users`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@wsms.com | admin123 |
| Manager | manager@wsms.com | manager123 |
| Collector | collector@wsms.com | collector123 |

**⚠️ Change these passwords after first login!**

---

## Verification Checklist

- [ ] wsms-server shows "Online" in Railway
- [ ] wsms-client shows "Online" in Railway  
- [ ] Database shows "Online" in Railway
- [ ] Health check works: `https://your-server-url.railway.app/health`
- [ ] Client opens: `https://your-client-url.railway.app`
- [ ] Login works with admin credentials
- [ ] Dashboard loads after login

---

## Troubleshooting

**Server Error: ECONNREFUSED ::1:5432**
- ❌ DATABASE_URL not set correctly
- ✅ Use: `${{Postgres.DATABASE_URL}}`

**Client Crashed**
- ❌ Missing environment variables
- ✅ Set VITE_API_URL in client variables

**Tables Not Found**
- ❌ Auto-migration failed
- ✅ Check server logs for migration errors
- ✅ Verify DATABASE_URL is correct

**Can't Login**
- ❌ User seeding failed
- ✅ Check server logs for seed errors
- ✅ Verify database connection

---

## Next Steps After Deployment

1. ✅ Login with admin account
2. ✅ Change default password
3. ✅ Create customer groups
4. ✅ Add customers
5. ✅ Start recording meter readings
6. ✅ Generate bills

---

For detailed documentation, see **RAILWAY_SETUP.md**
