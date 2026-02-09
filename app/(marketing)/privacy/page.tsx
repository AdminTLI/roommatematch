'use client'

import { MarketingSubpageWrapper } from '../components/marketing-subpage-wrapper'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'

export default function PrivacyPage() {
  const { locale } = useApp()
  const lastUpdated = new Date().toLocaleDateString(
    locale === 'nl' ? 'nl-NL' : 'en-US',
  )

  return (
    <MarketingSubpageWrapper>
      <Section className="bg-slate-950">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-slate-500 mb-8">
              Last updated: {lastUpdated}
            </p>

            <p className="text-slate-400 mb-8 leading-relaxed">
                Domu Match is designed for university students (typically 17+)
                who want to find compatible roommates. This Privacy Policy
                explains in clear language how we use your data and your rights
                under the GDPR, the Dutch GDPR Implementation Act (UAVG), and
                the EU AI Act transparency rules.
              </p>

              {/* Privacy at a Glance */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Privacy at a Glance
                </h2>
                <div className="overflow-x-auto rounded-lg border border-slate-700 overflow-hidden">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-200">
                          Topic
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-200">
                          Short answer
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-200">
                          Read more
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      <tr>
                        <td className="px-4 py-3 align-top">
                          Who is responsible?
                        </td>
                        <td className="px-4 py-3 align-top">
                          Domu Match B.V. is the controller responsible for
                          your personal data.
                        </td>
                        <td className="px-4 py-3 align-top">
                          See “Who We Are and Scope”.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">
                          What data do we collect?
                        </td>
                        <td className="px-4 py-3 align-top">
                          Account details, ID verification status, answers to a
                          200-question lifestyle questionnaire, academic
                          context, and in-app messages.
                        </td>
                        <td className="px-4 py-3 align-top">
                          See “Data We Collect”.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">
                          Why do we collect it?
                        </td>
                        <td className="px-4 py-3 align-top">
                          To match you with potential roommates, keep the
                          platform safe, and provide anonymized “Student
                          Success” analytics to universities.
                        </td>
                        <td className="px-4 py-3 align-top">
                          See “Purposes and Legal Bases”.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">
                          Legal basis (GDPR)
                        </td>
                        <td className="px-4 py-3 align-top">
                          Contract (to run the service), your consent (for deep
                          lifestyle data), and our legitimate interest (for
                          security and reporting).
                        </td>
                        <td className="px-4 py-3 align-top">
                          See “Purposes and Legal Bases (Art. 6 GDPR)”.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">
                          How does matching work?
                        </td>
                        <td className="px-4 py-3 align-top">
                          The algorithm combines a Harmony score (≈75%,
                          lifestyle) and a Context score (≈25%, academic and
                          practical info) to suggest, not decide, matches.
                        </td>
                        <td className="px-4 py-3 align-top">
                          See “Automated Decision-Making and Profiling”.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">
                          Do we store your ID?
                        </td>
                        <td className="px-4 py-3 align-top">
                          ID checks are done by Persona. Domu Match does not
                          store your raw ID images or biometric templates. We
                          receive only a verification result and limited ID
                          data.
                        </td>
                        <td className="px-4 py-3 align-top">
                          See “ID Verification with Persona”.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">
                          Who else sees your data?
                        </td>
                        <td className="px-4 py-3 align-top">
                          Persona (ID checks), EU cloud hosting providers, and
                          Pilot Universities (only anonymized and aggregated
                          data).
                        </td>
                        <td className="px-4 py-3 align-top">
                          See “Third-Party Disclosures”.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">
                          How long do we keep it?
                        </td>
                        <td className="px-4 py-3 align-top">
                          While your account is active. If your account is
                          inactive for 1 year, we delete or anonymize your
                          personal data.
                        </td>
                        <td className="px-4 py-3 align-top">
                          See “Data Retention (Storage Limitation)”.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">
                          What are your rights?
                        </td>
                        <td className="px-4 py-3 align-top">
                          You can access, correct, delete, and download your
                          data, withdraw consent for the questionnaire, and
                          object to certain uses.
                        </td>
                        <td className="px-4 py-3 align-top">
                          See “Your Rights as a Student”.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">
                          How do we protect your data?
                        </td>
                        <td className="px-4 py-3 align-top">
                          Encryption in transit (TLS) and at rest, access
                          controls, and compliance with 2026 Cybersecurity Act
                          (Cbw) principles.
                        </td>
                        <td className="px-4 py-3 align-top">
                          See “Security Measures”.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Who We Are and Scope */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Who We Are and Scope
                </h2>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Controller
                </h3>
                <p className="text-slate-400 mb-4">
                  The controller responsible for your personal data is Domu
                  Match B.V., registered in the Netherlands. You will find our
                  contact details in the “Contact and Complaints” section.
                </p>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Who this policy is for
                </h3>
                <p className="text-slate-400 mb-4">
                  This policy applies to students and young people (typically
                  17+) using Domu Match to find roommates, visitors to our
                  website or app, and students connected through participating
                  Pilot Universities.
                </p>
              </section>

              {/* Data We Collect */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Data We Collect
                </h2>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Account and profile data
                </h3>
                <p className="text-slate-400 mb-2">
                  We collect basic account and profile details, such as:
                </p>
                <ul className="list-disc pl-6 text-slate-400 mb-4 space-y-1">
                  <li>Name, email address, and hashed password.</li>
                  <li>
                    University name, study programme, year of study, and
                    general schedule.
                  </li>
                  <li>
                    Housing preferences (location, budget, room type, move-in
                    date).
                  </li>
                  <li>Optional profile picture.</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-2">
                  Lifestyle and behavioural data (Harmony questionnaire)
                </h3>
                <p className="text-slate-400 mb-2">
                  To improve roommate matching, we offer a 200-question
                  lifestyle questionnaire (8 blocks of 25 questions). It covers
                  for example:
                </p>
                <ul className="list-disc pl-6 text-slate-400 mb-4 space-y-1">
                  <li>Daily rhythms (wake-up time, sleep time, noise level).</li>
                  <li>
                    Tidiness and use of shared spaces (cleaning habits,
                    organisation).
                  </li>
                  <li>
                    Social habits (visitors, parties, shared meals, introvert /
                    extrovert preferences).
                  </li>
                  <li>
                    Study vs. social balance (how you like to spend weekdays and
                    weekends).
                  </li>
                </ul>
                <p className="text-slate-400 mb-4">
                  Some answers may indirectly reveal sensitive data (for
                  example, about your health, religion, or sexual orientation).
                  You are never forced to share this: you can skip such
                  questions or answer in a neutral way. We only process this
                  deep lifestyle data with your explicit consent.
                </p>

                <h3 className="text-xl font-semibold text-white mb-2">
                  ID Verification with Persona
                </h3>
                <p className="text-slate-400 mb-2">
                  To reduce fraud and impersonation, we use Persona as our ID
                  verification provider:
                </p>
                <ul className="list-disc pl-6 text-slate-400 mb-4 space-y-1">
                  <li>
                    During verification, Persona processes images or scans of
                    your government ID and, where needed, a selfie or video for
                    biometric comparison.
                  </li>
                  <li>
                    Domu Match does not store your raw ID images or biometric
                    templates.
                  </li>
                  <li>
                    We receive only a verification status (for example:
                    verified / not verified) and limited ID data (such as full
                    name, date of birth, issuing country) needed to link the
                    verification to your account.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-2">
                  Communication and chat
                </h3>
                <p className="text-slate-400 mb-2">
                  When you use our internal chat, we process:
                </p>
                <ul className="list-disc pl-6 text-slate-400 mb-4 space-y-1">
                  <li>Messages you send and receive.</li>
                  <li>Message metadata such as timestamps and read status.</li>
                </ul>
                <p className="text-slate-400 mb-4">
                  By default, your real identity (full name and contact
                  details) is concealed from other users. You control when and
                  whether to mutually reveal your identity or share contact
                  details.
                </p>

                <h3 className="text-xl font-semibold text-white mb-2">
                  Usage and technical data
                </h3>
                <p className="text-slate-400 mb-2">
                  We collect device and technical data to run and secure the
                  platform, such as:
                </p>
                <ul className="list-disc pl-6 text-slate-400 mb-4 space-y-1">
                  <li>Device type, operating system, browser type.</li>
                  <li>IP address, timestamps, pages and screens viewed.</li>
                  <li>
                    Actions such as starting the questionnaire, sending
                    messages, or updating your profile.
                  </li>
                </ul>
              </section>

              {/* Purposes and Legal Bases */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Purposes and Legal Bases (Art. 6 GDPR)
                </h2>
                <p className="text-slate-400 mb-4">
                  We must have a clear legal basis for each way we use your
                  data. Below is an overview of what we do and why we are
                  allowed to do it.
                </p>
                <div className="overflow-x-auto rounded-lg border border-slate-700 overflow-hidden mb-6">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-200">
                          Purpose
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-200">
                          Examples
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-200">
                          Legal basis
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      <tr>
                        <td className="px-4 py-3 align-top">
                          Run your account and provide matching
                        </td>
                        <td className="px-4 py-3 align-top">
                          Creating your account, suggesting compatible
                          roommates, enabling chat.
                        </td>
                        <td className="px-4 py-3 align-top">
                          Contractual necessity (Art. 6(1)(b) GDPR).
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">
                          Deep lifestyle/profiling data
                        </td>
                        <td className="px-4 py-3 align-top">
                          Using your 200-question lifestyle answers to compute
                          Harmony scores.
                        </td>
                        <td className="px-4 py-3 align-top">
                          Your explicit consent (Art. 6(1)(a), and Art. 9(2)(a)
                          for any special-category aspects).
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">
                          Platform security and reporting
                        </td>
                        <td className="px-4 py-3 align-top">
                          ID verification, fraud prevention, abuse reporting,
                          logs.
                        </td>
                        <td className="px-4 py-3 align-top">
                          Legitimate interest (Art. 6(1)(f)) and, where
                          applicable, legal obligations.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 align-top">
                          Student Success analytics for universities
                        </td>
                        <td className="px-4 py-3 align-top">
                          Sharing anonymized statistics about housing and
                          matching outcomes with Pilot Universities.
                        </td>
                        <td className="px-4 py-3 align-top">
                          Anonymized data is no longer personal data; any
                          necessary pre-anonymization steps rely on legitimate
                          interest with safeguards.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-slate-400 mb-4">
                  For the lifestyle questionnaire, you can always withdraw your
                  consent. We will then stop using your lifestyle responses for
                  new matches and delete or properly anonymize them (unless we
                  must keep a small amount for legal reasons).
                </p>
              </section>

              {/* Data Minimization and Purpose Limitation */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Data Minimization and Purpose Limitation
                </h2>
                <p className="text-slate-400 mb-4">
                  We carefully design our questions and data fields so that we
                  only ask for what we truly need. Our main purposes are:
                </p>
                <ul className="list-disc pl-6 text-slate-400 mb-4 space-y-1">
                  <li>Roommate matching and related communication.</li>
                  <li>
                    Platform safety, fraud prevention, and responding to
                    reports.
                  </li>
                  <li>
                    Anonymized, high-level “Student Success” analytics for
                    universities.
                  </li>
                </ul>
                <p className="text-slate-400 mb-4">
                  We do not use your personal data for unrelated advertising,
                  and we do not sell your personal data to commercial third
                  parties. If we ever want to use your data for a new purpose
                  that is not compatible with these, we will tell you first and
                  ask for consent where required.
                </p>
              </section>

              {/* Automated Decision-Making and Profiling */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Automated Decision-Making and Profiling (Art. 22 GDPR)
                </h2>
                <h3 className="text-xl font-semibold text-white mb-2">
                  How the matching algorithm works
                </h3>
                <p className="text-slate-400 mb-3">
                  Domu Match uses automated processing to suggest potential
                  roommates:
                </p>
                <ul className="list-disc pl-6 text-slate-400 mb-4 space-y-1">
                  <li>
                    <span className="font-semibold">Harmony score (≈75%)</span>{' '}
                    – based mostly on your lifestyle answers (daily rhythms,
                    tidiness, social habits, routines).
                  </li>
                  <li>
                    <span className="font-semibold">Context score (≈25%)</span>{' '}
                    – based on your academic and practical context (programme,
                    year, schedule, budget).
                  </li>
                  <li>
                    These two scores are combined into an overall compatibility
                    score which we use to rank profiles you might be interested
                    in.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-2">
                  No solely automated legal or similarly significant decisions
                </h3>
                <p className="text-slate-400 mb-4">
                  Our system only suggests possible roommates. It does not
                  decide where you may live, your academic results, or any
                  legal or financial outcome. You always choose who to contact,
                  who to chat with, and who to live with. This means you are
                  not subject to decisions with legal or similarly significant
                  effects made solely by our algorithm.
                </p>

                <h3 className="text-xl font-semibold text-white mb-2">
                  EU AI Act transparency
                </h3>
                <p className="text-slate-400 mb-4">
                  In line with the EU AI Act transparency rules, we clearly
                  inform you that we use automated systems for matching,
                  explain the main factors (Harmony ≈ 75%, Context ≈ 25%), and
                  regularly review the system to reduce unfair bias. You can
                  contact us if you think the system treats you unfairly.
                </p>
              </section>

              {/* Third-Party Disclosures */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Third-Party Disclosures
                </h2>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Persona (ID verification)
                </h3>
                <p className="text-slate-400 mb-3">
                  We use Persona to perform identity checks:
                </p>
                <ul className="list-disc pl-6 text-slate-400 mb-4 space-y-1">
                  <li>
                    Persona may process your government ID and selfie/video and
                    create biometric templates to confirm that the ID belongs to
                    you.
                  </li>
                  <li>
                    Domu Match does not store these raw images or biometric
                    templates. We only receive the verification outcome and
                    limited ID data linked to your account.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-2">
                  Cloud hosting providers
                </h3>
                <p className="text-slate-400 mb-3">
                  We host Domu Match using reputable cloud providers with
                  servers in the EU (for example, AWS, Azure, or Google Cloud
                  EU regions). These providers act as processors under data
                  processing agreements and may only use your data to run the
                  infrastructure, not for their own marketing.
                </p>

                <h3 className="text-xl font-semibold text-white mb-2">
                  Pilot Universities (anonymized analytics)
                </h3>
                <p className="text-slate-400 mb-3">
                  We may share anonymized and aggregated data with Pilot
                  Universities to understand how housing and roommate matching
                  relate to student success. Universities cannot identify you
                  from these datasets. If a specific research project needs
                  more detailed data, we will apply strict safeguards and, if
                  necessary, ask for your consent.
                </p>
              </section>

              {/* Data Retention */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Data Retention (Storage Limitation)
                </h2>
                <p className="text-slate-400 mb-4">
                  We keep your data only as long as we reasonably need it for
                  the purposes described above or as required by law.
                </p>
                <ul className="list-disc pl-6 text-slate-400 mb-4 space-y-1">
                  <li>
                    We keep most of your personal data while your Domu Match
                    account is active.
                  </li>
                  <li>
                    If your account is inactive for 1 year, we delete or
                    irreversibly anonymize your personal data, following Dutch
                    Data Protection Authority guidance.
                  </li>
                  <li>
                    Lifestyle questionnaire data is kept and used only while you
                    keep your consent and your account is active; if you
                    withdraw consent or delete your account, we delete or
                    anonymize it within a reasonable period.
                  </li>
                  <li>
                    Certain logs or security-related records may be kept for a
                    bit longer where necessary to investigate incidents or meet
                    legal requirements.
                  </li>
                </ul>
              </section>

              {/* Your Rights */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Your Rights as a Student
                </h2>
                <p className="text-slate-400 mb-4">
                  Under the GDPR and UAVG, you have several important rights.
                  You can usually exercise them through your account settings or
                  by contacting us.
                </p>
                <ul className="list-disc pl-6 text-slate-400 mb-4 space-y-1">
                  <li>
                    <span className="font-semibold">
                      Right of access and information:
                    </span>{' '}
                    you can ask what data we hold about you and receive a copy.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Right to rectification:
                    </span>{' '}
                    you can correct inaccurate or incomplete data.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Right to erasure (“right to be forgotten”):
                    </span>{' '}
                    you can request deletion of your account and personal data,
                    subject to limited legal exceptions.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Right to withdraw consent:
                    </span>{' '}
                    you can withdraw your consent for the lifestyle
                    questionnaire at any time, and we will stop using those
                    data for new matches.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Right to data portability:
                    </span>{' '}
                    you can download your questionnaire results and other key
                    data in a portable format, where technically feasible.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Right to object and to restriction:
                    </span>{' '}
                    you can object to certain processing based on legitimate
                    interest and ask us to temporarily restrict processing
                    while we review your request.
                  </li>
                </ul>
                <p className="text-slate-400 mb-4">
                  We may ask you to verify your identity before we handle your
                  request. We aim to respond within one month, as required by
                  law.
                </p>
              </section>

              {/* Security Measures */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Security Measures
                </h2>
                <p className="text-slate-400 mb-4">
                  We use technical and organizational measures to protect your
                  data, including:
                </p>
                <ul className="list-disc pl-6 text-slate-400 mb-4 space-y-1">
                  <li>
                    Encryption in transit (TLS/HTTPS) and encryption at rest for
                    our databases and storage.
                  </li>
                  <li>
                    Strict access controls: only authorized staff with a real
                    need can access personal data.
                  </li>
                  <li>
                    Regular updates, monitoring, and incident response
                    procedures.
                  </li>
                </ul>
                <p className="text-slate-400 mb-4">
                  We design Domu Match in line with the principles of the 2026
                  Cybersecurity Act (Cbw), focusing on digital resilience and
                  security by design and by default. No system is perfectly
                  secure, but we work hard to minimize risks.
                </p>
              </section>

              {/* Contact and Complaints */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Contact and Complaints
                </h2>
                <p className="text-slate-400 mb-3">
                  If you have questions or want to exercise your rights, you
                  can contact our privacy contact / Data Protection Officer
                  (DPO):
                </p>
                <ul className="list-disc pl-6 text-slate-400 mb-4 space-y-1">
                  <li>Name: DPO Domu Match</li>
                  <li>Email: privacy@domumatch.example</li>
                  <li>
                    Postal address: Domu Match B.V., [Street and number], [ZIP
                    code] [City], The Netherlands
                  </li>
                </ul>
                <p className="text-slate-400 mb-3">
                  You also have the right to lodge a complaint with your local
                  data protection authority. In the Netherlands, this is the
                  Autoriteit Persoonsgegevens (Dutch Data Protection Authority)
                  at{' '}
                  <a
                    href="https://autoriteitpersoonsgegevens.nl"
                    className="text-violet-400 underline"
                  >
                    https://autoriteitpersoonsgegevens.nl
                  </a>
                  .
                </p>
              </section>

              {/* Definitions */}
              <section className="mb-16">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Definitions
                </h2>
                <dl className="space-y-4 text-slate-400">
                  <div>
                    <dt className="font-semibold text-white">
                      Personal data
                    </dt>
                    <dd>
                      Any information that relates to an identified or
                      identifiable person (for example, your name, email, user
                      ID, or a combination of lifestyle answers that can be
                      linked to you).
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-white">
                      Special category data
                    </dt>
                    <dd>
                      Particularly sensitive data such as health information,
                      data about racial or ethnic origin, religious or
                      philosophical beliefs, or sexual orientation. These
                      require extra protection and usually explicit consent.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-white">
                      Biometric data
                    </dt>
                    <dd>
                      Personal data resulting from technical processing of
                      physical or behavioural characteristics (like facial
                      images) that allow or confirm unique identification. For
                      Domu Match, Persona may create biometric templates during
                      ID verification, but Domu Match itself does not store
                      those templates or raw ID images.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-white">Profiling</dt>
                    <dd>
                      Any automated processing of personal data to evaluate
                      personal aspects, such as behaviour, preferences, or
                      interests. For Domu Match, profiling mainly means using
                      your lifestyle and context data to calculate Harmony and
                      Context scores for roommate matching.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-white">
                      Automated decision-making
                    </dt>
                    <dd>
                      Decisions made only by machines, without human
                      involvement, that produce legal or similarly significant
                      effects. Domu Match does not make this type of decision
                      about you; our system only suggests possible matches, and
                      you stay in control.
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          </Container>
        </Section>
    </MarketingSubpageWrapper>
  )
}

