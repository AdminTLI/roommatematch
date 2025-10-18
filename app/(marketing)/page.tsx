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
  TrendingUp
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
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="container">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerChildren}
              className="text-center space-y-8 py-20"
            >
              <motion.div variants={fadeInUp} className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Trusted by 50+ universities
                </div>
                
                <h1 className="text-display text-gray-900 max-w-4xl mx-auto">
                  Find roommates who actually fit your life
                </h1>
                
                <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
                  Roommate Match pairs you with compatible students based on lifestyle and study rhythm—so moving in feels easy.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
                  Get matched
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="btn btn-outline btn-lg" onClick={handleLearnMore}>
                  See how it works
                </button>
              </motion.div>

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
        </div>
      </section>

      {/* Top Matches Section */}
      <section className="section">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-8"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-6 h-6 text-primary-600" />
                <h2 className="text-h2 text-gray-900">Your Top Matches</h2>
              </div>
              <p className="text-body text-gray-600">3 compatible roommates found</p>
            </motion.div>

            <motion.div
              variants={staggerChildren}
              className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              {[
                { name: "Emma", program: "Computer Science", university: "TU Delft", score: "94%" },
                { name: "Lucas", program: "Engineering", university: "Eindhoven", score: "89%" },
                { name: "Sofia", program: "Business", university: "Rotterdam", score: "87%" }
              ].map((match, index) => (
                <motion.div key={match.name} variants={fadeInUp}>
                  <div className="match-card">
                    <div className="match-score">{match.score}</div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {match.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{match.name}</h3>
                        <p className="text-body-sm text-gray-600">{match.program} • {match.university}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" />
                      <span className="text-body-sm text-gray-700">Compatible match</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp}>
              <button className="btn btn-primary btn-xl w-full max-w-md mx-auto">
                View all matches
              </button>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">94%</div>
                <div className="text-body-sm text-gray-600">Compatibility</div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <span className="text-body-sm text-gray-700">Verified</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-8 mb-16"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 rounded-full text-secondary-700 text-sm font-medium">
                <MessageCircle className="w-4 h-4" />
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

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="feature-grid"
          >
            {[
              {
                icon: Users,
                title: "Real compatibility, not guesswork",
                description: "Our AI analyzes lifestyle, study habits, and personality to find your perfect match—not just random roommates.",
                badge: "94% success rate",
                badgeColor: "badge-primary"
              },
              {
                icon: MessageCircle,
                title: "Filters that matter",
                description: "University, program, study year, budget, lifestyle preferences, and more. Find exactly what you're looking for.",
                badge: "15+ filters",
                badgeColor: "badge-secondary"
              },
              {
                icon: Heart,
                title: "Chat when it clicks",
                description: "Built-in messaging with icebreakers and conversation starters. Break the ice naturally with your matches.",
                badge: "Smart prompts",
                badgeColor: "badge-success"
              },
              {
                icon: Shield,
                title: "Verified & safe",
                description: "All students are verified through their university email and ID. Your safety and privacy are our top priority.",
                badge: "100% verified",
                badgeColor: "badge-gray"
              },
              {
                icon: GraduationCap,
                title: "University partnerships",
                description: "Integrated with 50+ universities across the Netherlands. Seamless onboarding through your student portal.",
                badge: "50+ universities",
                badgeColor: "badge-primary"
              },
              {
                icon: TrendingUp,
                title: "Housing integration",
                description: "Connect with verified housing listings, schedule tours, and manage your entire roommate journey in one place.",
                badge: "All-in-one",
                badgeColor: "badge-secondary"
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} variants={fadeInUp}>
                  <div className="feature-card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className={`badge ${feature.badgeColor}`}>
                        {feature.badge}
                      </div>
                    </div>
                    <h3 className="text-h4 text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-body text-gray-600 mb-4">{feature.description}</p>
                    <button className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                      Learn more →
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-8 mb-16"
          >
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
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                        <div className="badge badge-success">
                          <Star className="w-3 h-3 mr-1" />
                          {testimonial.rating}
                        </div>
                      </div>
                      <p className="text-body-sm text-gray-600">
                        {testimonial.program} • {testimonial.university}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-body text-gray-700 mb-4">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  
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

      {/* University Partners Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-8 mb-16"
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
                  <h3 className="font-medium text-gray-900 text-center">
                    {university}
                  </h3>
                </div>
              </motion.div>
            ))}
          </motion.div>

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

      {/* Stats Section */}
      <section className="section">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="stats-grid"
          >
            {[
              { number: "10,000+", label: "Students matched", icon: Users },
              { number: "94%", label: "Success rate", icon: TrendingUp },
              { number: "50+", label: "Partner universities", icon: GraduationCap },
              { number: "4.8★", label: "Student rating", icon: Star }
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
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="banner">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-8 py-16"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <h2 className="text-h1 text-white">
                Ready to find your perfect roommate?
              </h2>
              <p className="text-body-lg text-white opacity-90">
                Join thousands of students who've found their ideal living situation through smart matching.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary btn-lg bg-white text-primary-600 hover:bg-gray-100" onClick={handleGetStarted}>
                Get started for free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-600" onClick={handleLearnMore}>
                Learn more
              </button>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-8 justify-center text-body-sm text-white opacity-80">
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