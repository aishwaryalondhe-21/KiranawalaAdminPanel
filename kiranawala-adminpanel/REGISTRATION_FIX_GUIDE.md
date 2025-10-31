# Registration Error Fix - Implementation Guide

## 🔍 Problem Summary

Your registration flow was failing with empty error objects `{}` at two points:
1. **Line 45** - `createStore()` function
2. **Line 128** - `completeRegistration()` function

## 🎯 Root Causes Identified

### 1. **Missing RLS INSERT Policies** (Primary Issue)
- The `stores` and `store_admins` tables have RLS enabled
- Only SELECT and UPDATE policies exist
- **No INSERT policies** → Authenticated users cannot create records
- Supabase RLS silently blocks INSERT operations, returning empty error objects

### 2. **Poor Error Serialization**
- Supabase errors don't serialize properly with `console.error()`
- Only shows `{}` instead of actual error details
- Missing extraction of `error.message`, `error.details`, `error.hint`, `error.code`

### 3. **Missing Authentication Verification**
- Functions didn't verify user is authenticated before operations
- No check that userId matches authenticated user
- Could lead to security vulnerabilities

## ✅ What Has Been Fixed

### Files Modified:
1. **`lib/queries/registration.ts`** - Enhanced error handling and auth verification
2. **`supabase/fix-rls-insert-policies.sql`** - New SQL migration file (created)
3. **`REGISTRATION_FIX_GUIDE.md`** - This implementation guide (created)

### Changes Made:

#### 1. Enhanced Error Logging
```typescript
// BEFORE
if (error) throw error

// AFTER
if (error) {
  console.error("Error creating store:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  })
  throw new Error(error.message || "Failed to create store. Please ensure you have permission.")
}
```

#### 2. Added Authentication Verification
```typescript
// Verify user is authenticated
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  throw new Error("You must be logged in to create a store")
}

// Ensure owner_id matches authenticated user
if (storeData.owner_id !== user.id) {
  throw new Error("You can only create a store for yourself")
}
```

#### 3. Improved Transaction Handling
```typescript
// BEFORE
const storeId = await createStore(storeData)
const adminId = await createStoreAdmin(adminData)

// AFTER
let storeId: string
try {
  storeId = await createStore(storeData)
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Failed to create store"
  console.error("Store creation failed:", error)
  return {
    success: false,
    error: `Store creation failed: ${errorMessage}. Please check your permissions and try again.`,
  }
}

// With cleanup on failure
try {
  adminId = await createStoreAdmin(adminData)
} catch (error) {
  // Clean up orphaned store
  try {
    await supabase.from("stores").delete().eq("id", storeId)
  } catch (cleanupError) {
    console.error("Failed to cleanup orphaned store:", cleanupError)
  }
  // Return detailed error
}
```

## 📋 Implementation Steps

### Step 1: Apply Database Migration (CRITICAL)

1. Open **Supabase Dashboard** → Your Project
2. Navigate to **SQL Editor**
3. Open the file: `supabase/fix-rls-insert-policies.sql`
4. Copy the entire content
5. Paste into SQL Editor
6. Click **"Run"** to execute

**Expected Result:**
```
✅ Created policy: "Authenticated users can create stores"
✅ Created policy: "Users can create their own store_admin record"
```

### Step 2: Verify Policies Were Created

Run this verification query in SQL Editor:

```sql
-- Verify stores policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'stores';

-- Verify store_admins policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'store_admins';
```

**Expected Output:**
```
stores | Admins can view their own store admin record | SELECT
stores | Admins can update their own profile | UPDATE
stores | Authenticated users can create stores | INSERT  ← NEW

store_admins | Users can view their own store_admin record | SELECT
store_admins | Users can update their own profile | UPDATE
store_admins | Users can create their own store_admin record | INSERT  ← NEW
```

### Step 3: Code Changes (ALREADY APPLIED)

The following file has been updated:
- ✅ `lib/queries/registration.ts` - Enhanced with proper error handling

**No action needed** - changes are already applied.

### Step 4: Test the Registration Flow

1. **Clear browser storage** (to start fresh):
   - Open DevTools (F12)
   - Application → Storage → Clear site data

2. **Start development server** (if not running):
   ```bash
   npm run dev
   ```

3. **Navigate to registration page**:
   - Go to `http://localhost:3000/register` (or your registration route)

4. **Test registration**:
   - Enter phone number (10 digits starting with 6-9)
   - Enter full name
   - Click "Continue" → OTP should be sent
   - Enter OTP → Phone should be verified
   - Fill store details
   - Submit → Registration should complete successfully

5. **Check console for detailed errors** (if any):
   - Open DevTools Console
   - Errors will now show detailed messages instead of `{}`

### Step 5: Verify Database Records

After successful registration, verify in Supabase Dashboard:

```sql
-- Check if store was created
SELECT id, name, phone_number, owner_id, is_active 
FROM stores 
ORDER BY created_at DESC 
LIMIT 1;

-- Check if store_admin was created
SELECT id, user_id, phone_number, full_name, store_id, role 
FROM store_admins 
ORDER BY created_at DESC 
LIMIT 1;
```

