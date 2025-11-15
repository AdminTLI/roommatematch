'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Heart, 
  Shield, 
  Star, 
  ArrowRight, 
  CheckCircle,
  Play
} from 'lucide-react'
import Image from 'next/image'

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

export function Hero() {
  const router = useRouter()

  const handleGetMatched = () => {
    router.push('/dashboard')
  }

  const handleSeeHowItWorks = () => {
    router.push('/learn')
  }

  const handleViewAllMatches = () => {
    router.push('/matches')
  }

  return (
    <section className="relative overflow-hidden bg-hero-gradient bg-noise">
      <div className="container-custom section-padding">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <Badge variant="accent" className="w-fit">
                <Star className="w-3 h-3 mr-1" />
                Science-backed matching
              </Badge>
              
              <h1 className="text-display text-ink-900">
                From strangers to{' '}
                <span className="text-gradient">roommates</span>
              </h1>
              
              <p className="text-h4 text-ink-700 max-w-2xl">
                Domu Match pairs you with compatible students based on lifestyle and study rhythm. Our algorithm analyzes 40+ factors to prevent conflicts before they start - so moving in feels easy.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group" onClick={handleGetMatched}>
                Get matched
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="group" onClick={handleSeeHowItWorks}>
                <Play className="w-4 h-4 mr-2" />
                See how it works
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-6 text-body-sm text-ink-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-mint-600" />
                <span>Verified students only</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-mint-600" />
                <span>Free for students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-mint-600" />
                <span>Designed for Dutch universities</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Mock UI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative"
          >
            <div className="relative z-10">
              {/* Main Dashboard Mock */}
              <Card variant="elevated" className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink-900">Your Top Matches</h3>
                    <p className="text-body-sm text-ink-500">3 compatible roommates found</p>
                  </div>
                </div>

                {/* Match Cards */}
                <div className="space-y-3">
                  {[
                    { name: "Emma", score: 94, program: "Computer Science", university: "TU Delft" },
                    { name: "Lucas", score: 89, program: "Engineering", university: "Eindhoven" },
                    { name: "Sofia", score: 87, program: "Business", university: "Rotterdam" }
                  ].map((match, index) => (
                    <motion.div
                      key={match.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="flex items-center gap-3 p-3 bg-surface-1 rounded-xl border border-line"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {match.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink-900">{match.name}</span>
                          <Badge variant="mint" size="sm">
                            {match.score}% match
                          </Badge>
                        </div>
                        <p className="text-body-xs text-ink-500">
                          <span>{match.program}</span>
                          <span className="mx-2">•</span>
                          <span>{match.university}</span>
                        </p>
                      </div>
                      <Heart className="w-4 h-4 text-rose-500" />
                    </motion.div>
                  ))}
                </div>

                <Button className="w-full" onClick={handleViewAllMatches}>
                  View all matches
                </Button>
              </Card>

              {/* Floating Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -top-4 -right-4 z-20"
              >
                <Card variant="accent" className="p-4 text-center">
                  <div className="text-2xl font-bold text-brand-900">40+</div>
                  <div className="text-body-xs text-brand-700">Factors</div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute -bottom-4 -left-4 z-20"
              >
                <Card variant="success" className="p-4 text-center">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-mint-600" />
                    <span className="text-body-xs text-mint-700 font-medium">Verified</span>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-100/20 to-mint-100/20 rounded-3xl -z-10 blur-xl" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
