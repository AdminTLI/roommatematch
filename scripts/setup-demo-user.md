# Demo User Setup Instructions

## Step 1: Set Environment Variables

You need to set these environment variables in your Vercel project:

1. Go to your Vercel dashboard
2. Select your `domumatch` project
3. Go to Settings → Environment Variables
4. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_SEED_TOKEN=your_secure_random_token_here
```

## Step 2: Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Go to Settings → API
3. Copy:
   - Project URL (for `NEXT_PUBLIC_SUPABASE_URL`)
   - `anon` `public` key (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` `secret` key (for `SUPABASE_SERVICE_ROLE_KEY`)

## Step 3: Seed Demo User

After setting the environment variables in Vercel:

```bash
# Replace YOUR_ADMIN_SEED_TOKEN with the token you set in Vercel
curl -X POST \
  -H "x-seed-token: YOUR_ADMIN_SEED_TOKEN" \
  https://domumatch.vercel.app/api/admin/seed-demo-user
```

## Step 4: Test Login

Use these credentials:
- Email: `demo@account.com`
- Password: `Testing123`

## Alternative: Manual User Creation

If you prefer to create the user manually in Supabase:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Email: `demo@account.com`
4. Password: `Testing123`
5. Check "Auto Confirm User"
6. Click "Create user"