## 🧪 Testing Scenarios

### Scenario 1: Successful Registration
**Steps:**
1. New phone number
2. Valid OTP
3. Complete store form

**Expected:**
- ✅ Store created in `stores` table
- ✅ Admin record created in `store_admins` table
- ✅ User redirected to dashboard
- ✅ Toast: "Registration completed successfully!"

### Scenario 2: Duplicate Phone Number
**Steps:**
1. Use existing phone number
2. Complete OTP verification

**Expected:**
- ✅ Error: "This phone number is already registered. Please login instead."
- ✅ No new records created

### Scenario 3: Missing RLS Policies (Before Fix)
**Before applying SQL migration:**

**Expected:**
- ❌ Error creating store: {}
- ❌ Empty error object

**After applying SQL migration:**
- ✅ Store created successfully
- ✅ Detailed errors if any issue occurs

## 🔒 Security Improvements

The updated code now includes:

1. **Authentication Verification**
   - Ensures user is logged in before operations
   - Validates userId matches authenticated user

2. **Permission Checks**
   - Users can only create stores for themselves (`owner_id = auth.uid()`)
   - Users can only create admin records for themselves (`user_id = auth.uid()`)

3. **Cleanup on Failure**
   - Orphaned stores are deleted if admin creation fails
   - Prevents database inconsistencies

4. **Detailed Error Messages**
   - Extracts Supabase error details (`message`, `details`, `hint`, `code`)
   - Provides actionable error messages to users

## 📊 Before vs After

### Before Fix:
```
Console Output:
Error creating store: {}
Error completing registration: {}

User sees: "Registration failed. Please try again."
Developer has no clue what went wrong
```

### After Fix:
```
Console Output:
Error creating store: {
  message: "new row violates row-level security policy for table \"stores\"",
  details: null,
  hint: null,
  code: "42501"
}

User sees: "Store creation failed: new row violates row-level security policy. Please check your permissions and try again."
Developer knows exactly what to fix (missing RLS INSERT policy)
```

## 🚨 Troubleshooting

### Issue 1: Still Getting Empty Errors After Fix
**Solution:**
- Ensure you ran the SQL migration in Supabase Dashboard
- Verify policies exist with the verification query
- Clear browser cache and restart dev server

### Issue 2: "Permission Denied" Error
**Solution:**
- Check that user is authenticated (call `supabase.auth.getUser()`)
- Verify `owner_id` in stores matches `auth.uid()`
- Verify `user_id` in store_admins matches `auth.uid()`

### Issue 3: "You must be logged in" Error
**Solution:**
- Ensure OTP verification succeeded
- Check that Supabase session is persisted
- Verify `supabase.auth.getUser()` returns valid user

### Issue 4: Store Created but Admin Creation Failed
**Solution:**
- Check `store_admins.phone_number` format: Must be `+91[6-9][0-9]{9}`
- Verify `store_admins.store_id` references valid store
- Orphaned store should be auto-deleted by cleanup logic

## 📝 Additional Notes

### Phone Number Format
- **Required format**: `+91[6-9][0-9]{9}`
- **Example**: `+919876543210`
- **Validation**: Handled by `formatPhoneNumber()` utility
- **Database constraint**: Enforced by CHECK constraint in `store_admins` table

### Database Foreign Keys
```
store_admins.user_id → auth.users.id (CASCADE DELETE)
store_admins.store_id → stores.id (CASCADE DELETE)
```

### RLS Policy Logic
```sql
-- For stores INSERT
WITH CHECK (owner_id = auth.uid())

-- For store_admins INSERT
WITH CHECK (user_id = auth.uid())
```

## ✨ What's Next?

After successful implementation:

1. **Monitor Logs**: Check Supabase logs for any RLS policy violations
2. **User Feedback**: Ensure error messages are user-friendly
3. **Performance**: Monitor registration completion rate
4. **Security**: Regularly audit RLS policies

## 🎉 Success Criteria

Your registration flow is fixed when:
- ✅ New users can register without errors
- ✅ Console shows detailed error messages (not empty `{}`)
- ✅ Stores and store_admins records are created successfully
- ✅ Users are redirected to dashboard after registration
- ✅ No orphaned records in database
- ✅ Duplicate phone numbers are properly rejected

## 📞 Support

If you encounter any issues after following this guide:
1. Check the browser console for detailed error messages
2. Verify RLS policies exist in Supabase Dashboard
3. Review Supabase logs for any database-level errors
4. Ensure phone number format is correct (`+91XXXXXXXXXX`)

---

**Files Created:**
- `supabase/fix-rls-insert-policies.sql` - Database migration
- `REGISTRATION_FIX_GUIDE.md` - This guide

**Files Modified:**
- `lib/queries/registration.ts` - Enhanced error handling and auth verification

**No Breaking Changes:**
- All existing functionality preserved
- Phone-based authentication continues to work
- No changes to database schema
- Only added missing RLS policies
