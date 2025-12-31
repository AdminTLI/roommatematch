# 🏠 Domu Match

**From strangers to roommates**

A modern, AI-powered roommate matching platform designed specifically for students in the Netherlands. Built with Next.js, TypeScript, and Supabase.

![Domu Match](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.75-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🎯 Demo Account

For testing and demonstration purposes, use:
- **Email**: `demo@account.com`
- **Password**: `Testing123`

This is the only whitelisted demo account in the system. All other users must sign up through the application.

## 📋 Current Implementation Status

### ✅ **Fully Implemented**
- User authentication and registration
- Comprehensive onboarding questionnaire
- AI-powered matching algorithm
- Real-time chat system
- Database schema with proper RLS policies
- Admin dashboard (basic)
- Housing listings (with demo data)
- University and program management

### 🚧 **Partially Implemented**
- Verification system (UI exists, backend disabled for demo)
- Move-in planning tools (UI exists, functionality coming soon)
- Expense tracking (UI exists, functionality coming soon)
- Advanced analytics (basic implementation)

### 🔄 **In Progress**
- SURFconext SSO integration
- Advanced admin analytics
- Tour booking system
- Enhanced safety features

### 📝 **Planned**
- Mobile app
- Advanced matching filters
- Video introductions
- Enhanced reporting system

## ✨ Features

### 🎯 **Smart Matching**
- AI-powered compatibility scoring
- Lifestyle, study habits, and personality matching
- University and program affinity
- Academic year considerations

### 🏢 **University Integration**
- Partnered with 50+ Dutch universities
- Email-based authentication (SURFconext SSO coming soon)
- University-specific branding and rules
- Admin dashboard for university staff

### 🔒 **Security & Verification**
- Optional ID verification (KYC providers: Persona, Veriff, Onfido)
- University email verification
- **GDPR & Dutch Law Compliant**: Full implementation with DSAR, consent management, retention policies
- Row Level Security (RLS) on all data
- Age verification (17+ requirement)
- Cookie consent management (Telecommunicatiewet compliant)

### 💬 **Communication**
- Built-in messaging system
- Icebreaker suggestions
- Group chat for multiple roommates
- Real-time presence indicators

### 🏠 **Housing Integration**
- Verified housing listings (demo data available)
- Tour booking system (coming soon)
- Move-in planning tools (coming soon)
- Expense tracking (coming soon)

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
   git clone https://github.com/YOUR_USERNAME/domu-match.git
   cd domu-match
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
domu-match/
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

### GDPR & Dutch Law Compliance

Domu Match is fully compliant with GDPR (General Data Protection Regulation) and Dutch national laws (AVG, UAVG, Telecommunicatiewet). Our compliance implementation includes:

#### ✅ **Data Subject Rights (GDPR Articles 15-20)**
- **Right of Access**: Data export API (`/api/privacy/export`) - Download all your data in JSON format
- **Right to Erasure**: Account deletion API (`/api/privacy/delete`) - 7-day grace period, 4-week verification document retention (Dutch law)
- **Right to Rectification**: Profile settings for data correction
- **Right to Data Portability**: Machine-readable JSON export
- **Right to Restrict Processing**: Available via privacy settings
- **Right to Object**: Object to automated decision-making (matching algorithm)

#### ✅ **Cookie & Tracking Consent (Telecommunicatiewet)**
- **Opt-in Consent Banner**: Explicit consent required before loading analytics/tracking
- **Cookie Preference Center**: Granular control over cookie categories
- **Consent Logging**: All consent actions logged per Dutch law requirements
- **Sentry PII**: Only sent with explicit consent (disabled by default)
- **Analytics**: Vercel Analytics only loads with user consent

#### ✅ **Data Retention Policies**
- **Verification Documents**: 4 weeks after verification (Dutch law - UAVG)
- **Chat Messages**: 1 year after last message
- **Match Suggestions**: 90 days after expiry
- **Reports**: 1 year after resolution
- **Application Logs**: 90 days
- **Automated Cleanup**: Daily cron job enforces retention policies

#### ✅ **Documentation**
- **DPIA**: Data Protection Impact Assessment (`docs/DPIA.md`)
- **ROPA**: Record of Processing Activities (`docs/ROPA.md`)
- **Third-Party Processors**: Complete processor inventory with DPA status (`docs/THIRD_PARTY_PROCESSORS.md`)
- **UAVG Compliance**: Dutch-specific compliance documentation (`docs/UAVG_COMPLIANCE.md`)
- **DUO Licensing**: Education data usage compliance (`docs/DUO_LICENSING.md`)

#### ✅ **Age Verification**
- **Minimum Age**: 17 years (enforced at signup)
- **Date of Birth**: Required during registration
- **Database Validation**: Age verification at database level

#### ✅ **DSAR Workflow**
- **Request Tracking**: Automated DSAR request system with SLA deadlines (30 days)
- **Admin Dashboard**: DSAR management interface (`/admin/dsar`)
- **Automated Reminders**: SLA deadline reminders and escalation
- **Breach Notification**: 72-hour DPA notification system

#### ✅ **Security Measures**
- **Row Level Security**: Database-level security on all tables
- **Email Verification**: Mandatory university email verification
- **ID Verification**: Government ID verification system (KYC providers)
- **Rate Limiting**: API rate limiting and abuse prevention
- **Content Moderation**: Automated and manual content filtering
- **Compensating Controls**: Documented for all security gaps (see `docs/SECURITY_CONTROLS.md`)

### Privacy Features

- **Privacy Settings Page**: User-friendly interface for data management
- **Cookie Policy**: Detailed cookie policy per Telecommunicatiewet (`/cookies`)
- **Privacy Policy**: Comprehensive privacy policy in English and Dutch (`/privacy`)
- **DSAR Automation**: Automated request processing and tracking
- **Consent Management**: Full consent lifecycle management

## 🔧 Troubleshooting

### Common Issues

**Q: Demo account not working?**
A: Make sure you're using the exact credentials: `demo@account.com` / `Testing123`

**Q: Onboarding form not saving?**
A: Check that all required fields are filled and try refreshing the page. The form auto-saves as you progress.

**Q: No matches showing?**
A: Complete the full onboarding questionnaire. The matching algorithm requires all responses to generate matches.

**Q: Chat not loading?**
A: Ensure you have completed onboarding and have been matched with other users.

**Q: Database connection issues?**
A: Verify your Supabase credentials in `.env.local` and ensure the database is properly set up.

### Getting Help

1. Check the [Issues](https://github.com/YOUR_USERNAME/domu-match/issues) page
2. Review the [Documentation](docs/)
3. Contact support at info@domumatch.com

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

- **Documentation**: [docs.domumatch.nl](https://docs.domumatch.nl)
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/domu-match/issues)
- **Email**: info@domumatch.com
- **Privacy**: info@domumatch.com
- **DPO**: info@domumatch.com

## 📋 GDPR Compliance Documentation

For detailed GDPR and Dutch law compliance information, see:

- **DPIA**: [`docs/DPIA.md`](./docs/DPIA.md) - Data Protection Impact Assessment
- **ROPA**: [`docs/ROPA.md`](./docs/ROPA.md) - Record of Processing Activities
- **Third-Party Processors**: [`docs/THIRD_PARTY_PROCESSORS.md`](./docs/THIRD_PARTY_PROCESSORS.md)
- **DPA References**: [`docs/DPA_REFERENCES.md`](./docs/DPA_REFERENCES.md)
- **UAVG Compliance**: [`docs/UAVG_COMPLIANCE.md`](./docs/UAVG_COMPLIANCE.md)
- **DUO Licensing**: [`docs/DUO_LICENSING.md`](./docs/DUO_LICENSING.md)
- **Security Controls**: [`docs/SECURITY_CONTROLS.md`](./docs/SECURITY_CONTROLS.md)

---

**Made with ❤️ for students in the Netherlands** 🇳🇱

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/domu-match)# Force deployment update

<!-- Deployment trigger: Mon Oct 20 22:52:56 CEST 2025 -->
