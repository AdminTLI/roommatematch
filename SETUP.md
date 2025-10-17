# Quick Setup Guide - Roommate Match

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase

#### Option A: Quick Test (Recommended for first run)
Create a `.env.local` file in the project root with these temporary values:

```bash
# Temporary values for testing the UI
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo_key
SUPABASE_SERVICE_ROLE_KEY=demo_service_key
NODE_ENV=development
```

This will let you see the marketing page and UI components, though database features won't work.

#### Option B: Full Setup (For full functionality)

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for setup to complete

2. **Get Your Credentials:**
   - Go to Settings → API in your Supabase dashboard
   - Copy your Project URL and API keys

3. **Create `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NODE_ENV=development
```

4. **Set up Database:**
```bash
# Run database migrations
npm run db:push

# Seed initial data
npm run db:seed

# Import programmes (optional)
npm run import:programs
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000` (or 3001 if 3000 is busy).

## 🎯 What You'll See

- **Marketing Landing Page**: Beautiful landing page with all features
- **Authentication**: Sign up/sign in pages
- **Onboarding**: Multi-step questionnaire
- **Matches**: Compatibility matching interface
- **Chat**: Real-time messaging
- **Forum**: Community features
- **Admin**: University admin dashboard

## 🛠️ Troubleshooting

### "Missing Supabase credentials" Error
- Make sure `.env.local` exists in the project root
- Check that your Supabase URL and keys are correct
- Restart the development server after adding environment variables

### Port Already in Use
- The app will automatically try port 3001 if 3000 is busy
- You can also specify a port: `npm run dev -- -p 3002`

### Database Connection Issues
- Verify your Supabase project is active
- Check that your service role key has the correct permissions
- Ensure you've run the database migrations

## 📚 Next Steps

1. **Explore the UI**: Navigate through all the pages to see the design
2. **Test Features**: Try signing up, onboarding, and matching
3. **Customize**: Modify colors, content, and branding
4. **Deploy**: Use Vercel for easy deployment

## 🆘 Need Help?

- Check the browser console for detailed error messages
- Review the Supabase dashboard for database issues
- All components are fully typed with TypeScript for better development experience

Happy coding! 🎉
