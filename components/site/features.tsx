'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { 
  Brain, 
  Filter, 
  MessageSquare, 
  ShieldCheck, 
  Building2, 
  Home,
  ChevronRight,
  Sparkles,
  Users,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Brain,
    title: "Smart matching",
    description: "AI-powered compatibility analysis based on lifestyle, study habits, and personality traits to find your perfect roommate match.",
    link: "Learn more",
    size: "large",
    gradient: "from-blue-500/20 via-purple-500/20 to-pink-500/20",
    iconGradient: "from-blue-500 to-purple-600"
  },
  {
    icon: Filter,
    title: "Advanced filters",
    description: "Filter by university, program, study year, budget, lifestyle preferences, and more to narrow down your ideal matches.",
    link: "Learn more",
    size: "medium",
    gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
    iconGradient: "from-emerald-500 to-teal-600"
  },
  {
    icon: MessageSquare,
    title: "Conversation starters",
    description: "Get personalized ice-breaker questions and compatibility insights to help you start meaningful conversations with potential roommates.",
    link: "Learn more",
    size: "medium",
    gradient: "from-orange-500/20 via-red-500/20 to-pink-500/20",
    iconGradient: "from-orange-500 to-red-600"
  },
  {
    icon: ShieldCheck,
    title: "Verified & secure",
    description: "All users are verified through university email and ID verification. Your data is protected with enterprise-grade security.",
    link: "Learn more",
    size: "small",
    gradient: "from-green-500/20 via-emerald-500/20 to-teal-500/20",
    iconGradient: "from-green-500 to-emerald-600"
  },
  {
    icon: Building2,
    title: "University partnerships",
    description: "Trusted by 50+ leading Dutch universities. Get access to exclusive housing opportunities and student support services.",
    link: "Learn more",
    size: "small",
    gradient: "from-indigo-500/20 via-blue-500/20 to-purple-500/20",
    iconGradient: "from-indigo-500 to-blue-600"
  },
  {
    icon: Home,
    title: "Complete housing solution",
    description: "Find roommates, discover verified housing listings, and get help with move-in planning all in one platform.",
    link: "Learn more",
    size: "large",
    gradient: "from-violet-500/20 via-purple-500/20 to-fuchsia-500/20",
    iconGradient: "from-violet-500 to-purple-600"
  }
]

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const getGridClasses = (size: string) => {
    switch (size) {
      case 'large':
        return 'col-span-1 md:col-span-2'
      case 'medium':
        return 'col-span-1'
      case 'small':
        return 'col-span-1'
      default:
        return 'col-span-1'
    }
  }

  return (
    <Section className="relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 via-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <Container className="relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 text-sm font-medium text-blue-700 mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Sparkles className="h-4 w-4" />
            Powered by AI
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-text mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Everything you need to find your perfect roommate
          </h2>
          <p className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-brand-muted">
            Our comprehensive platform makes finding the right roommate simple and stress-free
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                className={getGridClasses(feature.size)}
                variants={itemVariants}
              >
                <motion.div
                  className="relative group h-full"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full rounded-3xl border-0 bg-white/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_50%)]" />
                    </div>

                    <CardContent className="p-6 md:p-8 h-full flex flex-col relative z-10 min-h-[320px]">
                      <motion.div 
                        className="flex items-center mb-6"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={`h-14 w-14 bg-gradient-to-br ${feature.iconGradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        
                        {/* Floating sparkles */}
                        <motion.div
                          className="absolute -top-1 -right-1"
                          animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Sparkles className="h-4 w-4 text-yellow-400" />
                        </motion.div>
                      </motion.div>
                      
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-xl md:text-2xl font-bold text-brand-text mb-4 group-hover:text-gray-900 transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-brand-muted leading-relaxed group-hover:text-gray-700 transition-colors duration-300 flex-1">
                          {feature.description}
                        </p>
                      </div>
                      
                      <motion.div 
                        className="mt-6 pt-4 border-t border-gray-100"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button 
                          variant="ghost" 
                          className="inline-flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors duration-300 p-0 h-auto group/link"
                        >
                          {feature.link}
                          <motion.div
                            className="ml-2"
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.div>
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom CTA section */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="h-5 w-5" />
            Join 10,000+ students already matched
            <Zap className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  )
}