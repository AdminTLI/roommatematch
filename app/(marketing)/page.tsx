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
    highlight: "Found my best friend!"
  },
  {
    name: "Lucas Janssen", 
    university: "Eindhoven University",
    program: "Engineering",
    avatar: "L",
    rating: 5,
    text: "The compatibility matching is incredible. My roommate and I clicked from day one. The app made the whole process so much easier than traditional roommate hunting.",
    highlight: "Perfect match!"
  },
  {
    name: "Sofia Rodriguez",
    university: "Rotterdam School of Management", 
    program: "Business Administration",
    avatar: "S",
    rating: 5,
    text: "I was skeptical at first, but the AI matching really works. My roommate and I have complementary personalities and study habits. Couldn't be happier!",
    highlight: "Highly recommend!"
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
      {/* Hero Section - Clean and Modern */}
      <section className="hero">
        <div className="container py-32">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-16 max-w-4xl mx-auto"
          >
            {/* Trust Badge */}
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium">
                <Shield className="w-4 h-4" />
                Trusted by 50+ universities
              </div>
            </motion.div>
            
            {/* Main Headline */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <h1 className="text-display text-gray-900">
                Find roommates who actually{' '}
                <span className="text-primary-600">fit your life</span>
              </h1>
              
              <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
                Roommate Match pairs you with compatible students based on lifestyle and study rhythm—so moving in feels easy.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
                Get matched
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn btn-outline btn-lg" onClick={handleLearnMore}>
                <Play className="w-5 h-5 mr-2" />
                See how it works
              </button>
            </motion.div>

            {/* Trust Indicators */}
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
      </section>

      {/* Stats Section - Clean and Simple */}
      <section className="section bg-gray-50">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-12 mb-16"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Proven results
              </div>
              
              <h2 className="text-h1 text-gray-900">
                Trusted by thousands of students
              </h2>
              
              <p className="text-body-lg text-gray-600 max-w-3xl mx-auto">
                Our platform has successfully connected students across the Netherlands with their ideal roommates.
              </p>
            </motion.div>
          </motion.div>

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
                  <div className="stat-card">
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

      {/* Top Matches Preview - Clean Cards */}
      <section className="section">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-12 mb-16"
          >
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
          </motion.div>

          <motion.div
            variants={staggerChildren}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12"
          >
            {[
              { name: "Emma", program: "Computer Science", university: "TU Delft", score: "94%", compatibility: "Study schedule, cleanliness, quiet hours" },
              { name: "Lucas", program: "Engineering", university: "Eindhoven", score: "89%", compatibility: "Budget, location, social preferences" },
              { name: "Sofia", program: "Business", university: "Rotterdam", score: "87%", compatibility: "Hobbies, communication style, lifestyle" }
            ].map((match, index) => (
              <motion.div key={match.name} variants={fadeInUp}>
                <div className="match-card">
                  {/* Match Score */}
                  <div className="match-score">
                    {match.score}
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-2xl mx-auto mb-4">
                    {match.name[0]}
                  </div>
                  
                  {/* Match Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{match.name}</h3>
                  <p className="text-body-sm text-gray-600 mb-4 text-center">{match.program} • {match.university}</p>
                  
                  {/* Compatibility Details */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-body-xs text-gray-700 font-medium mb-1">Why you match:</p>
                    <p className="text-body-xs text-gray-600">{match.compatibility}</p>
                  </div>
                  
                  {/* Action Button */}
                  <button className="btn btn-primary w-full">
                    View Profile
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* View All CTA */}
          <motion.div variants={fadeInUp} className="text-center">
            <button className="btn btn-outline btn-lg" onClick={handleGetStarted}>
              View all matches
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Clean Grid */}
      <section className="section bg-gray-50">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-12 mb-16"
          >
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

          {/* Feature Grid */}
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
                badgeColor: "badge-success"
              },
              {
                icon: Filter,
                title: "Advanced filtering system",
                description: "University, program, study year, budget, lifestyle preferences, and more. Find exactly what you're looking for.",
                badge: "15+ filters",
                badgeColor: "badge-primary"
              },
              {
                icon: MessageCircle,
                title: "Intelligent conversation starters",
                description: "Built-in messaging with icebreakers and conversation starters. Break the ice naturally with your matches.",
                badge: "Smart prompts",
                badgeColor: "badge-secondary"
              },
              {
                icon: Shield,
                title: "Verified & secure platform",
                description: "All students are verified through their university email and ID. Your safety and privacy are our top priority.",
                badge: "100% verified",
                badgeColor: "badge-error"
              },
              {
                icon: GraduationCap,
                title: "University partnerships",
                description: "Integrated with 50+ universities across the Netherlands. Seamless onboarding through your student portal.",
                badge: "50+ universities",
                badgeColor: "badge-primary"
              },
              {
                icon: Home,
                title: "Complete housing solution",
                description: "Connect with verified housing listings, schedule tours, and manage your entire roommate journey in one place.",
                badge: "All-in-one",
                badgeColor: "badge-secondary"
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} variants={fadeInUp}>
                  <div className="card">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    
                    {/* Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex-1">{feature.title}</h3>
                      <div className={`badge ${feature.badgeColor}`}>
                        {feature.badge}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <p className="text-body text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                    
                    {/* Learn More Button */}
                    <button className="text-primary-600 font-medium hover:text-primary-700 transition-colors flex items-center gap-2">
                      Learn more
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Clean Layout */}
      <section className="section">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-12 mb-16"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-100 rounded-full text-success-700 text-sm font-medium">
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

          {/* Testimonials Grid */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="testimonial-grid"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={testimonial.name} variants={fadeInUp}>
                <div className="card">
                  {/* Quote Icon */}
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                    <Quote className="w-4 h-4 text-primary-600" />
                  </div>
                  
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-4 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Testimonial Content */}
                  <p className="text-body text-gray-700 mb-6 leading-relaxed text-center">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  
                  {/* Author Info */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl mx-auto mb-3">
                      {testimonial.avatar}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{testimonial.name}</h4>
                    <p className="text-body-sm text-gray-600 mb-3">
                      {testimonial.program} • {testimonial.university}
                    </p>
                    
                    {/* Highlight */}
                    <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-200">
                      <Heart className="w-4 h-4 text-success-500" />
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

      {/* University Partners Section - Clean Grid */}
      <section className="section bg-gray-50">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-12 mb-16"
          >
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

          {/* University Grid */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="university-grid"
          >
            {universities.map((university, index) => (
              <motion.div key={university} variants={fadeInUp}>
                <div className="card text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {university}
                  </h3>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Partner CTA */}
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

      {/* Final CTA Section - Clean Banner */}
      <section className="banner">
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

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100" onClick={handleGetStarted}>
                Get started for free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600" onClick={handleLearnMore}>
                Learn more
              </button>
            </motion.div>

            {/* Trust Indicators */}
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
      </section>
    </div>
  )
}