'use client'

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
  Info
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
        <h1 className="text-3xl font-bold text-gray-900">Safety & Security</h1>
        <p className="text-lg text-gray-600 mt-1">Stay safe with our comprehensive safety features</p>
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
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900">Emergency Services</h4>
              <p className="text-sm text-red-700">112 (Police, Fire, Ambulance)</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">University Security</h4>
              {universitySecurityPhone ? (
                <>
                  <p className="text-sm text-blue-700">{universitySecurityPhone}</p>
                  {universityName && (
                    <p className="text-xs text-blue-600 mt-1">{universityName}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-blue-700">
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
            <p className="text-sm text-gray-600 mb-4">All users are verified through university email and ID</p>
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
              <p className="text-sm text-gray-600">{tip}</p>
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
          <p className="text-sm text-gray-600 mb-6">
            A comprehensive guide to help you navigate common situations and know what to do when things go wrong.
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            {/* Housing Issues */}
            <AccordionItem value="housing">
              <AccordionTrigger className="flex items-center gap-2">
                <Home className="w-5 h-5 text-orange-600" />
                <span className="font-semibold">Housing Issues</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Landlord Not Fixing Issues</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Document all issues with photos and written requests</li>
                    <li>Send formal written notice to landlord (keep copies)</li>
                    <li>Contact your local municipality's housing department (Woonbond)</li>
                    <li>If urgent (heating, water, safety), contact emergency services</li>
                    <li>Consider joining a tenants' union (Huurdersvereniging) for legal support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Deposit Disputes</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Take photos/videos when moving in and out</li>
                    <li>Landlord must return deposit within 14 days after move-out</li>
                    <li>Deductions must be reasonable and documented</li>
                    <li>Contact Juridisch Loket (legal aid) for free advice</li>
                    <li>File complaint with Rent Tribunal (Huurcommissie) if needed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Illegal Rent Increases</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Rent increases are regulated and limited annually</li>
                    <li>Check if increase exceeds legal maximum (usually 3-4%)</li>
                    <li>Request written explanation from landlord</li>
                    <li>Contact Huurcommissie to challenge illegal increases</li>
                    <li>You can refuse to pay illegal increases</li>
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
              <AccordionContent className="space-y-4 pt-2">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">When to Call 112</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Life-threatening emergencies (medical, fire, crime in progress)</li>
                    <li>Serious accidents requiring immediate medical attention</li>
                    <li>Active break-ins or violent crimes</li>
                    <li>Fires or gas leaks</li>
                    <li>Speak clearly: location, what happened, how many people involved</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">When to Call University Security</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Non-emergency security concerns on campus</li>
                    <li>Lost or found items</li>
                    <li>Building access issues</li>
                    <li>Minor incidents that don't require police</li>
                    <li>General safety questions or concerns</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Non-Emergency Police: 0900-8844</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Report theft (after the fact)</li>
                    <li>File police reports</li>
                    <li>General inquiries</li>
                    <li>Not for immediate emergencies</li>
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
              <AccordionContent className="space-y-4 pt-2">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Rental Scams</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Never pay deposit before viewing the property</li>
                    <li>Be suspicious of prices that seem too good to be true</li>
                    <li>Verify landlord identity and property ownership</li>
                    <li>Don't send money via wire transfer or cryptocurrency</li>
                    <li>Always view the property in person before signing</li>
                    <li>Check property exists via Kadaster (land registry)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Fake Landlords</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Ask for ID and verify ownership documents</li>
                    <li>Check if they're registered with KvK (Chamber of Commerce)</li>
                    <li>Be wary of landlords who can't meet in person</li>
                    <li>Verify through official channels before paying anything</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Deposit Fraud</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Deposits should be held in separate account, not landlord's personal account</li>
                    <li>Get receipt for all payments</li>
                    <li>Use bank transfer (not cash) for traceability</li>
                    <li>Maximum deposit is usually 1-2 months rent</li>
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
              <AccordionContent className="space-y-4 pt-2">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tenant Rights</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Right to privacy - landlord must give 24-48 hours notice before visits</li>
                    <li>Right to habitable living conditions</li>
                    <li>Protection against discrimination</li>
                    <li>Right to challenge unfair rent increases</li>
                    <li>Protection against illegal eviction</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Housing Regulations</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Rent control applies to properties under certain price thresholds</li>
                    <li>Minimum room size requirements exist</li>
                    <li>Maximum number of tenants per property</li>
                    <li>Registration with municipality required (Basisregistratie Personen)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Complaint Procedures</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Huurcommissie: Free rent assessment and dispute resolution</li>
                    <li>Juridisch Loket: Free legal advice (income-dependent)</li>
                    <li>Municipality: Housing violations and registration issues</li>
                    <li>Police: Criminal matters (theft, fraud, harassment)</li>
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
              <AccordionContent className="space-y-4 pt-2">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Utilities Cut Off</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Contact utility company immediately</li>
                    <li>Set up payment plan if you're behind on bills</li>
                    <li>Utilities cannot be cut off without proper notice</li>
                    <li>Contact Juridisch Loket if cut-off seems illegal</li>
                    <li>In winter, heating cannot be cut off for vulnerable households</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Billing Disputes</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Request detailed breakdown of charges</li>
                    <li>Check meter readings yourself</li>
                    <li>Dispute in writing within 30 days</li>
                    <li>Contact ACM (Authority for Consumers & Markets) for unfair practices</li>
                    <li>Keep all correspondence and bills</li>
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
              <AccordionContent className="space-y-4 pt-2">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Noisy Neighbors</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>First step: Talk to neighbor politely</li>
                    <li>Check local noise regulations (usually quiet hours 22:00-07:00)</li>
                    <li>Document noise incidents (times, dates, recordings if legal)</li>
                    <li>Contact building manager or VVE (homeowners association)</li>
                    <li>Contact municipality if persistent issue</li>
                    <li>Police can be called for excessive noise during quiet hours</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Other Conflicts</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Try mediation before legal action</li>
                    <li>Contact VVE or building management</li>
                    <li>Municipality mediation services available</li>
                    <li>Document all incidents</li>
                    <li>For serious issues (harassment, threats), contact police</li>
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
              <AccordionContent className="space-y-4 pt-2">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">When to Go to Hospital</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Life-threatening emergencies: Call 112</li>
                    <li>Severe injuries, chest pain, difficulty breathing</li>
                    <li>Loss of consciousness</li>
                    <li>Severe allergic reactions</li>
                    <li>Go to ER (Spoedeisende Hulp) for urgent but non-life-threatening issues</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">GP vs Emergency</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>GP (Huisarts): For non-urgent medical issues</li>
                    <li>Register with a GP as soon as you arrive</li>
                    <li>GP can refer you to specialists</li>
                    <li>After-hours GP service: Call your GP's number for instructions</li>
                    <li>Huisartsenpost: After-hours GP service at hospitals</li>
                    <li>112: Only for life-threatening emergencies</li>
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
              <AccordionContent className="space-y-4 pt-2">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Bike Stolen</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Report to police immediately (0900-8844 or online)</li>
                    <li>Get police report number for insurance claim</li>
                    <li>Check if you have bike insurance (often included in home insurance)</li>
                    <li>Register your bike at rijksoverheid.nl to help recovery</li>
                    <li>Always use two locks (frame + wheel) to prevent theft</li>
                    <li>Lock to fixed objects, not just the wheel</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Public Transport Issues</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>OV-chipkaart problems: Contact customer service</li>
                    <li>Delays/cancellations: Check NS/OV app for updates</li>
                    <li>Lost items: Contact lost & found (Gevonden Voorwerpen)</li>
                    <li>Unfair fines: Appeal within 6 weeks</li>
                    <li>Student discounts: Apply for student OV-chipkaart</li>
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
