'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Hero } from '@/components/marketing/hero'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
      <Hero />
      
      <FeatureGrid />

      {/* Social Proof Section */}
      <section className="section-padding bg-surface-1">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-4 mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="accent" className="mb-4">
                <Heart className="w-3 h-3 mr-1" />
                Loved by students across the Netherlands
              </Badge>
            </motion.div>
            
            <motion.h2 variants={fadeInUp} className="text-h1 text-ink-900">
              Join thousands of successful matches
            </motion.h2>
            
            <motion.p variants={fadeInUp} className="text-h4 text-ink-700 max-w-3xl mx-auto">
              See what students are saying about their roommate matching experience.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={testimonial.name} variants={fadeInUp}>
                <Card variant="interactive" className="h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-ink-900">{testimonial.name}</h3>
                          <Badge variant="mint" size="sm">
                            <Star className="w-3 h-3 mr-1" />
                            {testimonial.rating}
                          </Badge>
                        </div>
                        <p className="text-body-sm text-ink-500">
                          {testimonial.program} • {testimonial.university}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-body text-ink-700 leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    
                    <div className="flex items-center gap-2 pt-2 border-t border-line">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span className="text-body-sm font-medium text-ink-900">
                        {testimonial.highlight}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* University Partners Section */}
      <section className="section-padding bg-surface-0">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-4 mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="brand" className="mb-4">
                <GraduationCap className="w-3 h-3 mr-1" />
                Trusted by universities
              </Badge>
            </motion.div>
            
            <motion.h2 variants={fadeInUp} className="text-h1 text-ink-900">
              Partnered with leading Dutch universities
            </motion.h2>
            
            <motion.p variants={fadeInUp} className="text-h4 text-ink-700 max-w-3xl mx-auto">
              Reduce housing conflicts. Boost student wellbeing. Integrate Roommate Match with your portal in weeks.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {universities.map((university, index) => (
              <motion.div key={university} variants={fadeInUp}>
                <Card variant="interactive" className="text-center p-4">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <GraduationCap className="w-6 h-6 text-brand-600" />
                    </div>
                    <h3 className="font-medium text-ink-900 text-body-sm">
                      {university}
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center mt-12"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <Button size="lg" variant="accent" className="group" onClick={handleBecomePartner}>
                Become a partner university
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-body-sm text-ink-500">
                Free for universities • Quick integration • Dedicated support
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-brand-50">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { number: "10,000+", label: "Students matched", icon: Users },
              { number: "94%", label: "Success rate", icon: TrendingUp },
              { number: "50+", label: "Partner universities", icon: GraduationCap },
              { number: "4.8★", label: "Student rating", icon: Star }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div key={stat.label} variants={fadeInUp} className="text-center">
                  <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-brand-600" />
                  </div>
                  <div className="text-4xl font-bold text-brand-900 mb-2">{stat.number}</div>
                  <div className="text-body text-brand-700">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-hero-gradient">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center space-y-8 max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <h2 className="text-h1 text-ink-900">
                Ready to find your perfect roommate?
              </h2>
              <p className="text-h4 text-ink-700">
                Join thousands of students who've found their ideal living situation through smart matching.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group" onClick={handleGetStarted}>
                Get started for free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={handleLearnMore}>
                Learn more
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-6 justify-center text-body-sm text-ink-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-mint-600" />
                <span>Free for students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-mint-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-mint-600" />
                <span>Verified students only</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
