'use client'

import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'

export default function PrivacyPage() {
  const { locale } = useApp()
  const lastUpdated = 'March 2026'

  return (
    <MarketingSubpageWrapperLight>
      <Section className="py-12 md:py-16 lg:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-6 sm:p-10">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-slate-600 mb-8">
                Last updated: {lastUpdated}
              </p>

              <div className="mb-10 rounded-xl border border-amber-400/40 bg-amber-50 p-4">
                <p className="text-amber-900 font-semibold mb-1">Beta Notice</p>
                <p className="text-amber-900/90 leading-relaxed">
                  You are using a pre-release (beta) version of Domu Match. This means features may change, data
                  may be reset, and additional data collection (such as bug reports and session logs) may be done
                  to help us improve the product. This policy explains all of that clearly below.
                </p>
              </div>

              <p className="text-slate-700 mb-8 leading-relaxed">
                Domu Match is designed for students and young professionals who want to find compatible roommates.
                This Privacy Policy explains in clear language how we use your data and your rights under the GDPR,
                the Dutch GDPR Implementation Act (UAVG), and EU AI transparency obligations.
              </p>

              {/* 1. Privacy at a Glance */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  1. Privacy at a Glance
                </h2>
                <p className="text-slate-700 mb-4">
                  Below is a quick summary. The full detail follows in each numbered section.
                </p>
                <div className="overflow-x-auto rounded-lg border border-slate-200 overflow-hidden bg-white/60">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Topic</th>
                        <th className="px-4 py-3 font-semibold">Short Answer</th>
                        <th className="px-4 py-3 font-semibold">Section</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="px-4 py-3 align-top">Who controls your data?</td>
                        <td className="px-4 py-3 align-top">
                          DMS Enterprise (eenmanszaak), trading as Domu Match (handelsnaam), Netherlands.
                        </td>
                        <td className="px-4 py-3 align-top">§ Who We Are</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">What do we collect?</td>
                        <td className="px-4 py-3 align-top">
                          Account info, lifestyle answers, ID verification status, messages, beta feedback & logs.
                        </td>
                        <td className="px-4 py-3 align-top">§ Data We Collect</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Why?</td>
                        <td className="px-4 py-3 align-top">
                          To match you, keep the platform safe, run the beta, and improve the product.
                        </td>
                        <td className="px-4 py-3 align-top">§ Purposes & Legal Bases</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Legal basis (GDPR)</td>
                        <td className="px-4 py-3 align-top">
                          Contract, consent (lifestyle & beta feedback), legitimate interest (security).
                        </td>
                        <td className="px-4 py-3 align-top">§ Purposes & Legal Bases</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Do we store your ID?</td>
                        <td className="px-4 py-3 align-top">
                          No. Persona processes it; we only receive a verification result.
                        </td>
                        <td className="px-4 py-3 align-top">§ ID Verification</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Who else sees your data?</td>
                        <td className="px-4 py-3 align-top">
                          Persona, EU cloud providers, anonymized stats to Pilot Universities only.
                        </td>
                        <td className="px-4 py-3 align-top">§ Third-Party Disclosures</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">How long do we keep it?</td>
                        <td className="px-4 py-3 align-top">
                          While your account is active; 1 year inactivity triggers deletion.
                        </td>
                        <td className="px-4 py-3 align-top">§ Data Retention</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">What happens after beta?</td>
                        <td className="px-4 py-3 align-top">
                          We will notify you at least 30 days in advance of any data wipe or migration.
                        </td>
                        <td className="px-4 py-3 align-top">§ Beta-Specific Data</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Your rights?</td>
                        <td className="px-4 py-3 align-top">
                          Access, rectify, delete, port, withdraw consent, object.
                        </td>
                        <td className="px-4 py-3 align-top">§ Your Rights</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Data breach?</td>
                        <td className="px-4 py-3 align-top">
                          We notify affected users and the Dutch DPA within 72 hours of confirmed breach.
                        </td>
                        <td className="px-4 py-3 align-top">§ Security</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 2. Who We Are and Scope */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  2. Who We Are and Scope
                </h2>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Controller</h3>
                <p className="text-slate-700 mb-4">
                  The controller responsible for your personal data is Domu Match, a trade name (handelsnaam)
                  registered to DMS Enterprise (eenmanszaak) in the Netherlands with KVK number 97573337. Contact
                  details are in Section 13.
                </p>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Who this policy applies to</h3>
                <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                  <li>Students (17+) and young professionals using Domu Match to find roommates.</li>
                  <li>Visitors to our website or app.</li>
                  <li>Beta testers who registered via domumatch.com/beta or an invite link.</li>
                  <li>Users connected through Pilot Universities.</li>
                </ul>
              </section>

              {/* 3. Data We Collect */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  3. Data We Collect
                </h2>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">3.1 Account and Profile Data</h3>
                <ul className="list-disc pl-6 text-slate-700 mb-6 space-y-1">
                  <li>Name, email address, and password.</li>
                  <li>University name, study programme, year of study, general schedule.</li>
                  <li>Housing preferences (location, budget, room type, move-in date).</li>
                  <li>Optional Profile Picture</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  3.2 Lifestyle and Behavioural Data (Harmony Questionnaire)
                </h3>
                <p className="text-slate-700 mb-3">
                  To improve roommate matching, we offer a lifestyle questionnaire covering:
                </p>
                <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                  <li>Daily rhythms (wake/sleep times, noise tolerance).</li>
                  <li>Tidiness and use of shared spaces.</li>
                  <li>Social habits (visitors, parties, introvert/extrovert preferences).</li>
                  <li>Study/social balance.</li>
                </ul>
                <p className="text-slate-700 mb-6">
                  <span className="font-semibold">Sensitive data:</span> Some answers may indirectly hint and/or reveal
                  data about topics such as your health, religion and sexual orientation. We only process this data
                  with your explicit consent.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  3.3 Beta-Specific Data (additional to normal use)
                </h3>
                <p className="text-slate-700 mb-3">
                  This section applies only during the beta period and would not apply once the full product
                  launches.
                </p>
                <ul className="list-disc pl-6 text-slate-700 mb-6 space-y-1">
                  <li>Crash reports and error logs (automatically captured when something breaks).</li>
                  <li>
                    Session recordings or heatmaps (if enabled) - you will be informed at sign-up and can opt out
                    in Settings.
                  </li>
                  <li>In-app feedback submissions and bug reports you submit voluntarily.</li>
                  <li>Usability survey responses.</li>
                  <li>
                    Feature interaction logs (e.g., which screens you visit, how long you spend on steps).
                  </li>
                </ul>
                <p className="text-slate-700 mb-6">
                  We use this data solely to fix bugs, improve the product, and to inform us on design decisions.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-2">3.4 ID Verification (Persona)</h3>
                <ul className="list-disc pl-6 text-slate-700 mb-6 space-y-1">
                  <li>Persona processes your government ID and a selfie/liveness check.</li>
                  <li>Domu Match does not store raw ID images or biometric templates.</li>
                  <li>
                    We receive only: verification status (verified / not verified), full name, date of birth, and
                    issuing country.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-900 mb-2">3.5 Communication and Chat</h3>
                <ul className="list-disc pl-6 text-slate-700 mb-6 space-y-1">
                  <li>Messages you send and receive, plus metadata (timestamps, read status).</li>
                  <li>Your real identity is hidden from other users by default; you control when to reveal it.</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-900 mb-2">3.6 Usage and Technical Data</h3>
                <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                  <li>Device type, OS, browser type, IP address, timestamps, pages viewed.</li>
                  <li>
                    Approximate location (country/region) derived from IP - used for security and anonymized
                    analytics only.
                  </li>
                </ul>
              </section>

              {/* 4. Purposes and Legal Bases */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  4. Purposes and Legal Bases (Art. 6 GDPR)
                </h2>
                <div className="overflow-x-auto rounded-lg border border-slate-200 overflow-hidden bg-white/60">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Purpose</th>
                        <th className="px-4 py-3 font-semibold">Examples</th>
                        <th className="px-4 py-3 font-semibold">Legal Basis (GDPR Art. 6)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="px-4 py-3 align-top">Account &amp; matching</td>
                        <td className="px-4 py-3 align-top">
                          Create account, suggesting roommates, enabling chat
                        </td>
                        <td className="px-4 py-3 align-top">Art. 6(1)(b) - Contract</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Deep lifestyle profiling</td>
                        <td className="px-4 py-3 align-top">
                          200-questionnaire - Harmony/Context scores
                        </td>
                        <td className="px-4 py-3 align-top">Art. 6(1)(a) + Art. 9(2)(a) - Consent</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Beta testing &amp; product improvement</td>
                        <td className="px-4 py-3 align-top">
                          Bug logs, crash reports, session data, feedback forms, usability surveys
                        </td>
                        <td className="px-4 py-3 align-top">Art. 6(1)(a) - Consent (at sign-up)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Platform security &amp; fraud prevention</td>
                        <td className="px-4 py-3 align-top">
                          ID verification, abuse reporting, incident logs
                        </td>
                        <td className="px-4 py-3 align-top">Art. 6(1)(f) - Legitimate interest</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">University analytics</td>
                        <td className="px-4 py-3 align-top">
                          Anonymized housing/matching statistics for Pilot Universities
                        </td>
                        <td className="px-4 py-3 align-top">
                          Anonymized = not personal data; pre-anonymization steps: legitimate interest
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Legal compliance</td>
                        <td className="px-4 py-3 align-top">
                          Responding to lawful authority requests, record-keeping obligations
                        </td>
                        <td className="px-4 py-3 align-top">Art. 6(1)(c) - Legal obligation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-slate-700 mt-4">
                  You can withdraw consent for the lifestyle questionnaire or beta data collection at any time in
                  Settings. We will stop using those data for new purposes and delete or anonymize them within a
                  reasonable period.
                </p>
              </section>

              {/* 5. Beta-Specific Data */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  5. Beta-Specific Data: What Happens After Beta
                </h2>
                <p className="text-slate-700 mb-4">
                  This is one of the most important sections for beta testers to understand.
                </p>
                <div className="overflow-x-auto rounded-lg border border-slate-200 overflow-hidden bg-white/60">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Event</th>
                        <th className="px-4 py-3 font-semibold">What happens to your data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="px-4 py-3 align-top">Beta ends, product launches</td>
                        <td className="px-4 py-3 align-top">
                          Your account and profile data carry over unless you delete them. Beta-specific logs and
                          session recordings are deleted within 90 days of launch.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Beta is discontinued (no launch)</td>
                        <td className="px-4 py-3 align-top">
                          We will give you at least 30 days’ notice. You may export your questionnaire data. All
                          personal data will be deleted or anonymized within 60 days of shutdown.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Data reset during beta</td>
                        <td className="px-4 py-3 align-top">
                          We may reset certain test data (e.g., matches, scores) for technical reasons. We will
                          notify you in-app at least 7 days in advance where possible.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 6. Automated Decision-Making and Profiling */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  6. Automated Decision-Making and Profiling (Art. 22 GDPR)
                </h2>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">How the matching algorithm works</h3>
                <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                  <li>Harmony score - based on lifestyle answers.</li>
                  <li>Context score - based on academic/practical context.</li>
                  <li>These combine into a compatibility score used to rank suggested profiles.</li>
                </ul>
                <p className="text-slate-700 mb-4">
                  <span className="font-semibold">No binding decisions:</span> The algorithm only suggests matches.
                  You always choose who to contact and live with. No automated system produces legal or similarly
                  significant effects about you.
                </p>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">EU AI Act transparency</h3>
                <p className="text-slate-700">
                  In line with EU AI Act transparency obligations, we disclose that we use automated systems for
                  matching, explain the main factors, and regularly review the system to reduce unfair bias. Contact
                  us if you believe the system treats you unfairly.
                </p>
              </section>

              {/* 7. Third-Party Disclosures */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  7. Third-Party Disclosures
                </h2>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Persona (ID Verification)</h3>
                <ul className="list-disc pl-6 text-slate-700 mb-6 space-y-1">
                  <li>Processes your government ID and selfie/video as our data processor.</li>
                  <li>We receive only the verification outcome and limited attributes.</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-900 mb-2">Cloud Hosting Providers</h3>
                <ul className="list-disc pl-6 text-slate-700 mb-6 space-y-1">
                  <li>We use EU-based servers (e.g., AWS/Azure/Google Cloud EU regions) under data processing agreements.</li>
                  <li>Providers may not use your data for their own marketing.</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Beta Tooling (e.g., crash reporting, session recording tools)
                </h3>
                <ul className="list-disc pl-6 text-slate-700 mb-6 space-y-1">
                  <li>
                    Where third-party tools are used for beta monitoring (e.g., Sentry, or similar), these act as
                    data processors under GDPR-compliant agreements.
                  </li>
                  <li>We will list active beta tools in our Cookie/Tracking Notice.</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-900 mb-2">Pilot Universities</h3>
                <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                  <li>Receive only anonymized and aggregated data (cannot identify you).</li>
                  <li>Any research needing more detailed data requires your explicit consent.</li>
                </ul>
              </section>

              <p className="text-slate-900 font-semibold mb-6">
                We do not sell your personal data to any third party, ever.
              </p>

              {/* 8. Data Retention */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  8. Data Retention
                </h2>
                <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                  <li>Most personal data: kept while your account is active.</li>
                  <li>Inactivity: accounts inactive for 1 year are deleted or anonymized (Dutch DPA guidance).</li>
                  <li>
                    Lifestyle questionnaire data: deleted/anonymized when you withdraw consent or delete your
                    account.
                  </li>
                  <li>
                    Beta logs and session data: deleted within 90 days of beta end or your account deletion,
                    whichever comes first.
                  </li>
                  <li>Security/incident logs: may be kept longer where required by law or for ongoing investigations.</li>
                </ul>
              </section>

              {/* 9. Data Breach Notification */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  9. Data Breach Notification
                </h2>
                <p className="text-slate-700 mb-3">
                  In the event of a personal data breach that is likely to result in a risk to your rights and
                  freedoms, we will:
                </p>
                <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                  <li>Notify the Autoriteit Persoonsgegevens (Dutch DPA) within 72 hours of becoming aware.</li>
                  <li>
                    Notify affected users without undue delay if the breach is likely to result in a high risk to
                    you personally.
                  </li>
                  <li>Describe the nature of the breach, data affected, likely consequences, and measures taken.</li>
                </ul>
              </section>

              {/* 10. Your Rights */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  10. Your Rights
                </h2>
                <p className="text-slate-700 mb-4">
                  Under the GDPR and UAVG, you have the following rights, typically exercisable through Settings or
                  by contacting us:
                </p>
                <div className="overflow-x-auto rounded-lg border border-slate-200 overflow-hidden bg-white/60">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Right</th>
                        <th className="px-4 py-3 font-semibold">What it means</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="px-4 py-3 align-top">Access</td>
                        <td className="px-4 py-3 align-top">Request a copy of all data we hold about you.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Rectification</td>
                        <td className="px-4 py-3 align-top">Correct inaccurate or incomplete data.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Erasure</td>
                        <td className="px-4 py-3 align-top">
                          Request deletion of your account and personal data (subject to legal exceptions).
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Withdraw consent</td>
                        <td className="px-4 py-3 align-top">
                          Withdraw consent for lifestyle questionnaire or beta data collection at any time.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Data portability</td>
                        <td className="px-4 py-3 align-top">
                          Download your questionnaire responses and key data in a portable format.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Object</td>
                        <td className="px-4 py-3 align-top">Object to processing based on legitimate interest.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">Restriction</td>
                        <td className="px-4 py-3 align-top">
                          Ask us to temporarily restrict processing while we review a request.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-slate-700 mt-4">
                  We may verify your identity before acting on a request. We aim to respond within one month as
                  required by law.
                </p>
                <p className="text-slate-700 mt-3">
                  You also have the right to lodge a complaint with the Autoriteit Persoonsgegevens:{' '}
                  <a href="https://autoriteitpersoonsgegevens.nl" className="text-violet-600 underline">
                    https://autoriteitpersoonsgegevens.nl
                  </a>
                </p>
              </section>

              {/* 11. Minors */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  11. Minors (Age 17–18)
                </h2>
                <p className="text-slate-700">
                  Domu Match is open to users aged 17 and above. Users under 18 are permitted, but we encourage
                  parents or guardians to review this policy. If you are under 18 and based in the Netherlands, you
                  may use our platform without parental consent under Dutch law, as Domu Match is a practical
                  housing service. We do not use data of under-18 users for any purpose other than operating the
                  service.
                </p>
              </section>

              {/* 12. Security Measures */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  12. Security Measures
                </h2>
                <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                  <li>Encryption in transit (TLS/HTTPS) and at rest for all databases and storage.</li>
                  <li>
                    Strict access controls - only authorized personnel with genuine need can access personal data.
                  </li>
                  <li>Regular updates, monitoring, and incident response procedures.</li>
                  <li>Security by design and by default, in line with the 2026 Cybersecurity Act (Cbw).</li>
                </ul>
                <p className="text-slate-700">
                  No system is perfectly secure. We will notify you promptly if a breach affects you (see Section
                  9).
                </p>
              </section>

              {/* 13. Contact and Complaints */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  13. Contact and Complaints
                </h2>
                <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                  <li>Privacy contact / DPO: domumatch@gmail.com</li>
                  <li>Website: domumatch.com/contact</li>
                </ul>
                <p className="text-slate-700">
                  If you would like to, you may contact the Autoriteit Persoonsgegevens at{' '}
                  <a href="https://autoriteitpersoonsgegevens.nl" className="text-violet-600 underline">
                    https://autoriteitpersoonsgegevens.nl
                  </a>
                  .
                </p>
              </section>

              {/* 14. Definitions */}
              <section className="mb-16">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  14. Definitions
                </h2>
                <dl className="space-y-4 text-slate-700">
                  <div>
                    <dt className="font-semibold text-slate-900">Personal data</dt>
                    <dd>Any information relating to an identified or identifiable person.</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Special category data</dt>
                    <dd>
                      Particularly sensitive data (health, racial/ethnic origin, religion, sexual orientation)
                      requiring extra protection and explicit consent.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Biometric data</dt>
                    <dd>
                      Data from technical processing of physical characteristics that allows unique identification.
                      Persona may create biometric templates during ID checks; Domu Match does not store these.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Profiling</dt>
                    <dd>
                      Automated processing to evaluate personal aspects (preferences, behaviour). For Domu Match this
                      means computing Harmony and Context scores.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Beta tester</dt>
                    <dd>
                      A user who registered during the public beta period to trial the product before full launch.
                    </dd>
                  </div>
                </dl>
                <p className="text-slate-600 mt-10">
                  This document was last reviewed and updated in {lastUpdated}. Domu Match reserves the right to
                  update this policy; material changes will be notified by email or in-app notification with at
                  least 15 days’ notice.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </MarketingSubpageWrapperLight>
  )
}

