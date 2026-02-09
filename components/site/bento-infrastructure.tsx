'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, animate, useReducedMotion } from 'framer-motion'
import { ShieldCheck, Heart, Home } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const content = {
  en: {
    smartMatching: 'Smart Matching',
    compatibility: 'compatibility',
    smartMatchingCopy:
      "Our algorithm analyzes 40+ factors - quiet hours, cleanliness, study habits, sleep schedules - so you find roommates who actually fit your lifestyle. Universities see fewer disputes and happier students.",
    idVerified: 'ID Verified',
    idVerifiedCopy:
      "Government ID + selfie verification for every student. No catfish, no scams - universities back it so you can focus on finding the right fit.",
    wellbeingFirst: 'Wellbeing First',
    wellbeingCopy:
      "Compatible homes become micro-support systems. When your living situation fits, you thrive - universities see happier students and better retention.",
    antiDropout: 'The Anti-Dropout Engine',
    antiDropoutCopy:
      "Safe homes create successful students. 47% of dropouts cite housing stress - we reduce incompatibility before move-in so students stay, thrive, and graduate.",
  },
  nl: {
    smartMatching: 'Slimme Matching',
    compatibility: 'compatibiliteit',
    smartMatchingCopy:
      "Ons algoritme analyseert 40+ factoren - stille uren, netheid, studeergewoonten, slaapschema's - zodat je huisgenoten vindt die bij je lifestyle passen. Universiteiten zien minder conflicten en tevredenere studenten.",
    idVerified: 'ID Geverifieerd',
    idVerifiedCopy:
      "ID- en selfieverificatie voor elke student. Geen catfish, geen oplichting - universiteiten staan erachter zodat je je op de juiste match kunt richten.",
    wellbeingFirst: 'Welzijn Eerst',
    wellbeingCopy:
      "Compatibele woningen worden micro-ondersteuningssystemen. Als je woonsituatie klopt, gedij je - universiteiten zien tevredenere studenten en betere retentie.",
    antiDropout: 'De Anti-Uitval Motor',
    antiDropoutCopy:
      "Veilige huizen maken succesvolle studenten. 47% van de uitvallers noemt huisvestingsstress - wij verminderen onverenigbaarheid vóór intrek, zodat studenten blijven, gedijen en afstuderen.",
  },
}

function CompatibilityCounter({
  className,
  reducedMotion,
}: {
  className?: string
  reducedMotion?: boolean
}) {
  const count = useMotionValue(reducedMotion ? 98 : 0)
  const [display, setDisplay] = useState(reducedMotion ? '98' : '0')

  useEffect(() => {
    if (reducedMotion) return
    const controls = animate(count, 98, {
      duration: 2,
      delay: 0.5,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v).toString()),
    })
    return () => controls.stop()
  }, [count, reducedMotion])

  return (
    <motion.span
      className={cn('tabular-nums font-bold text-4xl md:text-5xl text-white', className)}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={reducedMotion ? false : { opacity: 1, scale: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.4 }}
    >
      {display}%
    </motion.span>
  )
}

export function BentoInfrastructure() {
  const { locale } = useApp()
  const reducedMotion = useReducedMotion()
  const t = content[locale]

  const itemVariants = {
    hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
    visible: reducedMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: 'easeOut' },
        },
  }

  return (
    <Section className="relative overflow-hidden py-16 md:py-24">
      <Container className="relative z-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1, delayChildren: 0.05 },
            },
          }}
        >
          {/* Large: Smart Matching + counter */}
          <motion.div
            className={cn(
              'glass noise-overlay md:col-span-2 md:row-span-2 p-8 md:p-10 flex flex-col justify-center min-h-[280px] md:min-h-[320px]'
            )}
            variants={itemVariants}
          >
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-4">
              {t.smartMatching}
            </h3>
            <div className="flex items-baseline gap-2 mb-4">
              <CompatibilityCounter reducedMotion={!!reducedMotion} />
              <span className="text-white/60 text-lg">{t.compatibility}</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-md">
              {t.smartMatchingCopy}
            </p>
          </motion.div>

          {/* Small: ID Verified */}
          <motion.div
            className={cn('glass noise-overlay p-6 md:p-8 flex flex-col items-center justify-center min-h-[200px]')}
            variants={itemVariants}
          >
            <motion.div
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/30 mb-4"
              animate={reducedMotion ? false : { scale: [1, 1.05, 1] }}
              transition={
                reducedMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <ShieldCheck className="h-7 w-7 text-emerald-400" aria-hidden />
            </motion.div>
            <h3 className="text-lg font-bold text-white tracking-tight text-center mb-2">{t.idVerified}</h3>
            <p className="text-white/70 text-sm leading-relaxed text-center">{t.idVerifiedCopy}</p>
          </motion.div>

          {/* Small: Wellbeing First */}
          <motion.div
            className={cn('glass noise-overlay p-6 md:p-8 flex flex-col items-center justify-center min-h-[200px]')}
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-7 w-7 text-rose-400" aria-hidden />
              <span className="text-white/40"> - </span>
              <Home className="h-7 w-7 text-indigo-400" aria-hidden />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight text-center mb-2">
              {t.wellbeingFirst}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed text-center">{t.wellbeingCopy}</p>
          </motion.div>

          {/* Wide: Anti-Dropout Engine */}
          <motion.div
            className={cn('glass noise-overlay md:col-span-3 p-8 md:p-10')}
            variants={itemVariants}
          >
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
              {t.antiDropout}
            </h3>
            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-3xl">
              {t.antiDropoutCopy}
            </p>
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  )
}
