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
    image: "/api/placeholder/80/80"
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
      {/* Section 1: Hero Section - Fixed spacing and rounded corner issues */}
      <section className="hero relative overflow-hidden">
        <div className="container py-32">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-20 max-w-4xl mx-auto"
          >
            {/* Trust Badge - More spacing from text below */}
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full text-primary-700 text-sm font-medium shadow-lg border border-primary-200">
                <Shield className="w-4 h-4" />
                Trusted by 50+ universities
              </div>
            </motion.div>
            
            {/* Main Headline - More spacing from badge above */}
            <motion.div variants={fadeInUp} className="space-y-8">
              <h1 className="text-display text-gray-900 leading-tight">
                Find roommates who actually{' '}
                <span className="text-gradient">fit your life</span>
              </h1>
              
              <p className="text-body-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Roommate Match pairs you with compatible students based on lifestyle and study rhythm—so moving in feels easy.
              </p>
            </motion.div>

            {/* CTA Buttons - More spacing from text above and below */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="btn btn-primary btn-lg group px-8 py-4" onClick={handleGetStarted}>
                Get matched
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn btn-outline btn-lg group px-8 py-4" onClick={handleLearnMore}>
                <Play className="w-5 h-5 mr-2" />
                See how it works
              </button>
            </motion.div>

            {/* Trust Indicators - More spacing from buttons above */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-12 justify-center text-body-sm text-gray-600 pt-4">
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

        {/* Visual Elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-primary-200/30 to-secondary-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-secondary-200/30 to-primary-200/30 rounded-full blur-xl"></div>
      </section>

      {/* Section 6: Stats Section - Fixed spacing and rounded corners */}
      <section className="section bg-gradient-to-br from-primary-50 to-secondary-50 py-24">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-16 mb-20"
          >
            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 rounded-full text-primary-700 text-sm font-medium shadow-lg">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { number: "10,000+", label: "Students matched", icon: Users, description: "Successfully connected", color: "from-blue-500 to-blue-600" },
              { number: "94%", label: "Success rate", icon: TrendingUp, description: "Happy roommates", color: "from-green-500 to-green-600" },
              { number: "50+", label: "Partner universities", icon: GraduationCap, description: "Across Netherlands", color: "from-purple-500 to-purple-600" },
              { number: "4.8★", label: "Student rating", icon: Star, description: "Average review", color: "from-yellow-500 to-yellow-600" }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div key={stat.label} variants={fadeInUp}>
                  <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
                    <div className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</div>
                    <div className="text-body-sm text-gray-500">{stat.description}</div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Section 2: Top Matches Preview - Fixed spacing and rounded corners */}
      <section className="section bg-white py-24">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-16 mb-20"
          >
            {/* Section Header */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full text-primary-700 text-sm font-medium shadow-lg">
                <Users className="w-4 h-4" />
                Your potential matches
              </div>
              
              <h2 className="text-h2 text-gray-900">See who you could match with</h2>
              <p className="text-body text-gray-600 max-w-2xl mx-auto">
                Our AI analyzes compatibility across lifestyle, study habits, and personality traits to find your perfect roommate.
              </p>
            </motion.div>
          </motion.div>

          {/* Match Cards - Fixed rounded corners and spacing */}
          <motion.div
            variants={staggerChildren}
            className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto mb-16"
          >
            {[
              { name: "Emma", program: "Computer Science", university: "TU Delft", score: "94%", compatibility: "Study schedule, cleanliness, quiet hours", color: "from-blue-500 to-blue-600" },
              { name: "Lucas", program: "Engineering", university: "Eindhoven", score: "89%", compatibility: "Budget, location, social preferences", color: "from-green-500 to-green-600" },
              { name: "Sofia", program: "Business", university: "Rotterdam", score: "87%", compatibility: "Hobbies, communication style, lifestyle", color: "from-purple-500 to-purple-600" }
            ].map((match, index) => (
              <motion.div key={match.name} variants={fadeInUp}>
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                  {/* Match Score with better positioning */}
                  <div className={`absolute top-6 right-6 w-16 h-16 bg-gradient-to-br ${match.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {match.score}
                  </div>
                  
                  {/* Avatar with gradient colors */}
                  <div className={`w-24 h-24 bg-gradient-to-br ${match.color} rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-lg`}>
                    {match.name[0]}
                  </div>
                  
                  {/* Match Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{match.name}</h3>
                  <p className="text-body text-gray-600 mb-6">{match.program} • {match.university}</p>
                  
                  {/* Compatibility Details with better spacing */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200">
                    <p className="text-body-sm text-gray-700 font-medium mb-2">Why you match:</p>
                    <p className="text-body-sm text-gray-600">{match.compatibility}</p>
                  </div>
                  
                  {/* Action Button */}
                  <button className="btn btn-primary w-full py-3 px-6">
                    View Profile
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* View All CTA - More spacing from cards above */}
          <motion.div variants={fadeInUp} className="text-center">
            <button className="btn btn-outline btn-lg px-8 py-4" onClick={handleGetStarted}>
              View all matches
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Features Section - Fixed spacing and button styling */}
      <section className="section bg-gray-50 py-24">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-16 mb-20"
          >
            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-100 rounded-full text-secondary-700 text-sm font-medium shadow-lg">
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

          {/* Feature Grid - Fixed spacing and button styling */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {[
              {
                icon: TrendingUp,
                title: "Smart compatibility matching",
                description: "Our AI analyzes lifestyle, study habits, and personality to find your perfect match—not just random roommates.",
                badge: "94% success rate",
                badgeColor: "bg-green-100 text-green-700",
                buttonColor: "from-green-500 to-green-600"
              },
              {
                icon: Filter,
                title: "Advanced filtering system",
                description: "University, program, study year, budget, lifestyle preferences, and more. Find exactly what you're looking for.",
                badge: "15+ filters",
                badgeColor: "bg-blue-100 text-blue-700",
                buttonColor: "from-blue-500 to-blue-600"
              },
              {
                icon: MessageCircle,
                title: "Intelligent conversation starters",
                description: "Built-in messaging with icebreakers and conversation starters. Break the ice naturally with your matches.",
                badge: "Smart prompts",
                badgeColor: "bg-purple-100 text-purple-700",
                buttonColor: "from-purple-500 to-purple-600"
              },
              {
                icon: Shield,
                title: "Verified & secure platform",
                description: "All students are verified through their university email and ID. Your safety and privacy are our top priority.",
                badge: "100% verified",
                badgeColor: "bg-red-100 text-red-700",
                buttonColor: "from-red-500 to-red-600"
              },
              {
                icon: GraduationCap,
                title: "University partnerships",
                description: "Integrated with 50+ universities across the Netherlands. Seamless onboarding through your student portal.",
                badge: "50+ universities",
                badgeColor: "bg-blue-100 text-blue-700",
                buttonColor: "from-blue-500 to-blue-600"
              },
              {
                icon: Home,
                title: "Complete housing solution",
                description: "Connect with verified housing listings, schedule tours, and manage your entire roommate journey in one place.",
                badge: "All-in-one",
                badgeColor: "bg-purple-100 text-purple-700",
                buttonColor: "from-purple-500 to-purple-600"
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} variants={fadeInUp}>
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    {/* Visual Element */}
                    <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-8 flex items-center justify-center">
                      <Icon className="w-16 h-16 text-gray-400" />
                    </div>
                    
                    {/* Badge */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-7 h-7 text-primary-600" />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${feature.badgeColor}`}>
                        {feature.badge}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-body text-gray-600 mb-8 leading-relaxed">{feature.description}</p>
                    
                    {/* Modern Learn More Button - Fixed styling */}
                    <button className={`w-full py-4 px-6 bg-gradient-to-r ${feature.buttonColor} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 border-0`}>
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

      {/* Section 4: Testimonials - Fixed spacing and layout */}
      <section className="section bg-white py-24">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-16 mb-20"
          >
            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full text-rose-700 text-sm font-medium shadow-lg">
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

          {/* Testimonials Grid - Fixed spacing */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="grid md:grid-cols-3 gap-10"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={testimonial.name} variants={fadeInUp}>
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  {/* Quote Icon */}
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mb-8">
                    <Quote className="w-5 h-5 text-primary-600" />
                  </div>
                  
                  {/* Author Info First */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 mb-2">{testimonial.name}</h4>
                      <p className="text-body-sm text-gray-600 mb-3">
                        {testimonial.program} • {testimonial.university}
                      </p>
                      {/* Star Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Testimonial Content */}
                  <p className="text-body text-gray-700 mb-8 leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  
                  {/* Highlight */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <Heart className="w-5 h-5 text-rose-500" />
                    <span className="text-body-sm font-medium text-gray-900">
                      {testimonial.highlight}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 5: University Partners - Fixed spacing and text styling */}
      <section className="section bg-gradient-to-br from-primary-50 to-secondary-50 py-24">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-16 mb-20"
          >
            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 rounded-full text-primary-700 text-sm font-medium shadow-lg">
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

          {/* University Grid - Fixed spacing and text styling */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {universities.map((university, index) => (
              <motion.div key={university} variants={fadeInUp}>
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">
                    {university}
                  </h3>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Partner CTA - More spacing from grid above */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center mt-20"
          >
            <motion.div variants={fadeInUp} className="space-y-6">
              <button className="btn btn-secondary btn-lg px-8 py-4" onClick={handleBecomePartner}>
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

      {/* Section 7: Final CTA Section - Fixed footer button styling and contrast */}
      <section className="banner relative overflow-hidden py-24">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-12"
          >
            <motion.div variants={fadeInUp} className="space-y-8">
              <h2 className="text-h1 text-white">
                Ready to find your perfect roommate?
              </h2>
              <p className="text-body-lg text-white leading-relaxed max-w-2xl mx-auto">
                Join thousands of students who've found their ideal living situation through smart matching.
              </p>
            </motion.div>

            {/* Fixed button styling - No black lines, better contrast */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
              <button className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100 text-lg font-semibold py-4 px-8 rounded-xl shadow-xl transition-all duration-300 flex items-center justify-center gap-2" onClick={handleGetStarted}>
                Get started for free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2" onClick={handleLearnMore}>
                Learn more
              </button>
            </motion.div>

            {/* Better contrast for trust indicators */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-12 justify-center text-body-sm text-white pt-4">
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

        {/* Background Elements */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </section>
    </div>
  )
}