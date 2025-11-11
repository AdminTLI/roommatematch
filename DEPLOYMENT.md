# 🚀 Deployment Guide - Domu Match Platform

This guide will walk you through deploying the Domu Match platform to GitHub and Vercel.

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] GitHub account
- [ ] Vercel account (free tier available)
- [ ] Supabase account and project
- [ ] Domain name (optional, Vercel provides free subdomain)

## 🔧 Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository (if not already done)
```bash
cd "/Users/danishsamsudin/Domu Match"
git init
git add .
git commit -m "Initial commit: Domu Match platform"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com) and click "New repository"
2. Name it: `domu-match` (or your preferred name)
3. Make it **Public** (required for Vercel free tier)
4. **Don't** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### 1.3 Connect Local Repository to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/domu-match.git
git branch -M main
git push -u origin main
```

## 🗄️ Step 2: Set Up Supabase

### 2.1 Create Supabase Project
1. Go to [Supabase](https://supabase.com) and create a new project
2. Choose a region close to your users (Europe for Netherlands)
3. Set a strong database password
4. Wait for the project to be created

### 2.2 Run Database Migrations
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run all migrations
supabase db push
```

### 2.3 Get Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Local Development
Create `.env.local` file:
```bash
cp env.example .env.local
```

Edit `.env.local` with your actual values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

### 3.2 Vercel Environment Variables
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add these variables:

**Production Environment:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_production_secret_here
NODE_ENV=production
```

**Preview Environment (same as production):**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=https://your-preview-domain.vercel.app
NEXTAUTH_SECRET=your_preview_secret_here
NODE_ENV=development
```

## 🚀 Step 4: Deploy to Vercel

### 4.1 Connect GitHub Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### 4.2 Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your site will be available at `https://your-project.vercel.app`

## 🔄 Step 5: Set Up Automatic Deployments

### 5.1 GitHub Actions (Optional)
The included `.github/workflows/deploy.yml` will automatically:
- Run tests on every push
- Deploy to Vercel on main branch
- Run linting and type checking

### 5.2 Vercel Git Integration
- **Automatic deployments** are enabled by default
- Every push to `main` triggers production deployment
- Every push to other branches triggers preview deployment

## 🧪 Step 6: Test Your Deployment

### 6.1 Test Production Site
1. Visit your Vercel URL
2. Test key functionality:
   - [ ] Marketing page loads
   - [ ] Authentication works
   - [ ] Dashboard loads
   - [ ] All pages respond with 200 status codes

### 6.2 Test Database Connection
1. Try creating a user account
2. Check if data appears in Supabase dashboard
3. Verify RLS policies are working

## 🔐 Step 7: Security & Production Checklist

### 7.1 Supabase Security
- [ ] Enable RLS on all tables
- [ ] Set up proper RLS policies
- [ ] Enable email confirmation
- [ ] Set up rate limiting

### 7.2 Environment Security
- [ ] Use strong secrets for NEXTAUTH_SECRET
- [ ] Never commit `.env.local` to git
- [ ] Use different secrets for production/preview

### 7.3 Domain Setup (Optional)
1. Buy a domain (e.g., `domumatch.nl`)
2. In Vercel dashboard, go to Settings > Domains
3. Add your domain
4. Update DNS records as instructed

## 📊 Step 8: Monitoring & Analytics

### 8.1 Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance and errors

### 8.2 Supabase Monitoring
- Check Supabase dashboard for database metrics
- Monitor API usage and limits

## 🆘 Troubleshooting

### Common Issues:

**Build Fails:**
- Check environment variables are set correctly
- Ensure all dependencies are in package.json
- Check build logs in Vercel dashboard

**Database Connection Issues:**
- Verify Supabase URL and keys
- Check RLS policies
- Ensure migrations ran successfully

**Authentication Issues:**
- Verify NEXTAUTH_SECRET is set
- Check Supabase auth configuration
- Ensure redirect URLs are correct

### Getting Help:
- Check Vercel documentation
- Check Supabase documentation
- Review GitHub Actions logs
- Check browser console for errors

## 🎉 Success!

Once deployed, your Domu Match platform will be live at:
- **Production**: `https://your-domain.vercel.app`
- **Preview**: `https://your-project-git-branch.vercel.app`

Share your platform with students and universities in the Netherlands! 🇳🇱
