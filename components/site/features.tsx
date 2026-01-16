'use client'

import { Card, CardContent } from '@/components/ui/card'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import {
  Brain,
  Filter,
  MessageSquare,
  ShieldCheck,
  Building2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Everything you need to",
    titleHighlight: "find your ideal roommate",
    subtitle: "Our comprehensive platform makes finding the right roommate simple and stress-free",
    features: [
      {
        icon: Brain,
        title: "Smart matching",
        description: "AI-powered compatibility analysis based on lifestyle, study habits, and personality traits to help you connect with ideal roommates.",
        size: "large",
        gradient: "from-blue-500/20 via-purple-500/20 to-pink-500/20",
        iconGradient: "from-blue-500 to-purple-600"
      },
      {
        icon: Filter,
        title: "Advanced filters",
        description: "Filter by university, program, study year, budget, lifestyle preferences, and more to find compatible students.",
        size: "medium",
        gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
        iconGradient: "from-emerald-500 to-teal-600"
      },
      {
        icon: MessageSquare,
        title: "Conversation starters",
        description: "Get personalized ice-breaker questions and compatibility insights to help you start meaningful conversations with potential roommates.",
        size: "medium",
        gradient: "from-orange-500/20 via-red-500/20 to-pink-500/20",
        iconGradient: "from-orange-500 to-red-600"
      },
      {
        icon: ShieldCheck,
        title: "Verified & secure",
        description: "All users are verified through university email and ID verification. Your data is protected with enterprise-grade security.",
        size: "small",
        gradient: "from-green-500/20 via-emerald-500/20 to-teal-500/20",
        iconGradient: "from-green-500 to-emerald-600"
      },
      {
        icon: Building2,
        title: "University partnerships",
        description: "Trusted by 50+ leading Dutch universities. Get access to student support services and university resources.",
        size: "small",
        gradient: "from-indigo-500/20 via-blue-500/20 to-purple-500/20",
        iconGradient: "from-indigo-500 to-blue-600"
      }

    ]
  },
  nl: {
    title: "Alles wat je nodig hebt om",
    titleHighlight: "je ideale huisgenoot te vinden",
    subtitle: "Ons uitgebreide platform maakt het vinden van de juiste huisgenoot eenvoudig en stressvrij",
    features: [
      {
        icon: Brain,
        title: "Slimme matching",
        description: "AI-gestuurde compatibiliteitsanalyse op basis van levensstijl, studiegewoonten en persoonlijkheidskenmerken om je te helpen verbinden met ideale huisgenoten.",
        size: "large",
        gradient: "from-blue-500/20 via-purple-500/20 to-pink-500/20",
        iconGradient: "from-blue-500 to-purple-600"
      },
      {
        icon: Filter,
        title: "Geavanceerde filters",
        description: "Filter op universiteit, programma, studiejaar, budget, levensstijlvoorkeuren en meer om compatibele studenten te vinden.",
        size: "medium",
        gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
        iconGradient: "from-emerald-500 to-teal-600"
      },
      {
        icon: MessageSquare,
        title: "Gespreksstarters",
        description: "Krijg gepersonaliseerde ijsbrekervragen en compatibiliteitsinzichten om je te helpen betekenisvolle gesprekken te starten met potentiële huisgenoten.",
        size: "medium",
        gradient: "from-orange-500/20 via-red-500/20 to-pink-500/20",
        iconGradient: "from-orange-500 to-red-600"
      },
      {
        icon: ShieldCheck,
        title: "Geverifieerd en veilig",
        description: "Alle gebruikers zijn geverifieerd via universiteits-e-mail en ID-verificatie. Je gegevens zijn beschermd met enterprise-grade beveiliging.",
        size: "small",
        gradient: "from-green-500/20 via-emerald-500/20 to-teal-500/20",
        iconGradient: "from-green-500 to-emerald-600"
      },
      {
        icon: Building2,
        title: "Universiteitspartnerschappen",
        description: "Vertrouwd door 50+ toonaangevende Nederlandse universiteiten. Krijg toegang tot studentenondersteuningsdiensten en universiteitsbronnen.",
        size: "small",
        gradient: "from-indigo-500/20 via-blue-500/20 to-purple-500/20",
        iconGradient: "from-indigo-500 to-blue-600"
      }

    ]
  }
}

export function Features() {
  const { locale } = useApp()
  const t = content[locale]

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
        ease: "easeOut"
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
    <Section className="relative overflow-hidden bg-white">
      <Container>
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text mb-6 leading-tight pt-4">
            {t.title} <span className="text-brand-primary">{t.titleHighlight}</span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto text-brand-muted">
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {t.features.map((feature, index) => {
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
                  <Card className="h-full rounded-2xl border border-brand-border/50 bg-white/80 backdrop-blur-sm shadow-elev-1 hover:shadow-elev-2 transition-all duration-200 overflow-hidden">
                    <CardContent className="p-6 md:p-8 h-full flex flex-col min-h-[280px]">
                      <div className="flex items-center mb-6">
                        <div className={`h-14 w-14 bg-gradient-to-br ${feature.iconGradient} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col">
                        <h3 className="text-xl md:text-2xl font-bold text-brand-text mb-4">
                          {feature.title}
                        </h3>
                        <p className="text-base text-brand-muted leading-relaxed flex-1">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>

      </Container>
    </Section>
  )
}