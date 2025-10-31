# 🚀 Quick Start Guide - Email Authentication

## ✅ What You Need to Do (3 Steps)

### Step 1: Run Database Migration (2 minutes)

**In Supabase Dashboard:**
1. Go to **SQL Editor**
2. Copy the contents of file: `supabase/migration-add-email-auth.sql`
3. Paste and click **RUN**

✅ Migration creates email column in store_admins table

---

### Step 2: Start the App (1 minute)

```bash
cd kiranawala-adminpanel
npm run dev
```

Open: http://localhost:3000

---

### Step 3: Create Account (2 minutes)

**Option A: Registration**
1. Go to: http://localhost:3000/register
2. Click **"Email & Password"** tab
3. Fill in:
   - Name: Your Name
   - Email: admin@example.com
   - Password: password123
4. Click **"Create Account"**
5. Complete store setup
6. Redirected to dashboard ✅

**Option B: Login (if user exists)**
1. Go to: http://localhost:3000/login
2. Click **"Email"** tab
3. Enter email and password
4. Click **"Sign In"**
5. Redirected to dashboard ✅

---

## 🎯 That's It!

You now have:
- ✅ Email authentication working
- ✅ Dashboard access
- ✅ Full application functionality

## 🔑 Quick Login Credentials

**Test Account:**
- Email: `admin@example.com`
- Password: `password123`

## 📱 Phone Authentication (Optional)

For production, you can also use phone OTP:

1. **Configure Supabase:**
   - Enable Phone provider
   - Set up Twilio SMS

2. **Use Phone Tab:**
   - Click "Phone" tab on login/registration
   - Enter 10-digit Indian mobile number
   - Receive OTP via SMS
   - Login/Register

## 🆘 Need Help?

See the complete guide: `AUTHENTICATION_UPGRADE_SUMMARY.md`

---

**Status:** Ready to use! 🎉
