'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  GraduationCap,
  Shield,
  Heart,
  MessageCircle,
  TrendingUp,
  Play,
  Quote,
  Award,
  Home,
  Filter
} from 'lucide-react'

const testimonials = [
  {
    name: "Emma van der Berg",
    university: "TU Delft",
    program: "Computer Science",
    avatar: "E",
    rating: 5,
    text: "Roommate Match helped me find the perfect roommate. We have similar study schedules and share the same values about keeping our space clean and organized.",
    highlight: "Found my best friend!",
    image: "/api/placeholder/80/80" // Placeholder for profile image
  },
  {
    name: "Lucas Janssen", 
    university: "Eindhoven University",
    program: "Engineering",
    avatar: "L",
    rating: 5,
    text: "The compatibility matching is incredible. My roommate and I clicked from day one. The app made the whole process so much easier than traditional roommate hunting.",
    highlight: "Perfect match!",
    image: "/api/placeholder/80/80"
  },
  {
    name: "Sofia Rodriguez",
    university: "Rotterdam School of Management", 
    program: "Business Administration",
    avatar: "S",
    rating: 5,
    text: "I was skeptical at first, but the AI matching really works. My roommate and I have complementary personalities and study habits. Couldn't be happier!",
    highlight: "Highly recommend!",
    image: "/api/placeholder/80/80"
  }
]

