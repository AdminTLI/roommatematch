'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/app/providers'
import Link from 'next/link'
import { ArrowRight, Shield, Users, Heart, CheckCircle, Brain, Eye, Zap } from 'lucide-react'

export function LandingPage() {
  const { t } = useApp()

  const features = [
    {
      icon: Shield,
      title: 'Safe & Verified',
      description: 'All users are ID-verified to ensure a secure community'
    },
    {
      icon: Users,
      title: 'Smart Matching',
      description: 'AI-powered compatibility matching based on lifestyle and preferences'
    },
    {
      icon: Heart,
      title: 'Community Focused',
      description: 'Built for Dutch university students by university students'
    }
  ]

  const benefits = [
    {
      icon: Brain,
      title: '40+ Compatibility Factors',
      description: 'Science-backed algorithm analyzes lifestyle, study habits, and personality'
    },
    {
      icon: Shield,
      title: '100% Verified Profiles',
      description: 'Every student is ID-verified for your safety and peace of mind'
    },
    {
      icon: Eye,
      title: 'Transparent Matching',
      description: 'See exactly why you\'re compatible with clear explanations'
    },
    {
      icon: Zap,
      title: 'Quick & Easy',
      description: 'Get matched in days, not weeks. Complete your profile in 10 minutes'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Domu Match</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/sign-in">
              <Button variant="ghost">{t('nav.signIn')}</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>{t('nav.signUp')}</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main id="main-content">
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              From strangers to roommates
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with fellow students across Dutch universities. Safe, verified, and designed to help you find your ideal living situation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Domu Match?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We combine technology with safety to create the best roommate matching experience for Dutch university students.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Why <span className="text-purple-200">Domu Match</span> Works
              </h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Our science-backed approach helps you find roommates as compatible as your best friends
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-white/10 border-white/20 text-center">
                  <CardContent className="pt-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 opacity-90" />
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-sm opacity-90">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-50 dark:bg-gray-800 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to go from <span className="text-brand-primary">strangers to roommates</span>?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Get started today and discover who you're compatible with. Our science-backed matching helps you find roommates as compatible as your best friends.
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Journey Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-6 w-6" />
                <span className="text-xl font-bold">Domu Match</span>
              </div>
              <p className="text-gray-400">
                From strangers to roommates - the safest way in the Netherlands.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/safety" className="hover:text-white transition-colors">Safety</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/gdpr" className="hover:text-white transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Domu Match. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
