'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Filter, 
  MessageCircle, 
  Shield, 
  Users, 
  Home,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: "Real compatibility, not guesswork",
    description: "Our AI analyzes 40+ lifestyle factors, study habits, and personality to find your perfect match—not just random roommates.",
    highlight: "40+ factors",
    color: "brand"
  },
  {
    icon: Filter,
    title: "Filters that matter",
    description: "University, program, study year, budget, lifestyle preferences, and more. Find exactly what you're looking for.",
    highlight: "15+ filters",
    color: "accent"
  },
  {
    icon: MessageCircle,
    title: "Chat when it clicks",
    description: "Built-in messaging with icebreakers and conversation starters. Break the ice naturally with your matches.",
    highlight: "Smart prompts",
    color: "mint"
  },
  {
    icon: Shield,
    title: "Verified & safe",
    description: "All students are verified through their university email and ID. Your safety and privacy are our top priority.",
    highlight: "100% verified",
    color: "rose"
  },
  {
    icon: Users,
    title: "Designed for Dutch universities",
    description: "Built specifically for students at Dutch universities. Seamless onboarding through your student email.",
    highlight: "Dutch universities",
    color: "brand"
  },
  {
    icon: Home,
    title: "Housing integration",
    description: "Connect with verified housing listings, schedule tours, and manage your entire roommate journey in one place.",
    highlight: "All-in-one",
    color: "accent"
  }
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

export function FeatureGrid() {
  const router = useRouter()

  const handleLearnMore = () => {
    router.push('/learn')
  }

  return (
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
            <Badge variant="secondary" className="mb-4">
              <CheckCircle className="w-3 h-3 mr-1" />
              Built for students, by students
            </Badge>
          </motion.div>
          
          <motion.h2 variants={fadeInUp} className="text-h1 text-ink-900">
            Everything you need to go from strangers to roommates
          </motion.h2>
          
          <motion.p variants={fadeInUp} className="text-h4 text-ink-700 max-w-3xl mx-auto">
            From smart matching to secure messaging, we&apos;ve built every feature with student needs in mind.
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            const colorVariants = {
              brand: "bg-brand-100 text-brand-600 border-brand-200",
              accent: "bg-accent-100 text-accent-600 border-accent-200", 
              mint: "bg-mint-100 text-mint-600 border-mint-200",
              rose: "bg-rose-100 text-rose-600 border-rose-200"
            }

            return (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card variant="interactive" className="h-full group">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorVariants[feature.color as keyof typeof colorVariants]}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant={feature.color as any} size="sm">
                        {feature.highlight}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-h4 text-ink-900 font-semibold">
                        {feature.title}
                      </h3>
                      <p className="text-body text-ink-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <div 
                      className="flex items-center text-brand-600 text-body-sm font-medium group-hover:gap-3 transition-all cursor-pointer"
                      onClick={handleLearnMore}
                      onKeyDown={(e) => e.key === 'Enter' && handleLearnMore()}
                      tabIndex={0}
                      role="button"
                      aria-label="Learn more about this feature"
                    >
                      Learn more
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
