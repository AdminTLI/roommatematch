export type FaqMarketingItem = { question: string; answer: string }
export type FaqMarketingCategory = { category: string; items: FaqMarketingItem[] }

export const faqMarketingEn: FaqMarketingCategory[] = [
  {
    category: 'Getting started',
    items: [
      {
        question: 'What is Domu Match?',
        answer:
          'Domu Match helps verified students and young professionals in the Netherlands find compatible roommates. You complete a structured lifestyle questionnaire, get suggestions with a compatibility score and plain-language reasons, and chat on the platform. Students and young professionals are matched only within their own pool.',
      },
      {
        question: 'Who can use Domu Match?',
        answer:
          'Students enrolled at Dutch universities or hogescholen sign up with an institutional email and complete identity verification. Young professionals in the Netherlands sign up with their own email and complete the same ID verification. You must be at least 17. Everyone is verified before they can use core matching and chat features.',
      },
      {
        question: 'How long does signup and onboarding take?',
        answer:
          'Creating an account and passing verification is quick; the compatibility questionnaire usually takes about 10–15 minutes. The more honestly and completely you answer, the more useful your matches and explanations will be.',
      },
      {
        question: 'Do I need a room or contract before I join?',
        answer:
          'No. Many people join to find a roommate first and look for housing together; others already have a room and need flatmates. Domu Match supports both.',
      },
      {
        question: 'Which institutions are supported?',
        answer:
          'Domu Match is built for Dutch higher education: universities and hogescholen. If your institutional email is accepted at signup, you can use the student path. If something looks wrong for your school, contact support so we can help.',
      },
    ],
  },
  {
    category: 'Safety & verification',
    items: [
      {
        question: 'How does Domu Match verify users?',
        answer:
          'Identity verification is done through Persona using government ID and a selfie (and sometimes a short video) on their secure flow. Students also prove student status via their university or hogeschool email. Until verification is complete, you cannot use matching and chat the same way as verified users.',
      },
      {
        question: 'Is my personal data safe?',
        answer:
          'We process data under GDPR. We use encryption in line with industry practice, we do not sell your personal data, and you control what you put on your profile. For full detail, see our Privacy Policy.',
      },
      {
        question: 'Can I report or block someone?',
        answer:
          'Yes. You can report concerns from profiles and conversations, and block users when needed. Reports are reviewed by our team and we may suspend or ban accounts that break our rules.',
      },
      {
        question: 'Do you run criminal background checks?',
        answer:
          'No. We verify identity and (for students) institutional affiliation. We enforce community guidelines and take action on abuse, but we do not perform criminal record checks.',
      },
    ],
  },
  {
    category: 'Matching & scores',
    items: [
      {
        question: 'How does roommate matching work?',
        answer:
          'Your questionnaire answers describe how you live: cleanliness, noise, guests, sleep and quiet hours, shared spaces, substances, balance between study/work and social life, and the kind of home you want. We apply dealbreakers where your answers require it (for example strict no-smoking indoors), then score fit across those lifestyle dimensions and add context such as university, programme, and study year. Technical search also uses profile embeddings to surface likely candidates before the detailed score is applied.',
      },
      {
        question: 'What does the compatibility score mean?',
        answer:
          'The score is a 0–100% summary of how closely your stated preferences align on the dimensions we measure. It is a guide, not a guarantee of how living together will feel. Use it together with the written strengths and “watch outs” on each suggestion.',
      },
      {
        question: 'Can I see why I was matched with someone?',
        answer:
          'Yes. Suggestions include highlights (what aligns well) and watch-outs (where you may need to compromise or talk things through). That is intentional: we want matching to be understandable, not a black box.',
      },
      {
        question: 'Can I filter match suggestions?',
        answer:
          'You can narrow suggestions by university, degree level, programme, and study year. Widen filters if you see few results, especially early on or in smaller cities.',
      },
    ],
  },
  {
    category: 'Chat, Domu AI & rules',
    items: [
      {
        question: 'How does messaging work?',
        answer:
          'After you connect with someone through the match flow, you message inside Domu Match. Chat is text-based, moderated, and designed to keep contact on-platform until you choose to share details elsewhere.',
      },
      {
        question: 'Why was my message blocked or limited?',
        answer:
          'To reduce spam and abuse, outgoing messages are rate-limited (for example up to 30 messages per 5 minutes under normal operation). If you hit the limit, wait a few minutes and continue. External links are not allowed in chat for safety.',
      },
      {
        question: 'What is Domu AI?',
        answer:
          'Domu AI is the in-app assistant (chat bubble) that answers questions about using Domu Match, living in the Netherlands, and housing topics in general. It is guidance only: it is not legal advice, and it does not access other users’ private data.',
      },
      {
        question: 'Can I video call other users inside Domu Match?',
        answer:
          'Day-to-day chat is text-first. If you want a video call before meeting, agree that off-platform (for example WhatsApp or Google Meet) once you are comfortable. Optional video-intro features may be offered separately from live chat as the product evolves.',
      },
      {
        question: 'Can I look for more than one roommate?',
        answer:
          'You can use Domu Match to meet individuals and explore group-style suggestions where the product supports them. Exact group flows can change as we ship updates; the goal is always transparent compatibility information before you commit.',
      },
    ],
  },
  {
    category: 'Housing & next steps',
    items: [
      {
        question: 'Does Domu Match include housing listings?',
        answer:
          'Roommate matching is the core product. We are also building housing discovery inside the app (browse listings, preferences, and—in supported cases—tour requests). Whether you see that section depends on current rollout and configuration. If it is not visible yet, you can still match with roommates and coordinate housing together off the listings area.',
      },
      {
        question: 'Should I find roommates or housing first?',
        answer:
          'Many people prefer finding people they can live with first, then searching together. That reduces the risk of signing for a flat with strangers you have not vetted. There is no single right order; choose what fits your timeline.',
      },
      {
        question: 'Where can I learn typical rents or neighbourhoods?',
        answer:
          'Rents change quickly and vary by city and room type. Use municipal or national housing statistics, your institution’s housing desk, and reputable listing sites for market ranges. Domu Match focuses on who you live with and, when available, how listings fit your stated preferences—not on quoting average rents.',
      },
    ],
  },
  {
    category: 'Account & support',
    items: [
      {
        question: 'How do I update my profile or questionnaire?',
        answer:
          'Open Settings: profile fields, questionnaire, notifications, and privacy (including data export and deletion requests) live in the tabs there. Big changes to your answers can change who you match with going forward.',
      },
      {
        question: 'How do I delete my account?',
        answer:
          'Go to Settings → Account and follow the link to delete your account. You will complete a short exit flow. Deletion is permanent on our side once processed; retention of certain records for legal or security reasons is described in our Privacy Policy.',
      },
      {
        question: 'I forgot my password—what now?',
        answer:
          'On the sign-in page, use “Forgot password” and check your email (including spam). Reset links expire for security; request a new one if needed.',
      },
      {
        question: 'Is there a mobile app?',
        answer:
          'Domu Match is a web application that works in the browser on phones and desktops. There is no separate app store download required today.',
      },
      {
        question: 'How do I contact support?',
        answer:
          'Use the in-app Help Center where available, or email domumatch@gmail.com. Include your account email and a short description of the issue so we can help faster.',
      },
    ],
  },
]
