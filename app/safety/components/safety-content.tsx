'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield,
  AlertTriangle,
  Phone,
  MapPin,
  Users,
  Eye,
  Lock,
  CheckCircle,
  Home,
  FileText,
  Heart,
  Bike,
  Info,
  ChevronRight,
  Building2,
  DollarSign,
  Scale,
  Zap,
  Volume2,
  Stethoscope,
  Train,
  Lightbulb
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

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

interface SafetyContentProps {
  universitySecurityPhone?: string | null
  universityName?: string | null
}

export function SafetyContent({ universitySecurityPhone, universityName }: SafetyContentProps) {
  return (
    <div className="space-y-8 pb-24 md:pb-6">
      {/* Header Section */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 text-indigo-400 mb-1">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Safety & Security</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Stay <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">Safe</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-lg text-lg font-medium">
          Stay safe with our comprehensive safety features and local guides.
        </p>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <Card className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/10 overflow-hidden shadow-2xl rounded-3xl">
          <CardHeader className="border-b border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
            <CardTitle className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="p-2 bg-red-500/10 dark:bg-red-500/20 rounded-lg">
                <Phone className="w-5 h-5 text-red-500 dark:text-red-400" />
              </div>
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl group hover:bg-red-100 dark:hover:bg-red-500/15 transition-all cursor-pointer"
              >
                <h4 className="font-semibold text-red-600 dark:text-red-400 text-lg mb-1 flex items-center gap-2">
                  Emergency Services
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                </h4>
                <p className="text-red-700 dark:text-red-300/80 font-medium">Call 112</p>
                <p className="text-xs text-red-600/70 dark:text-red-300/50 mt-1">(Police, Fire, Ambulance)</p>
              </motion.div>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl group hover:bg-blue-100 dark:hover:bg-blue-500/15 transition-all cursor-pointer"
              >
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 text-lg mb-1">University Security</h4>
                {universitySecurityPhone ? (
                  <>
                    <p className="text-blue-700 dark:text-blue-300/80 font-medium">{universitySecurityPhone}</p>
                    {universityName && (
                      <p className="text-xs text-blue-600/70 dark:text-blue-300/50 mt-1">{universityName}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-blue-700 dark:text-blue-300/80 font-medium">
                      Contact emergency services (112) for emergencies
                    </p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-300/50 mt-1">
                      {universityName ? `For ${universityName} specific concerns, contact your university office` : 'Contact your university office for non-emergency security concerns'}
                    </p>
                  </>
                )}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Safety Features */}
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={fadeInUp}>
          <Card className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/[0.04] transition-all duration-300 rounded-3xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-zinc-900 dark:text-white">
                <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">All users are verified through university email and official ID checks.</p>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/[0.04] transition-all duration-300 rounded-3xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-zinc-900 dark:text-white">
                <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Trust & Safety
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Manual profile reviews and optional background verification available.</p>
              <Button variant="outline" size="sm" className="border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 h-8">Learn More</Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/[0.04] transition-all duration-300 rounded-3xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-zinc-900 dark:text-white">
                <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
                  <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">End-to-end encryption for chats and granular privacy controls for your profile.</p>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30">Protected</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Platform Safety Guide */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <Card className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
            <CardTitle className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              Platform Safety Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6">
              <p className="text-base text-zinc-600 dark:text-zinc-400 mb-2 leading-relaxed">
                Learn how to use our platform safely and effectively. This guide covers everything you need to know about profile settings, chat safety, reporting, and blocking features.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {/* Profile Bio Guidelines */}
              <AccordionItem value="profile-bio" className="border-zinc-200 dark:border-white/10">
                <AccordionTrigger className="flex items-center gap-3 px-6 py-4 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 hover:no-underline transition-colors">
                  <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-semibold">Profile Bio Guidelines</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-6 px-6 pt-6 pb-8">
                  <div className="border-l-2 border-blue-500/50 pl-5 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-r-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">What to Include in Your Bio</h4>
                    </div>
                    <ul className="space-y-3 ml-8">
                      {[
                        "Your lifestyle preferences (early bird vs night owl, quiet vs social)",
                        "Living habits (cleanliness standards, cooking frequency)",
                        "Study schedule and work patterns",
                        "Hobbies and interests that matter to you",
                        "What you're looking for in a roommate",
                        "Any important house rules or preferences",
                        "Your personality traits and communication style"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <CheckCircle className="w-4 h-4 text-blue-500/70 dark:text-blue-400/50 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-l-2 border-red-500/50 pl-5 py-2 bg-red-50 dark:bg-red-500/10 rounded-r-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">What NOT to Include</h4>
                    </div>
                    <ul className="space-y-3 ml-8">
                      {[
                        "Personal contact information (phone, email, social media)",
                        "Your exact address or location details",
                        "Financial information or payment requests",
                        "Inappropriate or offensive content",
                        "Spam or promotional content",
                        "Links to external websites",
                        "Any information that could compromise your safety"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <AlertTriangle className="w-4 h-4 text-red-500/70 dark:text-red-400/50 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-l-2 border-emerald-500/50 pl-5 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-r-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">How to Update Your Bio</h4>
                    </div>
                    <ul className="space-y-3 ml-8">
                      {[
                        "Go to Settings from the main navigation",
                        "Click on 'Profile' section",
                        "Find the 'Bio' text field (under 'About You')",
                        "Type or edit your bio (maximum 500 characters)",
                        "Click 'Save' to update your profile",
                        "Your bio will be visible to potential matches"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <ChevronRight className="w-4 h-4 text-emerald-500/70 dark:text-emerald-400/50 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Chat Safety */}
              <AccordionItem value="chat-safety" className="border-zinc-200 dark:border-white/10">
                <AccordionTrigger className="flex items-center gap-3 px-6 py-4 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 hover:no-underline transition-colors">
                  <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
                    <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-semibold">Chat Safety</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-6 px-6 pt-6 pb-8">
                  <div className="border-l-2 border-purple-500/50 pl-5 py-2 bg-purple-50 dark:bg-purple-500/10 rounded-r-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Safe Chat Practices</h4>
                    </div>
                    <ul className="space-y-3 ml-8">
                      {[
                        "Keep conversations on the platform - don't share personal contact info immediately",
                        "Take your time getting to know someone before meeting in person",
                        "Trust your instincts - if something feels off, it probably is",
                        "Never share financial information or send money to anyone",
                        "Be cautious of users who ask for personal details too quickly",
                        "Report suspicious behavior immediately",
                        "Remember: All messages are encrypted for your privacy"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <CheckCircle className="w-4 h-4 text-purple-500/70 dark:text-purple-400/50 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-l-2 border-orange-500/50 pl-5 py-2 bg-orange-50 dark:bg-orange-500/10 rounded-r-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Automatic Message Protection</h4>
                    </div>
                    <ul className="space-y-3 ml-8">
                      {[
                        "Links are automatically blocked in messages for your safety",
                        "Email addresses cannot be sent in messages",
                        "Phone numbers are automatically filtered out",
                        "Suspicious content is flagged for review",
                        "These protections help prevent scams and phishing attempts"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <Lock className="w-4 h-4 text-orange-500/70 dark:text-orange-400/50 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-l-2 border-blue-500/50 pl-5 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-r-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Red Flags to Watch For</h4>
                    </div>
                    <ul className="space-y-3 ml-8">
                      {[
                        "Asking for money or financial assistance",
                        "Pressuring you to move conversations off-platform",
                        "Refusing to answer questions about themselves",
                        "Being overly aggressive or inappropriate",
                        "Making you feel uncomfortable or unsafe",
                        "Asking for personal information too quickly",
                        "Threatening or harassing behavior"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <AlertTriangle className="w-4 h-4 text-blue-500/70 dark:text-blue-400/50 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Reporting Users */}
              <AccordionItem value="reporting" className="border-zinc-200 dark:border-white/10">
                <AccordionTrigger className="flex items-center gap-3 px-6 py-4 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 hover:no-underline transition-colors">
                  <div className="p-2 bg-red-500/10 dark:bg-red-500/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="font-semibold">Reporting Users</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-6 px-6 pt-6 pb-8">
                  <div className="border-l-2 border-red-500/50 pl-5 py-2 bg-red-50 dark:bg-red-500/10 rounded-r-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">How to Report a User</h4>
                    </div>
                    <ul className="space-y-3 ml-8">
                      {[
                        "From Chat: Click the three-dot menu (⋯) in the chat header, then select 'Report User'",
                        "From Match Cards: Click the report button on any match suggestion card",
                        "Select a report category (Spam/Fake, Harassment, Inappropriate Content, or Other)",
                        "Provide details about why you're reporting (optional but helpful)",
                        "Submit the report - our admin team will review it promptly"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <ChevronRight className="w-4 h-4 text-red-500/70 dark:text-red-400/50 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-l-2 border-orange-500/50 pl-5 py-2 bg-orange-50 dark:bg-orange-500/10 rounded-r-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <Info className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Report Categories</h4>
                    </div>
                    <ul className="space-y-3 ml-8">
                      {[
                        "Spam/Fake Accounts: Fake profiles, bots, or promotional accounts",
                        "Harassment: Bullying, threats, or persistent unwanted contact",
                        "Inappropriate Content: Offensive, explicit, or inappropriate messages",
                        "Other Safety Concerns: Any other behavior that makes you feel unsafe"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <ChevronRight className="w-4 h-4 text-orange-500/70 dark:text-orange-400/50 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-l-2 border-blue-500/50 pl-5 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-r-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">What Happens After Reporting</h4>
                    </div>
                    <ul className="space-y-3 ml-8">
                      {[
                        "Your report is immediately logged in our system",
                        "Our admin team is notified and will review the report",
                        "Users with 3+ reports in 24 hours are automatically blocked",
                        "Admin may take action: warning, suspension, or account removal",
                        "You can report up to 5 times per hour (prevents abuse)",
                        "Reports are kept confidential - the reported user won't know who reported them"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <CheckCircle className="w-4 h-4 text-blue-500/70 dark:text-blue-400/50 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Blocking Users */}
              <AccordionItem value="blocking" className="border-zinc-200 dark:border-white/10">
                <AccordionTrigger className="flex items-center gap-3 px-6 py-4 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 hover:no-underline transition-colors">
                  <div className="p-2 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg">
                    <Users className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="font-semibold">Blocking Users</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-6 px-6 pt-6 pb-8">
                  <div className="border-l-2 border-yellow-500/50 pl-5 py-2 bg-yellow-50 dark:bg-yellow-500/10 rounded-r-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">How to Block a User</h4>
                    </div>
                    <ul className="space-y-3 ml-8">
                      {[
                        "From Chat: Click the three-dot menu (⋯) in the chat header, then select 'Block User'",
                        "From Match Cards: Click 'Block User' button on any match suggestion",
                        "Confirm the block action - this cannot be undone immediately",
                        "The user is immediately blocked and cannot contact you"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <ChevronRight className="w-4 h-4 text-yellow-500/70 dark:text-yellow-400/50 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-l-2 border-indigo-500/50 pl-5 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-r-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">What Blocking Does</h4>
                    </div>
                    <ul className="space-y-3 ml-8">
                      {[
                        "Blocks all messages from that user - you won't receive any",
                        "Hides their profile from your view completely",
                        "Prevents them from seeing your profile",
                        "Removes them from your match suggestions permanently",
                        "They cannot send you new messages or start new chats",
                        "If they try to contact you, they'll see a message that you've blocked them"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <CheckCircle className="w-4 h-4 text-indigo-500/70 dark:text-indigo-400/50 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-l-2 border-emerald-500/50 pl-5 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-r-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Unblocking Users</h4>
                    </div>
                    <ul className="space-y-3 ml-8">
                      {[
                        "Go to Settings from the main navigation",
                        "Navigate to 'Privacy' or 'Blocked Users' section",
                        "Find the user you want to unblock in the list",
                        "Click 'Unblock' next to their name",
                        "Confirm the unblock action",
                        "Note: Unblocking doesn't restore previous conversations",
                        "Be cautious about unblocking - trust your instincts"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <ChevronRight className="w-4 h-4 text-emerald-500/70 dark:text-emerald-400/50 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-l-2 border-purple-500/50 pl-5 py-2 bg-purple-50 dark:bg-purple-500/10 rounded-r-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Blocking vs. Reporting</h4>
                    </div>
                    <ul className="space-y-3 ml-8">
                      {[
                        "Blocking: Stops contact immediately but may not address the issue for others",
                        "Reporting: Brings the issue to our attention so we can take platform-wide action",
                        "You can do both: Block for immediate protection, report for platform safety",
                        "If someone is harassing you: Block them immediately, then report them",
                        "Reporting helps protect other users from the same behavior"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <Info className="w-4 h-4 text-purple-500/70 dark:text-purple-400/50 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* Safety Tips */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <Card className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-2xl rounded-3xl">
          <CardHeader className="border-b border-zinc-200 dark:border-white/10">
            <CardTitle className="text-zinc-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500 dark:text-pink-400" />
              Safety Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Always meet in public places for initial meetings",
              "Verify your potential roommate's identity",
              "Trust your instincts - stay safe",
              "Keep friends and family informed",
              "Use our secure messaging system"
            ].map((tip, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -2, scale: 1.01 }}
                className="flex items-center gap-3 p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/5 group hover:bg-white/80 dark:hover:bg-white/10 transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{tip}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Netherlands Safety Guide */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <Card className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
            <CardTitle className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Living in the Netherlands: Safety Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6">
              <p className="text-base text-zinc-600 dark:text-zinc-400 mb-2 leading-relaxed">
                A comprehensive guide to help you navigate common situations and know what to do when things go wrong.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
            {/* Housing Issues */}
            <AccordionItem value="housing" className="border-zinc-200 dark:border-white/10">
              <AccordionTrigger className="flex items-center gap-3 px-6 py-4 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 hover:no-underline transition-colors">
                <div className="p-2 bg-orange-500/10 dark:bg-orange-500/20 rounded-lg">
                  <Home className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="font-semibold">Housing Issues</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 px-6 pt-6 pb-8">
                <div className="border-l-2 border-orange-500/50 pl-5 py-2 bg-orange-50 dark:bg-orange-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Landlord Not Fixing Issues</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Document all issues with photos and written requests",
                      "Send formal written notice to landlord (keep copies)",
                      <>Contact your local municipality's housing department or <Link href="https://www.woonbond.nl/" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-4">Woonbond</Link> (tenants' union)</>,
                      <>If urgent (heating, water, safety), contact <Link href="tel:112" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-4 font-medium">emergency services (112)</Link></>,
                      <>Consider joining a tenants' union (<Link href="https://www.woonbond.nl/" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-4">Huurdersvereniging</Link>) for legal support</>
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-orange-500/70 dark:text-orange-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-blue-500/50 pl-5 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Deposit Disputes</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Take photos/videos when moving in and out",
                      "Landlord must return deposit within 14 days after move-out",
                      "Deductions must be reasonable and documented",
                      <>Contact <Link href="https://www.juridischloket.nl/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-4">Juridisch Loket</Link> (legal aid) for free advice</>,
                      <>File complaint with <Link href="https://www.huurcommissie.nl/en/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-4 font-medium">Rent Tribunal (Huurcommissie)</Link> if needed</>
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-blue-500/70 dark:text-blue-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-red-500/50 pl-5 py-2 bg-red-50 dark:bg-red-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Scale className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Illegal Rent Increases</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Rent increases are regulated and limited annually",
                      "Check if increase exceeds legal maximum (usually 3-4%)",
                      "Request written explanation from landlord",
                      <>Contact <Link href="https://www.huurcommissie.nl/en/" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline underline-offset-4">Huurcommissie</Link> to challenge illegal increases</>,
                      "You can refuse to pay illegal increases"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-red-500/70 dark:text-red-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Emergency Situations */}
            <AccordionItem value="emergency" className="border-zinc-200 dark:border-white/10">
              <AccordionTrigger className="flex items-center gap-3 px-6 py-4 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 hover:no-underline transition-colors">
                <div className="p-2 bg-red-500/10 dark:bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="font-semibold">Emergency Situations</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 px-6 pt-6 pb-8">
                <div className="border-l-2 border-red-500/50 pl-5 py-2 bg-red-50 dark:bg-red-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Phone className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">When to Call 112</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Life-threatening emergencies (medical, fire, crime in progress)",
                      "Serious accidents requiring immediate medical attention",
                      "Active break-ins or violent crimes",
                      "Fires or gas leaks",
                      "Speak clearly: location, what happened, how many people involved"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-red-500/70 dark:text-red-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-blue-500/50 pl-5 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">When to Call University Security</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Non-emergency security concerns on campus",
                      "Lost or found items",
                      "Building access issues",
                      "Minor incidents that don't require police",
                      "General safety questions or concerns"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-blue-500/70 dark:text-blue-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-zinc-500/50 pl-5 py-2 bg-zinc-50 dark:bg-white/5 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Phone className="w-5 h-5 text-zinc-600 dark:text-zinc-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Non-Emergency Police: 0900-8844</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      <>Report theft (after the fact) via <Link href="https://www.politie.nl/en/contact" target="_blank" rel="noopener noreferrer" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-4">police website</Link> or call <Link href="tel:09008844" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-4">0900-8844</Link></>,
                      <>File police reports through <Link href="https://www.politie.nl/en/report" target="_blank" rel="noopener noreferrer" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-4">online reporting</Link></>,
                      <>General inquiries: <Link href="https://www.politie.nl/en/contact" target="_blank" rel="noopener noreferrer" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-4">politie.nl</Link></>,
                      "Not for immediate emergencies"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-zinc-500/70 dark:text-zinc-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Common Scams */}
            <AccordionItem value="scams" className="border-zinc-200 dark:border-white/10">
              <AccordionTrigger className="flex items-center gap-3 px-6 py-4 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 hover:no-underline transition-colors">
                <div className="p-2 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="font-semibold">Common Scams</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 px-6 pt-6 pb-8">
                <div className="border-l-2 border-yellow-500/50 pl-5 py-2 bg-yellow-50 dark:bg-yellow-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Rental Scams</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Never pay deposit before viewing the property",
                      "Be suspicious of prices that seem too good to be true",
                      "Verify landlord identity and property ownership",
                      "Don't send money via wire transfer or cryptocurrency",
                      "Always view the property in person before signing",
                      <>Check property exists via <Link href="https://www.kadaster.nl/" target="_blank" rel="noopener noreferrer" className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 underline underline-offset-4">Kadaster</Link> (land registry)</>
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-yellow-500/70 dark:text-yellow-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-orange-500/50 pl-5 py-2 bg-orange-50 dark:bg-orange-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Users className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Fake Landlords</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Ask for ID and verify ownership documents",
                      <>Check if they're registered with <Link href="https://www.kvk.nl/" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-4">KvK</Link> (Chamber of Commerce)</>,
                      "Be wary of landlords who can't meet in person",
                      "Verify through official channels before paying anything"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-orange-500/70 dark:text-orange-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-red-500/50 pl-5 py-2 bg-red-50 dark:bg-red-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Deposit Fraud</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Deposits should be held in separate account, not landlord's personal account",
                      "Get receipt for all payments",
                      "Use bank transfer (not cash) for traceability",
                      "Maximum deposit is usually 1-2 months rent"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-red-500/70 dark:text-red-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Legal Rights */}
            <AccordionItem value="legal" className="border-zinc-200 dark:border-white/10">
              <AccordionTrigger className="flex items-center gap-3 px-6 py-4 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 hover:no-underline transition-colors">
                <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-semibold">Legal Rights</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 px-6 pt-6 pb-8">
                <div className="border-l-2 border-blue-500/50 pl-5 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Tenant Rights</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Right to privacy - landlord must give 24-48 hours notice before visits",
                      "Right to habitable living conditions",
                      "Protection against discrimination",
                      "Right to challenge unfair rent increases",
                      "Protection against illegal eviction"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-blue-500/70 dark:text-blue-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-purple-500/50 pl-5 py-2 bg-purple-50 dark:bg-purple-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Housing Regulations</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Rent control applies to properties under certain price thresholds",
                      "Minimum room size requirements exist",
                      "Maximum number of tenants per property",
                      <>Registration with municipality required (<Link href="https://www.rijksoverheid.nl/onderwerpen/persoonsgegevens/basisregistratie-personen-brp" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline underline-offset-4">Basisregistratie Personen</Link>)</>
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-purple-500/70 dark:text-purple-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-indigo-500/50 pl-5 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Complaint Procedures</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      <><Link href="https://www.huurcommissie.nl/en/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4 font-medium">Huurcommissie</Link>: Free rent assessment and dispute resolution</>,
                      <><Link href="https://www.juridischloket.nl/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4 font-medium">Juridisch Loket</Link>: Free legal advice (income-dependent)</>,
                      <>Municipality: Housing violations and registration issues (contact your local <Link href="https://www.rijksoverheid.nl/onderwerpen/gemeenten" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4 font-medium">municipality</Link>)</>,
                      <><Link href="https://www.politie.nl/en/contact" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4 font-medium">Police</Link>: Criminal matters (theft, fraud, harassment)</>
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-indigo-500/70 dark:text-indigo-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Utilities & Bills */}
            <AccordionItem value="utilities" className="border-zinc-200 dark:border-white/10">
              <AccordionTrigger className="flex items-center gap-3 px-6 py-4 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 hover:no-underline transition-colors">
                <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-semibold">Utilities & Bills</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 px-6 pt-6 pb-8">
                <div className="border-l-2 border-red-500/50 pl-5 py-2 bg-red-50 dark:bg-red-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Zap className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Utilities Cut Off</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Contact utility company immediately",
                      "Set up payment plan if you're behind on bills",
                      "Utilities cannot be cut off without proper notice",
                      <><Link href="https://www.juridischloket.nl/" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline underline-offset-4">Juridisch Loket</Link> if cut-off seems illegal</>,
                      "In winter, heating cannot be cut off for vulnerable households"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-red-500/70 dark:text-red-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-emerald-500/50 pl-5 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Billing Disputes</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Request detailed breakdown of charges",
                      "Check meter readings yourself",
                      "Dispute in writing within 30 days",
                      <>Contact <Link href="https://www.acm.nl/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-4 font-medium">ACM</Link> (Authority for Consumers & Markets) for unfair practices</>,
                      "Keep all correspondence and bills"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-emerald-500/70 dark:text-emerald-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Neighbor Disputes */}
            <AccordionItem value="neighbors" className="border-zinc-200 dark:border-white/10">
              <AccordionTrigger className="flex items-center gap-3 px-6 py-4 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 hover:no-underline transition-colors">
                <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-semibold">Neighbor Disputes</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 px-6 pt-6 pb-8">
                <div className="border-l-2 border-purple-500/50 pl-5 py-2 bg-purple-50 dark:bg-purple-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Noisy Neighbors</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "First step: Talk to neighbor politely",
                      "Check local noise regulations (usually quiet hours 22:00-07:00)",
                      "Document noise incidents (times, dates, recordings if legal)",
                      "Contact building manager or VVE (homeowners association)",
                      "Contact municipality if persistent issue",
                      "Police can be called for excessive noise during quiet hours"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-purple-500/70 dark:text-purple-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-indigo-500/50 pl-5 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Other Conflicts</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Try mediation before legal action",
                      "Contact VVE or building management",
                      "Municipality mediation services available",
                      "Document all incidents",
                      "For serious issues (harassment, threats), contact police"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-indigo-500/70 dark:text-indigo-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Healthcare Emergencies */}
            <AccordionItem value="healthcare" className="border-zinc-200 dark:border-white/10">
              <AccordionTrigger className="flex items-center gap-3 px-6 py-4 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 hover:no-underline transition-colors">
                <div className="p-2 bg-rose-500/10 dark:bg-rose-500/20 rounded-lg">
                  <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="font-semibold">Healthcare Emergencies</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 px-6 pt-6 pb-8">
                <div className="border-l-2 border-red-500/50 pl-5 py-2 bg-red-50 dark:bg-red-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">When to Go to Hospital</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "Life-threatening emergencies: Call 112",
                      "Severe injuries, chest pain, difficulty breathing",
                      "Loss of consciousness",
                      "Severe allergic reactions",
                      "Go to ER (Spoedeisende Hulp) for urgent but non-life-threatening issues"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-red-500/70 dark:text-red-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-blue-500/50 pl-5 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">GP vs Emergency</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      "GP (Huisarts): For non-urgent medical issues",
                      "Register with a GP as soon as you arrive",
                      "GP can refer you to specialists",
                      "After-hours GP service: Call your GP's number for instructions",
                      "Huisartsenpost: After-hours GP service at hospitals",
                      "112: Only for life-threatening emergencies"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-blue-500/70 dark:text-blue-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Transportation */}
            <AccordionItem value="transportation" className="border-zinc-200 dark:border-white/10">
              <AccordionTrigger className="flex items-center gap-3 px-6 py-4 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 hover:no-underline transition-colors">
                <div className="p-2 bg-sky-500/10 dark:bg-sky-500/20 rounded-lg">
                  <Bike className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <span className="font-semibold">Transportation</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 px-6 pt-6 pb-8">
                <div className="border-l-2 border-sky-500/50 pl-5 py-2 bg-sky-50 dark:bg-sky-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Bike className="w-5 h-5 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Bike Stolen</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      <>Report to police immediately: call <Link href="tel:09008844" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 underline underline-offset-4">0900-8844</Link> or <Link href="https://www.politie.nl/en/report" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 underline underline-offset-4">report online</Link></>,
                      "Get police report number for insurance claim",
                      "Check if you have bike insurance (often included in home insurance)",
                      <>Register your bike at <Link href="https://www.rijksoverheid.nl/onderwerpen/fiets/fietsregistratie" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 underline underline-offset-4">rijksoverheid.nl</Link> to help recovery</>,
                      "Always use two locks (frame + wheel) to prevent theft",
                      "Lock to fixed objects, not just the wheel"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-sky-500/70 dark:text-sky-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-indigo-500/50 pl-5 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-r-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Train className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">Public Transport Issues</h4>
                  </div>
                  <ul className="space-y-3 ml-8">
                    {[
                      <>OV-chipkaart problems: Contact <Link href="https://www.ov-chipkaart.nl/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4">OV-chipkaart customer service</Link></>,
                      <>Delays/cancellations: Check <Link href="https://www.ns.nl/en" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4">NS</Link> or <Link href="https://9292.nl/en" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4">9292</Link> for updates</>,
                      <>Lost items: Contact <Link href="https://www.verlorenofgevonden.nl/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4">lost & found (Gevonden Voorwerpen)</Link></>,
                      "Unfair fines: Appeal within 6 weeks",
                      "Student discounts: Apply for student OV-chipkaart"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <ChevronRight className="w-4 h-4 text-indigo-500/70 dark:text-indigo-400/50 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  )
}
