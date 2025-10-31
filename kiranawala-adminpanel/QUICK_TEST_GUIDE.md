# 🧪 Quick Test Guide - Onboarding Flow

## 🚀 Quick Start

### 1. Start the Development Server
```bash
cd kiranawala-adminpanel
npm run dev
```

Open browser: http://localhost:3000

---

## ✅ Test Scenarios

### **Scenario 1: New User Registration**

1. **Visit Homepage**
   - Go to: http://localhost:3000
   - **Expected:** Redirects to http://localhost:3000/register

2. **Step 1: Enter Details**
   - Enter Full Name: `Test Store Owner`
   - Enter Phone: `9876543210` (10 digits, starts with 6-9)
   - Click: **Continue**
   - **Expected:** OTP sent message appears

3. **Step 2: Verify OTP**
   - Check your phone for 6-digit OTP
   - Enter OTP: `123456` (your received OTP)
   - Click: **Verify OTP**
   - **Expected:** Progress to Step 3

4. **Step 3: Store Setup**
   - Store Name: `Test Kirana Store`
   - Store Address: `123 Main Street, Mumbai - 400001`
   - Store Phone: `9123456789`
   - Click: **Complete Registration**
   - **Expected:** Redirect to dashboard

---

### **Scenario 2: Existing User Login**

1. **Visit Login Page**
   - Go to: http://localhost:3000/login
   - Or click "Login here" on register page

2. **Enter Phone Number**
   - Enter: `9876543210` (registered number)
   - Click: **Send OTP**
   - **Expected:** OTP sent message

3. **Verify OTP**
   - Enter 6-digit OTP
   - Click: **Verify OTP**
   - **Expected:** Redirect to dashboard

---

### **Scenario 3: Navigation Between Login/Register**

1. **From Register to Login**
   - Visit: http://localhost:3000/register
   - Click: "Already have an account? **Login here**"
   - **Expected:** Navigate to `/login`

2. **From Login to Register**
   - Visit: http://localhost:3000/login
   - Click: "Don't have an account? **Register here**"
   - **Expected:** Navigate to `/register`

---

### **Scenario 4: Protected Routes (Middleware)**

1. **Dashboard Access (Not Logged In)**
   - Visit: http://localhost:3000/dashboard
   - **Expected:** Redirect to `/register`

2. **Dashboard Access (Logged In)**
   - Login first
   - Visit: http://localhost:3000/dashboard
   - **Expected:** Show dashboard

3. **Register Page (Logged In)**
   - Login first
   - Visit: http://localhost:3000/register
   - **Expected:** Redirect to `/dashboard`

---

## 🔍 Verification Steps

### **Check Database Records:**

After successful registration, verify in Supabase:

1. **auth.users table:**
   ```sql
   SELECT id, phone FROM auth.users 
   WHERE phone = '+919876543210';
   ```

2. **store_admins table:**
   ```sql
   SELECT * FROM store_admins 
   WHERE phone_number = '+919876543210';
   ```

3. **stores table:**
   ```sql
   SELECT * FROM stores 
   WHERE name = 'Test Kirana Store';
   ```

---

## ⚠️ Prerequisites

### **Before Testing:**

1. **Supabase Setup:**
   - Phone provider enabled
   - Twilio configured with Indian number
   - Database migration executed

2. **Environment Variables:**
   - `.env.local` file exists
   - Contains valid Supabase credentials

3. **Twilio Account:**
   - Active account with credits
   - Indian phone number purchased
   - SMS enabled for India

---

## 🐛 Troubleshooting

### **OTP Not Received:**
- Check Twilio balance
- Check Twilio logs (SMS delivery status)
- Try different phone number
- Check phone number format (+919876543210)

### **"Phone number already registered":**
- This is correct behavior for duplicate registration
- Use login page instead
- Or use different phone number for testing

### **Build Errors:**
- Run: `npm install`
- Run: `npm run build`
- Check console for specific errors

### **Redirect Issues:**
- Clear browser cache
- Check middleware.ts configuration
- Check browser console for errors

---

## 📝 Test Checklist

- [ ] Home page redirects to register
- [ ] Registration Step 1 accepts name and phone
- [ ] OTP is sent successfully
- [ ] Registration Step 2 verifies OTP
- [ ] Registration Step 3 collects store info
- [ ] Store is created in database
- [ ] Admin record is created in database
- [ ] User is redirected to dashboard
- [ ] Login page works for existing users
- [ ] "Login here" link works
- [ ] "Register here" link works
- [ ] Dashboard protected when logged out
- [ ] Register page protected when logged in
- [ ] Build passes: `npm run build`
- [ ] Lint passes: `npm run lint`

---

## 🎯 Success Criteria

**Registration is successful if:**
✅ All 3 steps complete without errors  
✅ User redirected to `/dashboard`  
✅ Record created in `store_admins` table  
✅ Record created in `stores` table  
✅ User can logout and login again  
✅ Dashboard shows store information  

---

## 📞 Test Phone Numbers

### **For Development:**
- Use your real phone number
- Or use Twilio test mode (no real SMS)

### **Valid Formats:**
```
9876543210      ✅ (Recommended)
919876543210    ✅
+919876543210   ✅
09876543210     ✅
```

### **Invalid Formats:**
```
1234567890      ❌ (Doesn't start with 6-9)
98765          ❌ (Less than 10 digits)
abcd123456     ❌ (Contains letters)
```

---

## 🚀 Quick Commands

```bash
# Start dev server
npm run dev

# Run build
npm run build

# Run lint
npm run lint

# Check TypeScript
npx tsc --noEmit
```

---

**Happy Testing! 🎉**
