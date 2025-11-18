'use client'

import Link from 'next/link'
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
  Train
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface SafetyContentProps {
  universitySecurityPhone?: string | null
  universityName?: string | null
}

export function SafetyContent({ universitySecurityPhone, universityName }: SafetyContentProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground">Safety & Security</h1>
        <p className="text-lg text-gray-600 dark:text-muted-foreground mt-1">Stay safe with our comprehensive safety features</p>
      </div>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-600" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h4 className="font-medium text-red-900 dark:text-red-200">Emergency Services</h4>
              <p className="text-sm text-red-700 dark:text-red-300">112 (Police, Fire, Ambulance)</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200">University Security</h4>
              {universitySecurityPhone ? (
                <>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{universitySecurityPhone}</p>
                  {universityName && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{universityName}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Contact your university's security office
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Verification System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">All users are verified through university email and ID</p>
            <Badge variant="secondary">Active</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Background Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Optional background verification available</p>
            <Button size="sm">Learn More</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-600" />
              Privacy Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Your personal information is secure and private</p>
            <Badge variant="secondary">Protected</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Safety Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            "Always meet in public places for initial meetings",
            "Verify your potential roommate's identity",
            "Trust your instincts - if something feels wrong, it probably is",
            "Keep friends and family informed about your plans",
            "Use our secure messaging system for communication"
          ].map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-muted-foreground">{tip}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Netherlands Safety Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Living in the Netherlands: Safety Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-gray-700 dark:text-muted-foreground mb-8 leading-relaxed">
            A comprehensive guide to help you navigate common situations and know what to do when things go wrong.
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            {/* Housing Issues */}
            <AccordionItem value="housing">
              <AccordionTrigger className="flex items-center gap-2">
                <Home className="w-5 h-5 text-orange-600" />
                <span className="font-semibold">Housing Issues</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-6 pb-4">
                <div className="border-l-4 border-orange-500 pl-4 py-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Landlord Not Fixing Issues</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>Document all issues with photos and written requests</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>Send formal written notice to landlord (keep copies)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>Contact your local municipality's housing department or <Link href="https://www.woonbond.nl/" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">Woonbond</Link> (tenants' union)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>If urgent (heating, water, safety), contact <Link href="tel:112" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">emergency services (112)</Link></span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>Consider joining a tenants' union (<Link href="https://www.woonbond.nl/" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">Huurdersvereniging</Link>) for legal support</span>
                    </li>
                  </ul>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Deposit Disputes</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Take photos/videos when moving in and out</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Landlord must return deposit within 14 days after move-out</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Deductions must be reasonable and documented</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Contact <Link href="https://www.juridischloket.nl/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Juridisch Loket</Link> (legal aid) for free advice</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>File complaint with <Link href="https://www.huurcommissie.nl/en/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Rent Tribunal (Huurcommissie)</Link> if needed</span>
                    </li>
                  </ul>
                </div>
                <div className="border-l-4 border-red-500 pl-4 py-3 bg-red-50/50 dark:bg-red-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Scale className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Illegal Rent Increases</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Rent increases are regulated and limited annually</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Check if increase exceeds legal maximum (usually 3-4%)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Request written explanation from landlord</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Contact <Link href="https://www.huurcommissie.nl/en/" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 hover:underline font-medium">Huurcommissie</Link> to challenge illegal increases</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>You can refuse to pay illegal increases</span>
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Emergency Situations */}
            <AccordionItem value="emergency">
              <AccordionTrigger className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-semibold">Emergency Situations</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-6 pb-4">
                <div className="border-l-4 border-red-600 pl-4 py-3 bg-red-50/50 dark:bg-red-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Phone className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">When to Call 112</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Life-threatening emergencies (medical, fire, crime in progress)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Serious accidents requiring immediate medical attention</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Active break-ins or violent crimes</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Fires or gas leaks</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Speak clearly: location, what happened, how many people involved</span>
                    </li>
                  </ul>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">When to Call University Security</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Non-emergency security concerns on campus</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Lost or found items</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Building access issues</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Minor incidents that don't require police</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>General safety questions or concerns</span>
                    </li>
                  </ul>
                </div>
                <div className="border-l-4 border-gray-500 pl-4 py-3 bg-gray-50/50 dark:bg-gray-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Non-Emergency Police: 0900-8844</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>Report theft (after the fact) via <Link href="https://www.politie.nl/en/contact" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:underline font-medium">police website</Link> or call <Link href="tel:09008844" className="text-gray-600 dark:text-gray-400 hover:underline font-medium">0900-8844</Link></span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>File police reports through <Link href="https://www.politie.nl/en/report" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:underline font-medium">police online reporting</Link></span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>General inquiries: <Link href="https://www.politie.nl/en/contact" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:underline font-medium">politie.nl</Link></span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>Not for immediate emergencies</span>
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Common Scams */}
            <AccordionItem value="scams">
              <AccordionTrigger className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold">Common Scams</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-6 pb-4">
                <div className="border-l-4 border-yellow-500 pl-4 py-3 bg-yellow-50/50 dark:bg-yellow-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Rental Scams</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>Never pay deposit before viewing the property</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>Be suspicious of prices that seem too good to be true</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>Verify landlord identity and property ownership</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>Don't send money via wire transfer or cryptocurrency</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>Always view the property in person before signing</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>Check property exists via <Link href="https://www.kadaster.nl/" target="_blank" rel="noopener noreferrer" className="text-yellow-600 dark:text-yellow-400 hover:underline font-medium">Kadaster</Link> (land registry)</span>
                    </li>
                  </ul>
                </div>
                <div className="border-l-4 border-orange-500 pl-4 py-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Users className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Fake Landlords</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>Ask for ID and verify ownership documents</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>Check if they're registered with <Link href="https://www.kvk.nl/" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">KvK</Link> (Chamber of Commerce)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>Be wary of landlords who can't meet in person</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>Verify through official channels before paying anything</span>
                    </li>
                  </ul>
                </div>
                <div className="border-l-4 border-red-500 pl-4 py-3 bg-red-50/50 dark:bg-red-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Deposit Fraud</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Deposits should be held in separate account, not landlord's personal account</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Get receipt for all payments</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Use bank transfer (not cash) for traceability</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Maximum deposit is usually 1-2 months rent</span>
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Legal Rights */}
            <AccordionItem value="legal">
              <AccordionTrigger className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Legal Rights</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-6 pb-4">
                <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Tenant Rights</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Right to privacy - landlord must give 24-48 hours notice before visits</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Right to habitable living conditions</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Protection against discrimination</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Right to challenge unfair rent increases</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Protection against illegal eviction</span>
                    </li>
                  </ul>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Housing Regulations</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Rent control applies to properties under certain price thresholds</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Minimum room size requirements exist</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Maximum number of tenants per property</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Registration with municipality required (<Link href="https://www.rijksoverheid.nl/onderwerpen/persoonsgegevens/basisregistratie-personen-brp" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">Basisregistratie Personen</Link>)</span>
                    </li>
                  </ul>
                </div>
                <div className="border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Complaint Procedures</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span><Link href="https://www.huurcommissie.nl/en/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Huurcommissie</Link>: Free rent assessment and dispute resolution</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span><Link href="https://www.juridischloket.nl/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Juridisch Loket</Link>: Free legal advice (income-dependent)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span>Municipality: Housing violations and registration issues (contact your local <Link href="https://www.rijksoverheid.nl/onderwerpen/gemeenten" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">municipality</Link>)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span><Link href="https://www.politie.nl/en/contact" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Police</Link>: Criminal matters (theft, fraud, harassment)</span>
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Utilities & Bills */}
            <AccordionItem value="utilities">
              <AccordionTrigger className="flex items-center gap-2">
                <Home className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Utilities & Bills</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-6 pb-4">
                <div className="border-l-4 border-red-500 pl-4 py-3 bg-red-50/50 dark:bg-red-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Zap className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Utilities Cut Off</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Contact utility company immediately</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Set up payment plan if you're behind on bills</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Utilities cannot be cut off without proper notice</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Contact <Link href="https://www.juridischloket.nl/" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 hover:underline font-medium">Juridisch Loket</Link> if cut-off seems illegal</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>In winter, heating cannot be cut off for vulnerable households</span>
                    </li>
                  </ul>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-50/50 dark:bg-green-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Billing Disputes</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Request detailed breakdown of charges</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Check meter readings yourself</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Dispute in writing within 30 days</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Contact <Link href="https://www.acm.nl/" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline font-medium">ACM</Link> (Authority for Consumers & Markets) for unfair practices</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Keep all correspondence and bills</span>
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Neighbor Disputes */}
            <AccordionItem value="neighbors">
              <AccordionTrigger className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">Neighbor Disputes</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-6 pb-4">
                <div className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Noisy Neighbors</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>First step: Talk to neighbor politely</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Check local noise regulations (usually quiet hours 22:00-07:00)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Document noise incidents (times, dates, recordings if legal)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Contact building manager or VVE (homeowners association)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Contact municipality if persistent issue</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Police can be called for excessive noise during quiet hours</span>
                    </li>
                  </ul>
                </div>
                <div className="border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Other Conflicts</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span>Try mediation before legal action</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span>Contact VVE or building management</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span>Municipality mediation services available</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span>Document all incidents</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span>For serious issues (harassment, threats), contact police</span>
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Healthcare Emergencies */}
            <AccordionItem value="healthcare">
              <AccordionTrigger className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span className="font-semibold">Healthcare Emergencies</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-6 pb-4">
                <div className="border-l-4 border-red-600 pl-4 py-3 bg-red-50/50 dark:bg-red-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">When to Go to Hospital</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Life-threatening emergencies: Call 112</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Severe injuries, chest pain, difficulty breathing</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Loss of consciousness</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Severe allergic reactions</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Go to ER (Spoedeisende Hulp) for urgent but non-life-threatening issues</span>
                    </li>
                  </ul>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">GP vs Emergency</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>GP (Huisarts): For non-urgent medical issues</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Register with a GP as soon as you arrive</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>GP can refer you to specialists</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>After-hours GP service: Call your GP's number for instructions</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Huisartsenpost: After-hours GP service at hospitals</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>112: Only for life-threatening emergencies</span>
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Transportation */}
            <AccordionItem value="transportation">
              <AccordionTrigger className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Transportation</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-6 pb-4">
                <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Bike className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Bike Stolen</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Report to police immediately: call <Link href="tel:09008844" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">0900-8844</Link> or <Link href="https://www.politie.nl/en/report" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">report online</Link></span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Get police report number for insurance claim</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Check if you have bike insurance (often included in home insurance)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Register your bike at <Link href="https://www.rijksoverheid.nl/onderwerpen/fiets/fietsregistratie" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">rijksoverheid.nl</Link> to help recovery</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Always use two locks (frame + wheel) to prevent theft</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Lock to fixed objects, not just the wheel</span>
                    </li>
                  </ul>
                </div>
                <div className="border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-r-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Train className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-base">Public Transport Issues</h4>
                  </div>
                  <ul className="space-y-2.5 ml-8">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span>OV-chipkaart problems: Contact <Link href="https://www.ov-chipkaart.nl/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">OV-chipkaart customer service</Link></span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span>Delays/cancellations: Check <Link href="https://www.ns.nl/en" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">NS</Link> or <Link href="https://9292.nl/en" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">9292</Link> for updates</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span>Lost items: Contact <Link href="https://www.verlorenofgevonden.nl/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">lost & found (Gevonden Voorwerpen)</Link></span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span>Unfair fines: Appeal within 6 weeks</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span>Student discounts: Apply for student OV-chipkaart</span>
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