const universities = [
  "TU Delft", "Eindhoven University", "University of Amsterdam", "Utrecht University",
  "Leiden University", "Rotterdam School of Management", "VU Amsterdam", "University of Groningen",
  "Tilburg University", "Maastricht University", "Wageningen University", "University of Twente"
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function MarketingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/dashboard')
  }

  const handleLearnMore = () => {
    router.push('/learn')
  }

  const handleBecomePartner = () => {
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Hero Section - Purpose: Main value proposition with clear CTA */}
      <section className="hero relative overflow-hidden">
        <div className="container py-24">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-12 max-w-4xl mx-auto"
          >
            {/* Trust Badge - Purpose: Social proof and credibility */}
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-primary-700 text-sm font-medium shadow-sm border border-primary-200">
                <Shield className="w-4 h-4" />
                Trusted by 50+ universities
              </div>
            </motion.div>
            
            {/* Main Headline - Purpose: Clear value proposition */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <h1 className="text-display text-gray-900 leading-tight">
                Find roommates who actually{' '}
                <span className="text-gradient">fit your life</span>
              </h1>
              
              <p className="text-body-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Roommate Match pairs you with compatible students based on lifestyle and study rhythm—so moving in feels easy.
              </p>
            </motion.div>

            {/* CTA Buttons - Purpose: Clear action paths with proper hierarchy */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="btn btn-primary btn-lg group" onClick={handleGetStarted}>
                Get matched
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn btn-outline btn-lg group" onClick={handleLearnMore}>
                <Play className="w-5 h-5 mr-2" />
                See how it works
              </button>
            </motion.div>

            {/* Trust Indicators - Purpose: Remove friction and build confidence */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-8 justify-center text-body-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <span>Verified students only</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <span>Free for students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <span>University partnerships</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Visual Element - Purpose: Add visual interest and break text monotony */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-primary-200/30 to-secondary-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-secondary-200/30 to-primary-200/30 rounded-full blur-xl"></div>
      </section>

      {/* Top Matches Preview - Purpose: Show product value with concrete examples */}
      <section className="section bg-gray-50">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-12"
          >
            {/* Section Header - Purpose: Context and expectation setting */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium">
                <Users className="w-4 h-4" />
                Your potential matches
              </div>
              
              <h2 className="text-h2 text-gray-900">See who you could match with</h2>
              <p className="text-body text-gray-600 max-w-2xl mx-auto">
                Our AI analyzes compatibility across lifestyle, study habits, and personality traits to find your perfect roommate.
              </p>
            </motion.div>

            {/* Match Cards - Purpose: Concrete examples with clear value indicators */}
            <motion.div
              variants={staggerChildren}
              className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            >
              {[
                { name: "Emma", program: "Computer Science", university: "TU Delft", score: "94%", compatibility: "Study schedule, cleanliness, quiet hours" },
                { name: "Lucas", program: "Engineering", university: "Eindhoven", score: "89%", compatibility: "Budget, location, social preferences" },
                { name: "Sofia", program: "Business", university: "Rotterdam", score: "87%", compatibility: "Hobbies, communication style, lifestyle" }
              ].map((match, index) => (
                <motion.div key={match.name} variants={fadeInUp}>
                  <div className="card card-lg text-center group hover:scale-105 transition-transform">
                    {/* Match Score - Purpose: Clear compatibility indicator */}
                    <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {match.score}
                    </div>
                    
                    {/* Avatar - Purpose: Human connection and visual interest */}
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
                      {match.name[0]}
                    </div>
                    
                    {/* Match Info - Purpose: Relevant details for decision making */}
                    <h3 className="text-h4 text-gray-900 mb-2">{match.name}</h3>
                    <p className="text-body-sm text-gray-600 mb-4">{match.program} • {match.university}</p>
                    
                    {/* Compatibility Details - Purpose: Explain why they're a good match */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-body-xs text-gray-700 font-medium">Why you match:</p>
                      <p className="text-body-xs text-gray-600">{match.compatibility}</p>
                    </div>
                    
                    {/* Action Button - Purpose: Clear next step */}
                    <button className="btn btn-primary w-full">
                      View Profile
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* View All CTA - Purpose: Drive traffic to main feature */}
            <motion.div variants={fadeInUp}>
              <button className="btn btn-outline btn-lg" onClick={handleGetStarted}>
                View all matches
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Purpose: Explain product benefits with clear value */}
      <section className="section">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-12 mb-16"
          >
            {/* Section Header - Purpose: Context and benefit overview */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 rounded-full text-secondary-700 text-sm font-medium">
                <Award className="w-4 h-4" />
                Built for students, by students
              </div>
              
              <h2 className="text-h1 text-gray-900">
                Everything you need to find your perfect roommate
              </h2>
              
              <p className="text-body-lg text-gray-600 max-w-3xl mx-auto">
                From smart matching to secure messaging, we've built every feature with student needs in mind.
              </p>
            </motion.div>
          </motion.div>

          {/* Feature Grid - Purpose: Clear benefit communication with visual hierarchy */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="feature-grid"
          >
            {[
              {
                icon: TrendingUp,
                title: "Smart compatibility matching",
                description: "Our AI analyzes lifestyle, study habits, and personality to find your perfect match—not just random roommates.",
                badge: "94% success rate",
                badgeColor: "badge-success",
                image: "/api/placeholder/200/120" // Visual element for AI matching
              },
              {
                icon: Filter,
                title: "Advanced filtering system",
                description: "University, program, study year, budget, lifestyle preferences, and more. Find exactly what you're looking for.",
                badge: "15+ filters",
                badgeColor: "badge-primary",
                image: "/api/placeholder/200/120"
              },
              {
                icon: MessageCircle,
                title: "Intelligent conversation starters",
                description: "Built-in messaging with icebreakers and conversation starters. Break the ice naturally with your matches.",
                badge: "Smart prompts",
                badgeColor: "badge-secondary",
                image: "/api/placeholder/200/120"
              },
              {
                icon: Shield,
                title: "Verified & secure platform",
                description: "All students are verified through their university email and ID. Your safety and privacy are our top priority.",
                badge: "100% verified",
                badgeColor: "badge-error",
                image: "/api/placeholder/200/120"
              },
              {
                icon: GraduationCap,
                title: "University partnerships",
                description: "Integrated with 50+ universities across the Netherlands. Seamless onboarding through your student portal.",
                badge: "50+ universities",
                badgeColor: "badge-primary",
                image: "/api/placeholder/200/120"
              },
              {
                icon: Home,
                title: "Complete housing solution",
                description: "Connect with verified housing listings, schedule tours, and manage your entire roommate journey in one place.",
                badge: "All-in-one",
                badgeColor: "badge-secondary",
                image: "/api/placeholder/200/120"
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} variants={fadeInUp}>
                  <div className="feature-card group">
                    {/* Visual Element - Purpose: Break text monotony and add visual interest */}
                    <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <Icon className="w-12 h-12 text-gray-400" />
                    </div>
                    
                    {/* Badge - Purpose: Quantify the benefit */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className={`badge ${feature.badgeColor}`}>
                        {feature.badge}
                      </div>
                    </div>
                    
                    {/* Content - Purpose: Clear benefit communication */}
                    <h3 className="text-h4 text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-body text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                    
                    {/* Learn More - Purpose: Provide additional information path */}
                    <button className="text-primary-600 font-medium hover:text-primary-700 transition-colors group-hover:gap-3 flex items-center gap-1">
                      Learn more
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Purpose: Social proof with clear review context */}
      <section className="section bg-gray-50">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-12 mb-16"
          >
            {/* Section Header - Purpose: Context for testimonials */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 rounded-full text-rose-700 text-sm font-medium">
                <Heart className="w-4 h-4" />
                Loved by students across the Netherlands
              </div>
              
              <h2 className="text-h1 text-gray-900">
                Join thousands of successful matches
              </h2>
              
              <p className="text-body-lg text-gray-600 max-w-3xl mx-auto">
                See what students are saying about their roommate matching experience.
              </p>
            </motion.div>
          </motion.div>

          {/* Testimonials Grid - Purpose: Social proof with clear review elements */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="testimonial-grid"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={testimonial.name} variants={fadeInUp}>
                <div className="testimonial-card">
                  {/* Quote Icon - Purpose: Clear visual indicator of testimonial */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Quote className="w-4 h-4 text-primary-600" />
                  </div>
                  
                  {/* Star Rating - Purpose: Quantify satisfaction */}
                  <div className="flex items-center gap-1 mb-4 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Testimonial Content - Purpose: Authentic social proof */}
                  <p className="text-body text-gray-700 mb-6 leading-relaxed text-center">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  
                  {/* Author Info - Purpose: Credibility and relatability */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                      {testimonial.avatar}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{testimonial.name}</h4>
                    <p className="text-body-sm text-gray-600 mb-3">
                      {testimonial.program} • {testimonial.university}
                    </p>
                    
                    {/* Highlight - Purpose: Emotional connection */}
                    <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-200">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span className="text-body-sm font-medium text-gray-900">
                        {testimonial.highlight}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* University Partners Section - Purpose: Credibility and institutional trust */}
      <section className="section">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-12 mb-16"
          >
            {/* Section Header - Purpose: Context for university partnerships */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium">
                <GraduationCap className="w-4 h-4" />
                Trusted by universities
              </div>
              
              <h2 className="text-h1 text-gray-900">
                Partnered with leading Dutch universities
              </h2>
              
              <p className="text-body-lg text-gray-600 max-w-3xl mx-auto">
                Reduce housing conflicts. Boost student wellbeing. Integrate Roommate Match with your portal in weeks.
              </p>
            </motion.div>
          </motion.div>

          {/* University Grid - Purpose: Visual credibility through logos */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="university-grid"
          >
            {universities.map((university, index) => (
              <motion.div key={university} variants={fadeInUp}>
                <div className="university-card">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <GraduationCap className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-center text-body-sm">
                    {university}
                  </h3>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Partner CTA - Purpose: Clear path for university partnerships */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center mt-16"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <button className="btn btn-secondary btn-lg" onClick={handleBecomePartner}>
                Become a partner university
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-body-sm text-gray-600">
                Free for universities • Quick integration • Dedicated support
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Purpose: Quantify success and build trust */}
      <section className="section bg-gray-50">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="stats-grid"
          >
            {[
              { number: "10,000+", label: "Students matched", icon: Users, description: "Successfully connected" },
              { number: "94%", label: "Success rate", icon: TrendingUp, description: "Happy roommates" },
              { number: "50+", label: "Partner universities", icon: GraduationCap, description: "Across Netherlands" },
              { number: "4.8★", label: "Student rating", icon: Star, description: "Average review" }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div key={stat.label} variants={fadeInUp}>
                  <div className="stat-card text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                    <div className="text-body-xs text-gray-500 mt-1">{stat.description}</div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section - Purpose: Clear conversion path with high contrast */}
      <section className="banner relative overflow-hidden">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-8 py-20"
          >
            <motion.div variants={fadeInUp} className="space-y-6">
              <h2 className="text-h1 text-white">
                Ready to find your perfect roommate?
              </h2>
              <p className="text-body-lg text-white/90 max-w-2xl mx-auto">
                Join thousands of students who've found their ideal living situation through smart matching.
              </p>
            </motion.div>

            {/* High Contrast Buttons - Purpose: Clear visibility and action hierarchy */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary btn-lg bg-white text-primary-600 hover:bg-gray-100 shadow-xl" onClick={handleGetStarted}>
                Get started for free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn btn-outline btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 shadow-lg" onClick={handleLearnMore}>
                Learn more
              </button>
            </motion.div>

            {/* Trust Indicators - Purpose: Remove final objections */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-8 justify-center text-body-sm text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Free for students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Verified students only</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Elements - Purpose: Add visual interest without distraction */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </section>
    </div>
  )
}