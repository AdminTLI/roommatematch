# 🏠 Roommate Match

**Find roommates who actually fit your life**

A modern, AI-powered roommate matching platform designed specifically for students in the Netherlands. Built with Next.js, TypeScript, and Supabase.

![Roommate Match](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.75-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🎯 Demo Account

For testing and demonstration purposes, use:
- **Email**: `demo@account.com`
- **Password**: `Testing123`

This is the only whitelisted demo account in the system. All other users must sign up through the application.

## ✨ Features

### 🎯 **Smart Matching**
- AI-powered compatibility scoring
- Lifestyle, study habits, and personality matching
- University and program affinity
- Academic year considerations

### 🏢 **University Integration**
- Partnered with 50+ Dutch universities
- SURFconext SSO integration
- University-specific branding and rules
- Admin dashboard for university staff

### 🔒 **Security & Verification**
- Mandatory ID verification
- University email verification
- GDPR compliant
- Row Level Security (RLS) on all data

### 💬 **Communication**
- Built-in messaging system
- Icebreaker suggestions
- Group chat for multiple roommates
- Real-time presence indicators

### 🏠 **Housing Integration**
- Verified housing listings
- Tour booking system
- Move-in planning tools
- Expense tracking

### 📊 **Analytics & Insights**
- Compatibility explanations
- Match debrief reports
- Admin analytics dashboard
- User journey tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/roommate-match.git
   cd roommate-match
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up the database**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Link to your project
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Run migrations
   supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
roommate-match/
├── app/                          # Next.js App Router
│   ├── (marketing)/             # Marketing pages
│   ├── (components)/            # Shared components
│   ├── admin/                   # Admin dashboard
│   ├── auth/                    # Authentication
│   ├── chat/                    # Chat functionality
│   ├── dashboard/               # User dashboard
│   ├── matches/                 # Matching system
│   ├── housing/                 # Housing listings
│   └── ...                      # Other features
├── components/                   # Reusable UI components
│   ├── ui/                      # shadcn/ui components
│   ├── marketing/               # Marketing components
│   └── app/                     # App-specific components
├── lib/                         # Utility libraries
│   ├── matching/                # Matching algorithms
│   ├── housing/                 # Housing utilities
│   ├── reputation/              # Reputation system
│   └── ...                      # Other utilities
├── db/                          # Database files
│   ├── migrations/              # Supabase migrations
│   └── seeds/                   # Seed data
└── docs/                        # Documentation
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # Run TypeScript checks
npm run format          # Format code with Prettier

# Testing
npm run test            # Run Playwright tests
npm run test:ui         # Run tests with UI

# Database
npm run db:push         # Push migrations to Supabase
npm run db:reset        # Reset database
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Supabase Studio

# Data Import
npm run import:programs # Import university programs
```

### Key Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **State Management**: TanStack Query
- **Testing**: Playwright

## 🎨 Design System

The platform uses a comprehensive design system with:

- **Colors**: Brand (blue), Accent (orange), Mint (green), Rose (red)
- **Typography**: Inter (UI), Outfit (Display)
- **Spacing**: 4/8/12/16/24/32/48/64 grid system
- **Components**: Fully accessible shadcn/ui components
- **Animations**: Smooth micro-interactions
- **Accessibility**: WCAG 2.2 AA compliant

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on every push to main**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Environment Variables

Required environment variables for production:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret_key
```

## 📊 Features Overview

### For Students
- 🎯 **Smart Matching**: AI-powered compatibility scoring
- 🔍 **Advanced Filters**: University, program, lifestyle preferences
- 💬 **Safe Messaging**: Built-in chat with moderation
- 🏠 **Housing Integration**: Verified listings and tour booking
- 📋 **Move-in Planning**: Checklists, expenses, and timelines
- 🏆 **Reputation System**: Endorsements and references

### For Universities
- 🎛️ **Admin Dashboard**: Analytics and user management
- 🏫 **University Branding**: Custom themes and announcements
- 📈 **Analytics**: User engagement and success metrics
- 🔧 **Moderation Tools**: Content moderation and user support
- 🔗 **SSO Integration**: SURFconext integration
- 📊 **Reporting**: Detailed analytics and insights

## 🔒 Security & Privacy

- **GDPR Compliant**: Full data protection compliance
- **Row Level Security**: Database-level security
- **Email Verification**: Mandatory university email verification
- **ID Verification**: Government ID verification system
- **Rate Limiting**: API rate limiting and abuse prevention
- **Content Moderation**: Automated and manual content filtering

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Dutch Universities**: For their partnership and feedback
- **Supabase**: For the amazing backend-as-a-service platform
- **Vercel**: For seamless deployment and hosting
- **shadcn/ui**: For the beautiful component library
- **Student Community**: For their feedback and suggestions

## 📞 Support

- **Documentation**: [docs.roommatematch.nl](https://docs.roommatematch.nl)
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/roommate-match/issues)
- **Email**: support@roommatematch.nl

---

**Made with ❤️ for students in the Netherlands** 🇳🇱

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/roommate-match)# Force deployment update

<!-- Deployment trigger: Mon Oct 20 22:52:56 CEST 2025 -->
