/**
 * Comprehensive help center content
 * Organized by sections with articles and FAQs
 */

export interface HelpArticle {
  id: string
  title: string
  content: string
  section: string
  tags: string[]
  keywords: string[]
  relatedArticles: string[]
  type: 'article' | 'faq'
}

export interface HelpSection {
  id: string
  title: string
  description: string
  icon: string
  articles: HelpArticle[]
  faqs: HelpArticle[]
}

type HelpContent = {
  en: HelpSection[]
  nl: HelpSection[]
}

export const helpContent: HelpContent = {
  en: [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'New to Domu Match? Start here to learn the basics.',
      icon: '🚀',
      articles: [
        {
          id: 'sign-up',
          title: 'How to Create an Account',
          content: `Creating an account on Domu Match is quick and easy:

1. **Visit the Sign Up page** - Click "Sign Up" or "Get Started" on our homepage
2. **Enter your email** - Use your university email address (e.g., student@university.nl)
3. **Create a password** - Choose a strong password with at least 8 characters
4. **Verify your email** - Check your inbox and click the verification link
5. **Complete your profile** - Fill in basic information about yourself

**Important:** You must use your university email address. Personal email addresses (Gmail, Yahoo, etc.) are not accepted for security reasons.

Once your email is verified, you'll be redirected to complete the onboarding questionnaire, which helps us find the best roommate matches for you.`,
          section: 'getting-started',
          tags: ['sign up', 'account', 'registration'],
          keywords: ['create account', 'register', 'sign up', 'new user'],
          relatedArticles: ['email-verification', 'onboarding'],
          type: 'article',
        },
        {
          id: 'email-verification',
          title: 'Email Verification Process',
          content: `Email verification is required to ensure you're a real student at a partner university.

**What happens:**
1. After signing up, you'll receive a verification email
2. Click the verification link in the email
3. You'll be redirected back to the platform, verified and ready to go

**Didn't receive the email?**
- Check your spam/junk folder
- Make sure you used your university email address
- Click "Resend verification email" on the verification page
- Wait up to 5 minutes for delivery

**Still having issues?**
Contact support at support@domumatch.com with your university email address, and we'll help you verify your account.`,
          section: 'getting-started',
          tags: ['email', 'verification', 'university'],
          keywords: ['verify email', 'email confirmation', 'verification code'],
          relatedArticles: ['sign-up', 'troubleshooting-verification'],
          type: 'article',
        },
        {
          id: 'onboarding',
          title: 'Completing the Onboarding Questionnaire',
          content: `The onboarding questionnaire is essential for finding compatible roommates. Here's what to expect:

**Questionnaire Sections:**
1. **Basics** - Personal information (name, date of birth, nationality)
2. **Academic** - University, program, study year, campus
3. **Logistics** - Housing preferences, budget, move-in dates
4. **Lifestyle** - Sleep schedule, cleanliness preferences, daily routines
5. **Social** - Guest preferences, noise tolerance, social activities
6. **Personality** - Communication style, conflict resolution
7. **Communication** - Language preferences, communication methods
8. **Languages** - Languages you speak (optional)
9. **Dealbreakers** - Things you absolutely can't compromise on

**Tips for Best Results:**
- Be honest - accurate answers lead to better matches
- Take your time - there's no rush, you can save and continue later
- Think about your ideal living situation - what matters most to you?
- Complete all required sections - incomplete profiles get fewer matches

**Saving Progress:**
Your answers are automatically saved as you progress. You can leave and return anytime to continue where you left off.`,
          section: 'getting-started',
          tags: ['onboarding', 'questionnaire', 'profile'],
          keywords: ['questionnaire', 'quiz', 'survey', 'onboarding questions'],
          relatedArticles: ['improving-matches', 'understanding-scores'],
          type: 'article',
        },
        {
          id: 'first-match',
          title: 'Understanding Your First Match',
          content: `After completing your onboarding, you'll start receiving match suggestions within 24-48 hours.

**What to Expect:**
- You'll receive notifications when new matches are available
- Each match includes a compatibility score (0-100%)
- Detailed explanations show why you matched
- You can view profiles, compatibility breakdowns, and start conversations

**Compatibility Score Breakdown:**
- **90-100%**: Excellent match - high compatibility across all factors
- **80-89%**: Very good match - strong alignment with minor differences
- **70-79%**: Good match - compatible with some areas to discuss
- **Below 70%**: Lower compatibility - may have significant differences

**Next Steps:**
1. Review the match's profile and compatibility details
2. Check the explanation of why you matched
3. Start a conversation if interested
4. Accept or reject the match based on your preference

Remember: You're not obligated to accept any match. Take your time to review and chat before making a decision.`,
          section: 'getting-started',
          tags: ['matches', 'compatibility', 'first steps'],
          keywords: ['first match', 'match suggestions', 'compatibility score'],
          relatedArticles: ['understanding-scores', 'accepting-matches'],
          type: 'article',
        },
      ],
      faqs: [
        {
          id: 'faq-signup-requirements',
          title: 'What do I need to sign up?',
          content: `You need:
- A university email address from a partner institution
- To be at least 17 years old
- A valid government ID for verification (required after signup)
- About 15-20 minutes to complete the onboarding questionnaire`,
          section: 'getting-started',
          tags: ['sign up', 'requirements'],
          keywords: ['requirements', 'what do I need', 'signup'],
          relatedArticles: ['sign-up', 'verification-process'],
          type: 'faq',
        },
        {
          id: 'faq-personal-email',
          title: 'Can I use my personal email address?',
          content: `No, you must use your university email address. This is required for:
- Security and verification purposes
- Ensuring all users are legitimate students
- University partnerships and integrations

If you don't have a university email or are having trouble accessing it, contact support at support@domumatch.com`,
          section: 'getting-started',
          tags: ['email', 'university'],
          keywords: ['personal email', 'Gmail', 'Yahoo'],
          relatedArticles: ['email-verification'],
          type: 'faq',
        },
        {
          id: 'faq-onboarding-time',
          title: 'How long does onboarding take?',
          content: `Most students complete the onboarding questionnaire in 15-20 minutes. However, you can:
- Save your progress and return later
- Take breaks between sections
- Review and edit your answers anytime

The questionnaire is designed to be thorough but not overwhelming. Take your time to give honest, thoughtful answers for the best match results.`,
          section: 'getting-started',
          tags: ['onboarding', 'time'],
          keywords: ['how long', 'duration', 'time'],
          relatedArticles: ['onboarding'],
          type: 'faq',
        },
      ],
    },
    {
      id: 'account-verification',
      title: 'Account & Verification',
      description: 'Learn about account management, verification processes, and profile settings.',
      icon: '🔐',
      articles: [
        {
          id: 'verification-process',
          title: 'ID Verification Process',
          content: `ID verification is required to ensure platform safety and authenticity.

**What You'll Need:**
- Government-issued ID (passport, driver's license, or national ID card)
- A smartphone or device with a camera
- Good lighting for a clear selfie

**Step-by-Step Process:**
1. After email verification, you'll be prompted to verify your identity
2. Choose your ID type (passport, driver's license, or national ID)
3. Take a clear photo of your ID (both sides if applicable)
4. Take a selfie following the on-screen instructions
5. Submit for review

**Verification Review:**
- Automatic verification usually takes 1-2 minutes
- Manual review may take up to 24 hours
- You'll receive an email notification once verified

**Privacy & Security:**
- All verification data is encrypted and secure
- ID photos are stored for 4 weeks after verification (per Dutch law)
- Your ID information is never shared with other users
- Verification is processed by trusted third-party providers (Persona, Veriff, or Onfido)`,
          section: 'account-verification',
          tags: ['verification', 'ID', 'safety'],
          keywords: ['ID verification', 'identity check', 'verify ID'],
          relatedArticles: ['account-settings', 'safety-features'],
          type: 'article',
        },
        {
          id: 'account-settings',
          title: 'Managing Your Account Settings',
          content: `Your account settings let you control your profile, privacy, and notifications.

**Profile Settings:**
- Update your name, bio, and profile picture
- Change your email address (university email required)
- Update your university or program information
- Manage your profile visibility

**Privacy Settings:**
- Control who can see your profile
- Manage data sharing preferences
- View your privacy data (GDPR)
- Request data deletion

**Notification Preferences:**
- Email notifications for new matches
- In-app notifications for messages
- Weekly digest emails
- Safety alerts

**Security Settings:**
- Change your password
- Enable two-factor authentication (if available)
- View active sessions
- Manage connected devices

**Accessing Settings:**
Navigate to Settings from the menu in the top-right corner of your screen, then select the category you want to modify.`,
          section: 'account-verification',
          tags: ['settings', 'account', 'profile'],
          keywords: ['account settings', 'profile settings', 'preferences'],
          relatedArticles: ['privacy-controls', 'troubleshooting-account'],
          type: 'article',
        },
        {
          id: 'profile-completion',
          title: 'Completing Your Profile',
          content: `A complete profile increases your chances of finding compatible matches.

**Required Information:**
- Basic details (name, date of birth)
- University and program
- Housing preferences and budget
- Lifestyle preferences from questionnaire

**Optional Enhancements:**
- Profile photo
- Bio/About me section
- Interests and hobbies
- Social media links (optional)

**Profile Completion Tips:**
- Add a clear, friendly profile photo
- Write an honest bio that reflects your personality
- Keep information up-to-date, especially contact details
- Complete all questionnaire sections for best matching

**Updating Your Profile:**
You can update your profile anytime from Settings > Profile. Changes may take a few minutes to reflect in your matches.`,
          section: 'account-verification',
          tags: ['profile', 'completion'],
          keywords: ['complete profile', 'profile setup', 'profile information'],
          relatedArticles: ['account-settings', 'improving-matches'],
          type: 'article',
        },
      ],
      faqs: [
        {
          id: 'faq-verification-required',
          title: 'Is ID verification required?',
          content: `Yes, ID verification is required for all users. This ensures:
- Platform safety and security
- All users are legitimate students
- Compliance with university partnerships
- Protection against fraud and scams

Verification is quick and secure, using trusted third-party providers.`,
          section: 'account-verification',
          tags: ['verification', 'required'],
          keywords: ['required', 'mandatory', 'do I need'],
          relatedArticles: ['verification-process'],
          type: 'faq',
        },
        {
          id: 'faq-verification-time',
          title: 'How long does verification take?',
          content: `Most verifications are automatic and completed within 1-2 minutes. However:
- Complex cases may require manual review (up to 24 hours)
- Weekends and holidays may have longer processing times
- You'll receive an email notification once verified

If your verification is taking longer than 24 hours, contact support.`,
          section: 'account-verification',
          tags: ['verification', 'time'],
          keywords: ['how long', 'verification time', 'processing'],
          relatedArticles: ['verification-process', 'troubleshooting-verification'],
          type: 'faq',
        },
        {
          id: 'faq-change-email',
          title: 'Can I change my email address?',
          content: `You can change your email address, but it must still be a university email address. To change it:
1. Go to Settings > Account
2. Click "Change Email"
3. Enter your new university email address
4. Verify the new email address

Note: You cannot switch from a university email to a personal email.`,
          section: 'account-verification',
          tags: ['email', 'change'],
          keywords: ['change email', 'update email', 'new email'],
          relatedArticles: ['account-settings'],
          type: 'faq',
        },
      ],
    },
    {
      id: 'matching',
      title: 'Matching & Compatibility',
      description: 'Understand how our matching algorithm works and how to improve your matches.',
      icon: '🎯',
      articles: [
        {
          id: 'how-matching-works',
          title: 'How the Matching Algorithm Works',
          content: `Our matching algorithm analyzes 40+ factors to find your ideal roommate matches.

**Key Factors Considered:**

1. **Personality Compatibility**
   - Communication styles
   - Conflict resolution approaches
   - Values and priorities
   - Lifestyle preferences

2. **Schedule Alignment**
   - Sleep schedules (wake/sleep times)
   - Study habits and quiet hours
   - Daily routines
   - Weekend preferences

3. **Cleanliness Preferences**
   - Cleanliness standards
   - Cleaning schedules
   - Organization preferences
   - Shared space expectations

4. **Social & Guest Preferences**
   - Frequency of guests
   - Noise tolerance
   - Social activities
   - Party preferences

5. **Academic Affinity**
   - Same university
   - Same program (highest priority)
   - Same faculty
   - Study year proximity

**How It Works:**
1. Your questionnaire answers create a compatibility profile
2. The algorithm compares your profile with other students
3. Compatibility scores are calculated using weighted factors
4. Matches are ranked and presented with explanations

**Transparency:**
Every match includes a detailed breakdown showing:
- Why you matched
- Areas of strong alignment
- Potential areas to discuss
- Suggested house rules`,
          section: 'matching',
          tags: ['algorithm', 'matching', 'compatibility'],
          keywords: ['how matching works', 'algorithm', 'compatibility score'],
          relatedArticles: ['understanding-scores', 'improving-matches'],
          type: 'article',
        },
        {
          id: 'understanding-scores',
          title: 'Understanding Compatibility Scores',
          content: `Compatibility scores range from 0-100% and indicate how well you match with another student.

**Score Breakdown:**

**90-100% - Excellent Match**
- Very high compatibility across most factors
- Minimal conflicts expected
- Strong alignment in lifestyle, schedule, and preferences
- Recommended to start a conversation

**80-89% - Very Good Match**
- Strong compatibility with minor differences
- Most factors align well
- Small adjustments may be needed
- Good potential for a successful roommate relationship

**70-79% - Good Match**
- Solid compatibility with some differences
- Several aligned factors
- Some areas require discussion and compromise
- Worth exploring further through conversation

**Below 70% - Lower Compatibility**
- Significant differences in key areas
- May require substantial compromise
- Not recommended unless you're flexible

**What the Score Means:**
The score is a starting point, not a final verdict. Consider:
- The detailed breakdown of why you matched
- Areas of strong alignment
- Areas that need discussion
- Your willingness to compromise

Remember: High scores don't guarantee a perfect match, and lower scores don't mean it's impossible - they're guides to help you make informed decisions.`,
          section: 'matching',
          tags: ['scores', 'compatibility', 'understanding'],
          keywords: ['compatibility score', 'match score', 'percentage', 'rating'],
          relatedArticles: ['how-matching-works', 'accepting-matches'],
          type: 'article',
        },
        {
          id: 'improving-matches',
          title: 'Improving Your Match Quality',
          content: `Get better matches by following these tips:

**1. Complete Your Profile Fully**
- Fill in all questionnaire sections
- Answer honestly and thoughtfully
- Update your preferences regularly
- Add a profile photo and bio

**2. Be Specific in Your Answers**
- Detailed answers lead to better matching
- Don't just select "flexible" for everything
- Think about what truly matters to you
- Consider your dealbreakers carefully

**3. Keep Information Up-to-Date**
- Update your preferences if they change
- Modify your housing budget if needed
- Update your program/year if it changes
- Refresh your bio periodically

**4. Review Your Dealbreakers**
- Too many dealbreakers limit matches
- Be realistic about what you can compromise on
- Focus on truly important issues
- Consider flexibility in less critical areas

**5. Engage with Matches**
- Start conversations with compatible matches
- Be open-minded about differences
- Ask questions to learn more
- Give feedback on matches (helps the algorithm learn)`,
          section: 'matching',
          tags: ['improving', 'matches', 'tips'],
          keywords: ['better matches', 'improve matches', 'more matches'],
          relatedArticles: ['understanding-scores', 'accepting-matches'],
          type: 'article',
        },
        {
          id: 'accepting-matches',
          title: 'Accepting or Rejecting Matches',
          content: `You have full control over which matches to pursue.

**Accepting a Match:**
- Click "Accept" on a match you're interested in
- This opens a chat where you can start a conversation
- Both users must accept for an active match
- Accepted matches appear in your Matches section

**Rejecting a Match:**
- Click "Reject" if you're not interested
- Rejected matches won't appear again
- You can provide feedback (optional) to help improve future matches
- Rejecting is final, but you can always find new matches

**What to Consider:**
Before accepting or rejecting, review:
- Compatibility score and breakdown
- Profile information and photos
- Shared interests and values
- Potential dealbreakers
- Your gut feeling

**After Accepting:**
- Start a conversation to get to know each other
- Ask questions about living preferences
- Discuss expectations and boundaries
- Arrange a video call or in-person meeting if comfortable
- Take your time before making final decisions

**Remember:**
- You're not obligated to accept any match
- Take your time to review and consider
- It's okay to reject if something doesn't feel right
- New matches are available regularly`,
          section: 'matching',
          tags: ['accept', 'reject', 'matches'],
          keywords: ['accept match', 'reject match', 'match decision'],
          relatedArticles: ['how-matching-works', 'chat-basics'],
          type: 'article',
        },
      ],
      faqs: [
        {
          id: 'faq-matching-factors',
          title: 'What factors are considered in matching?',
          content: `The algorithm considers 40+ factors across five main categories:
- Personality compatibility (communication, values, conflict resolution)
- Schedule alignment (sleep patterns, study habits, routines)
- Cleanliness preferences (standards, schedules, organization)
- Social preferences (guests, noise, activities)
- Academic affinity (university, program, faculty, study year)

All factors are weighted to prioritize the most important compatibility areas.`,
          section: 'matching',
          tags: ['factors', 'algorithm'],
          keywords: ['factors', 'what is considered', 'matching criteria'],
          relatedArticles: ['how-matching-works'],
          type: 'faq',
        },
        {
          id: 'faq-no-matches',
          title: 'Why am I not getting matches?',
          content: `Common reasons for few or no matches:
- Incomplete profile or questionnaire
- Very restrictive preferences or too many dealbreakers
- Limited users in your area/university
- Recent account creation (matches generate daily)

Try: Completing all sections, reviewing dealbreakers, being more flexible, and waiting 24-48 hours for new matches.`,
          section: 'matching',
          tags: ['no matches', 'troubleshooting'],
          keywords: ['no matches', 'not getting matches', 'why no matches'],
          relatedArticles: ['improving-matches', 'troubleshooting-matches'],
          type: 'faq',
        },
        {
          id: 'faq-score-accuracy',
          title: 'How accurate are compatibility scores?',
          content: `Compatibility scores are based on your questionnaire answers and provide a good starting point, but:
- They're not guarantees of success
- Real compatibility includes factors beyond the questionnaire
- Conversation and meeting in person provide additional insights
- Flexibility and communication matter more than perfect scores

Use scores as a guide, but trust your judgment and conversations.`,
          section: 'matching',
          tags: ['scores', 'accuracy'],
          keywords: ['accurate', 'reliable', 'score accuracy'],
          relatedArticles: ['understanding-scores'],
          type: 'faq',
        },
      ],
    },
    {
      id: 'chat',
      title: 'Chat & Messaging',
      description: 'Learn how to start conversations, use group chats, and stay safe while messaging.',
      icon: '💬',
      articles: [
        {
          id: 'chat-basics',
          title: 'Starting a Conversation',
          content: `Starting a conversation with a match is simple and safe.

**Starting a Chat:**
1. Find a match you're interested in
2. Click "Start Chat" or "Message" on their profile
3. Type your first message
4. Send and wait for their response

**First Message Tips:**
- Reference something from their profile
- Ask about shared interests or compatibility factors
- Keep it friendly and casual
- Be genuine and yourself
- Ask open-ended questions to encourage response

**Example First Messages:**
- "Hi! I noticed we both study [subject] - how are you finding it?"
- "Hey! Your compatibility score looks great. I'd love to chat about living preferences."
- "Hi there! I see we have similar schedules. Would you be interested in discussing a potential living situation?"

**Chat Features:**
- Text-only messaging (for safety)
- Real-time message delivery
- Read receipts
- Message history
- Report/block options

**Rate Limiting:**
To prevent spam and harassment, there's a limit of 30 messages per 5 minutes. This protects all users.`,
          section: 'chat',
          tags: ['chat', 'messaging', 'conversation'],
          keywords: ['start chat', 'send message', 'conversation'],
          relatedArticles: ['chat-safety', 'group-chats'],
          type: 'article',
        },
        {
          id: 'group-chats',
          title: 'Using Group Chats',
          content: `Group chats allow multiple roommates to discuss shared living arrangements.

**When Group Chats Are Created:**
- When you're matched with multiple roommates for group housing
- When discussing shared apartments or houses
- For coordinating move-in plans

**Group Chat Features:**
- Multiple participants (2-6 people typically)
- All participants can see all messages
- Compatibility information for the group
- Group-specific conversation topics

**Best Practices:**
- Be respectful to all group members
- Keep discussions relevant to housing
- Use @mentions if needed (if available)
- Be patient - group coordination takes time

**Leaving a Group Chat:**
- You can leave a group chat anytime
- Leaving won't affect your individual matches
- You can rejoin if invited again`,
          section: 'chat',
          tags: ['group chat', 'multiple roommates'],
          keywords: ['group chat', 'multiple people', 'group conversation'],
          relatedArticles: ['chat-basics', 'chat-safety'],
          type: 'article',
        },
        {
          id: 'chat-safety',
          title: 'Chat Safety Features',
          content: `Your safety is our priority. Here are the safety features in our chat system:

**Safety Features:**
1. **Text-Only Messaging**
   - No file sharing or external links allowed
   - Prevents malicious content and scams
   - Keeps conversations focused

2. **Rate Limiting**
   - Maximum 30 messages per 5 minutes
   - Prevents spam and harassment
   - Protects against abusive behavior

3. **Reporting System**
   - Report inappropriate messages or behavior
   - Click "Report" on any message or profile
   - Our team reviews all reports promptly

4. **Blocking Users**
   - Block any user you don't want to hear from
   - Blocked users cannot message you
   - Access from profile or chat menu

5. **Moderation**
   - Automated content filtering
   - Human moderation oversight
   - 24/7 safety team support

**What to Report:**
- Harassment or inappropriate behavior
- Suspicious or scam-like messages
- Requests for personal information
- Any behavior that makes you uncomfortable

**Getting Help:**
If you feel unsafe or need immediate assistance:
- Use the report button
- Contact our safety team at safety@domumatch.com
- In emergencies, contact local authorities`,
          section: 'chat',
          tags: ['safety', 'reporting', 'blocking'],
          keywords: ['safety', 'report', 'block', 'harassment'],
          relatedArticles: ['reporting-users', 'privacy-controls'],
          type: 'article',
        },
      ],
      faqs: [
        {
          id: 'faq-message-limit',
          title: 'Why is there a message limit?',
          content: `The rate limit (30 messages per 5 minutes) exists to:
- Prevent spam and harassment
- Protect all users from abuse
- Maintain a safe communication environment
- Comply with platform safety standards

If you need to send more messages, wait a few minutes between batches.`,
          section: 'chat',
          tags: ['rate limit', 'message limit'],
          keywords: ['message limit', 'rate limit', 'too many messages'],
          relatedArticles: ['chat-safety'],
          type: 'faq',
        },
        {
          id: 'faq-no-response',
          title: "What if someone doesn't respond?",
          content: `It's common for people to take time to respond. They may be:
- Busy with studies or work
- Considering their response
- Not actively checking messages

Wait a few days before following up. If there's no response after a week, you can:
- Send a polite follow-up message
- Focus on other matches
- Accept that they may not be interested

Remember: Not everyone will respond, and that's okay.`,
          section: 'chat',
          tags: ['no response', 'messaging'],
          keywords: ['not responding', 'no reply', 'ignored'],
          relatedArticles: ['chat-basics'],
          type: 'faq',
        },
        {
          id: 'faq-links-in-chat',
          title: 'Can I share links in chat?',
          content: `No, external links are not allowed in chat messages for safety reasons. This prevents:
- Phishing attempts
- Malicious websites
- Scam links
- Unwanted redirects

If you need to share information, describe it in your message or arrange to share it through other secure channels after establishing trust.`,
          section: 'chat',
          tags: ['links', 'safety'],
          keywords: ['share link', 'URL', 'website'],
          relatedArticles: ['chat-safety'],
          type: 'faq',
        },
      ],
    },
    {
      id: 'housing',
      title: 'Housing & Listings',
      description: 'Find and browse housing listings, use filters, and understand compatibility scores.',
      icon: '🏠',
      articles: [
        {
          id: 'browsing-listings',
          title: 'Browsing Housing Listings',
          content: `Our housing section helps you find verified accommodation options.

**Finding Listings:**
1. Navigate to the Housing section
2. Browse available listings in your area
3. Use filters to narrow down options
4. Click on listings to view full details

**What You'll See:**
- Property photos and details
- Rent and additional costs
- Location and proximity to campus
- Available dates and lease terms
- Property amenities
- Compatibility score (if you're logged in)

**Viewing Options:**
- **Split View**: Browse listings while viewing details
- **List View**: Scroll through listings in a list
- **Map View**: See listings on a map (if available)

**Listing Details Include:**
- Full address and location
- Room type and size
- Rent breakdown (rent, utilities, deposit)
- Move-in dates and lease duration
- Photos and virtual tours (if available)
- Landlord/agency information
- University verification status`,
          section: 'housing',
          tags: ['listings', 'browsing', 'housing'],
          keywords: ['find housing', 'listings', 'accommodation'],
          relatedArticles: ['using-filters', 'housing-compatibility'],
          type: 'article',
        },
        {
          id: 'using-filters',
          title: 'Using Search Filters',
          content: `Filters help you find housing that matches your preferences.

**Available Filters:**

**Location:**
- City or area
- Distance from campus
- Specific campus selection

**Price:**
- Minimum and maximum rent
- Utilities included/excluded
- Deposit amount

**Property Type:**
- Room types (single, shared, studio)
- Furnished or unfurnished
- Number of bedrooms/bathrooms

**Dates:**
- Move-in date range
- Lease duration (months)

**Features:**
- Pet-friendly
- Parking available
- Utilities included
- Accessibility features

**Compatibility:**
- Minimum compatibility score
- Lifestyle preferences
- Quiet hours preferences

**Using Filters:**
1. Click the "Filters" button
2. Adjust filters to match your preferences
3. See results update in real-time
4. Save your search for future reference
5. Clear filters to start over

**Saving Searches:**
Save your filter combination to receive notifications when new matching listings become available.`,
          section: 'housing',
          tags: ['filters', 'search'],
          keywords: ['filters', 'search', 'find'],
          relatedArticles: ['browsing-listings', 'housing-compatibility'],
          type: 'article',
        },
        {
          id: 'housing-compatibility',
          title: 'Housing Compatibility Scores',
          content: `Each listing shows a compatibility score based on your preferences.

**How It's Calculated:**
- Matches your housing preferences from onboarding
- Considers location, price range, and features
- Factors in lifestyle compatibility with current residents
- Accounts for move-in dates and lease terms

**Understanding the Score:**
- **90-100%**: Perfect match for your preferences
- **80-89%**: Very good fit with minor differences
- **70-79%**: Good option worth considering
- **Below 70%**: May not meet key preferences

**What the Score Shows:**
- Positive factors (what aligns well)
- Negative factors (potential concerns)
- Overall compatibility percentage

**Using Compatibility Scores:**
- Use as a starting point for evaluation
- Read the detailed breakdown
- Consider your flexibility
- Remember: scores are guides, not guarantees

**Improving Your Scores:**
- Update your housing preferences in settings
- Be flexible with location or budget
- Review and adjust your lifestyle preferences`,
          section: 'housing',
          tags: ['compatibility', 'scores', 'housing'],
          keywords: ['housing compatibility', 'match score', 'listing score'],
          relatedArticles: ['browsing-listings', 'using-filters'],
          type: 'article',
        },
      ],
      faqs: [
        {
          id: 'faq-verified-listings',
          title: 'What does "university verified" mean?',
          content: `University-verified listings have been:
- Confirmed by the university housing office
- Checked for legitimacy
- Verified for student eligibility
- Reviewed for safety and compliance

These listings are more trustworthy, but you should still exercise normal caution when viewing properties.`,
          section: 'housing',
          tags: ['verified', 'university'],
          keywords: ['verified', 'university verified', 'legitimate'],
          relatedArticles: ['browsing-listings'],
          type: 'faq',
        },
        {
          id: 'faq-contact-landlord',
          title: 'How do I contact a landlord?',
          content: `Contact options vary by listing:
- Some listings have direct contact information
- Others require you to apply through the platform
- University-verified listings may link to housing offices

Always use official channels and be cautious of:
- Requests for payment before viewing
- Suspicious contact information
- Requests for personal information beyond what's normal

Report any suspicious listings or behavior.`,
          section: 'housing',
          tags: ['contact', 'landlord'],
          keywords: ['contact landlord', 'reach out', 'inquire'],
          relatedArticles: ['browsing-listings', 'housing-safety'],
          type: 'faq',
        },
        {
          id: 'faq-save-search',
          title: 'How do I save a search?',
          content: `To save your current search filters:
1. Apply your desired filters
2. Click "Save Search" (if available)
3. Give your search a name
4. Receive notifications when new matching listings appear

Saved searches help you stay updated on new opportunities without manually checking regularly.`,
          section: 'housing',
          tags: ['save search', 'filters'],
          keywords: ['save search', 'saved filters', 'notifications'],
          relatedArticles: ['using-filters'],
          type: 'faq',
        },
      ],
    },
    {
      id: 'safety',
      title: 'Safety & Privacy',
      description: 'Learn about safety features, reporting, privacy controls, and data protection.',
      icon: '🛡️',
      articles: [
        {
          id: 'safety-features',
          title: 'Platform Safety Features',
          content: `We've built multiple layers of safety into the platform.

**Verification Requirements:**
- All users must verify with government ID
- University email verification required
- Selfie matching for identity confirmation
- Regular security checks

**Communication Safety:**
- Text-only messaging (no file sharing)
- Rate limiting to prevent spam
- Automated content filtering
- Human moderation oversight
- 24/7 safety team monitoring

**Profile Safety:**
- Verified users only
- Profile information verification
- Photo verification
- No anonymous users

**Reporting & Blocking:**
- Easy reporting from any profile or message
- Quick blocking of unwanted users
- Immediate action on safety reports
- Support team response within 24 hours

**Privacy Protection:**
- End-to-end encryption where applicable
- GDPR compliance
- Data minimization principles
- Secure data storage
- Regular security audits

**What to Do If You Feel Unsafe:**
1. Use the report button immediately
2. Block the user if needed
3. Contact safety@domumatch.com
4. In emergencies, contact local authorities (112 in Netherlands)

**Remember:**
- Never share personal financial information
- Don't send money before meeting in person
- Trust your instincts - if something feels off, report it
- We're here to help - don't hesitate to reach out`,
          section: 'safety',
          tags: ['safety', 'security', 'features'],
          keywords: ['safety', 'security', 'safe', 'protected'],
          relatedArticles: ['reporting-users', 'privacy-controls'],
          type: 'article',
        },
        {
          id: 'reporting-users',
          title: 'How to Report a User',
          content: `Reporting helps keep the platform safe for everyone.

**When to Report:**
- Harassment or inappropriate behavior
- Suspicious or scam-like activity
- Requests for personal information
- Threatening or abusive language
- Any behavior that makes you uncomfortable
- Fake profiles or impersonation

**How to Report:**

**From a Profile:**
1. Open the user's profile
2. Click "Report" or the three-dot menu
3. Select the reason for reporting
4. Add details (optional but helpful)
5. Submit the report

**From a Chat:**
1. Open the chat
2. Click "Report" on a specific message or the user
3. Select the reason
4. Add context if needed
5. Submit

**What Happens After Reporting:**
- Our safety team reviews within 24 hours
- The reported user may be restricted during review
- You'll receive an update on the outcome
- Serious violations result in immediate action

**Anonymity:**
- Reports are confidential
- The reported user won't know who reported them
- Your identity is protected

**Emergency Situations:**
If you're in immediate danger, contact local emergency services (112 in Netherlands) first, then report to us.`,
          section: 'safety',
          tags: ['report', 'safety', 'harassment'],
          keywords: ['report user', 'flag', 'complain', 'harassment'],
          relatedArticles: ['safety-features', 'blocking-users'],
          type: 'article',
        },
        {
          id: 'blocking-users',
          title: 'Blocking Users',
          content: `You can block any user to prevent further contact.

**How to Block:**
1. Open the user's profile or chat
2. Click "Block" or the three-dot menu
3. Confirm the block action

**What Blocking Does:**
- Blocks all messages from that user
- Hides their profile from your view
- Prevents them from seeing your profile
- Removes them from your match suggestions

**Unblocking:**
- You can unblock users from Settings
- Unblocking doesn't restore previous conversations
- Be cautious about unblocking - trust your instincts

**Blocking vs. Reporting:**
- **Blocking**: Stops contact but may not address the issue
- **Reporting**: Brings the issue to our attention for action
- You can do both: Block for immediate protection, report for platform safety

**After Blocking:**
- The user cannot contact you
- You won't see them in matches or search
- If they try to contact you, they'll get a message that you've blocked them`,
          section: 'safety',
          tags: ['block', 'blocking', 'safety'],
          keywords: ['block user', 'block', 'prevent contact'],
          relatedArticles: ['reporting-users', 'safety-features'],
          type: 'article',
        },
        {
          id: 'privacy-controls',
          title: 'Privacy Controls & GDPR Rights',
          content: `You have full control over your privacy and data.

**Privacy Settings:**
- Profile visibility controls
- Data sharing preferences
- Notification preferences
- Cookie preferences

**GDPR Rights:**
As a user in the EU, you have the right to:

1. **Access Your Data**
   - View all data we have about you
   - Download your data in JSON format
   - Request a copy of your information

2. **Rectify Your Data**
   - Update incorrect information
   - Modify your profile details
   - Correct any errors

3. **Erase Your Data**
   - Delete your account and all associated data
   - Request data deletion
   - Right to be forgotten

4. **Restrict Processing**
   - Limit how your data is used
   - Control data processing activities

5. **Data Portability**
   - Export your data
   - Transfer your data to another service

6. **Object to Processing**
   - Opt out of certain data uses
   - Object to automated decision-making

**Accessing Your Rights:**
- Go to Settings > Privacy
- Use the data export feature
- Request deletion from account settings
- Contact privacy@domumatch.com for assistance

**Data Retention:**
- Verification documents: 4 weeks (Dutch law requirement)
- Chat messages: 1 year after last message
- Profile data: Until account deletion
- See our Privacy Policy for full details`,
          section: 'safety',
          tags: ['privacy', 'GDPR', 'data'],
          keywords: ['privacy', 'GDPR', 'data protection', 'rights'],
          relatedArticles: ['safety-features', 'account-settings'],
          type: 'article',
        },
      ],
      faqs: [
        {
          id: 'faq-data-security',
          title: 'How is my data protected?',
          content: `We use multiple security measures:
- End-to-end encryption where applicable
- Secure data storage with industry-standard security
- Regular security audits and updates
- GDPR-compliant data handling
- Limited access to personal data (need-to-know basis)
- Secure third-party providers (Persona, Veriff)

Your data is never shared with other users or sold to third parties.`,
          section: 'safety',
          tags: ['security', 'data protection'],
          keywords: ['data security', 'protected', 'safe data'],
          relatedArticles: ['privacy-controls'],
          type: 'faq',
        },
        {
          id: 'faq-report-response',
          title: 'How quickly are reports reviewed?',
          content: `Our safety team reviews reports within 24 hours. However:
- Emergency or safety-critical reports are prioritized
- Serious violations may result in immediate action
- You'll receive an email update on the outcome
- All reports are taken seriously and investigated

If you need immediate assistance, contact safety@domumatch.com.`,
          section: 'safety',
          tags: ['report', 'response time'],
          keywords: ['report review', 'how long', 'response time'],
          relatedArticles: ['reporting-users'],
          type: 'faq',
        },
        {
          id: 'faq-delete-data',
          title: 'How do I delete my account and data?',
          content: `To delete your account:
1. Go to Settings > Privacy
2. Click "Delete Account"
3. Confirm the deletion
4. Your account will be deleted within 7 days (grace period)

Note: Some data may be retained for legal compliance:
- Verification documents: 4 weeks (Dutch law)
- Certain records for safety/legal purposes

Contact privacy@domumatch.com if you have questions.`,
          section: 'safety',
          tags: ['delete account', 'data deletion'],
          keywords: ['delete account', 'remove data', 'account deletion'],
          relatedArticles: ['privacy-controls'],
          type: 'faq',
        },
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Common issues and solutions to technical problems.',
      icon: '🔧',
      articles: [
        {
          id: 'troubleshooting-matches',
          title: 'Not Getting Matches',
          content: `If you're not receiving matches, try these solutions:

**Check Your Profile Completion:**
- Complete all required questionnaire sections
- Add a profile photo
- Fill in your bio
- Update your preferences

**Review Your Preferences:**
- Too many dealbreakers limit matches
- Very specific preferences reduce options
- Consider being more flexible
- Update your location or budget if needed

**Wait for Processing:**
- New accounts: Wait 24-48 hours after completing onboarding
- Matches are generated daily
- Check back tomorrow for new suggestions

**Check Your Settings:**
- Ensure your profile is set to visible
- Check notification settings
- Verify your account is fully verified

**Contact Support:**
If you've tried everything and still have no matches after a week, contact support@domumatch.com with:
- Your account email
- When you completed onboarding
- What you've already tried`,
          section: 'troubleshooting',
          tags: ['no matches', 'troubleshooting'],
          keywords: ['no matches', 'not getting matches', 'why no matches'],
          relatedArticles: ['improving-matches', 'troubleshooting-account'],
          type: 'article',
        },
        {
          id: 'troubleshooting-verification',
          title: 'Verification Issues',
          content: `Having trouble with verification? Here are common solutions:

**Email Verification:**
- Check spam/junk folder
- Wait 5 minutes for delivery
- Click "Resend verification email"
- Ensure you used your university email
- Contact support if still not received after 1 hour

**ID Verification Failures:**
- Ensure good lighting for photos
- Take clear, in-focus photos
- Make sure ID is fully visible
- Check that ID is not expired
- Ensure selfie matches your ID photo
- Try again with better quality photos

**Manual Review Delays:**
- Manual reviews can take up to 24 hours
- Weekends may have longer wait times
- You'll receive an email when verified
- Contact support if waiting more than 48 hours

**Verification Errors:**
- Clear your browser cache
- Try a different browser
- Use a different device if possible
- Ensure stable internet connection
- Contact support@domumatch.com for assistance`,
          section: 'troubleshooting',
          tags: ['verification', 'troubleshooting'],
          keywords: ['verification failed', 'verification error', 'can\'t verify'],
          relatedArticles: ['verification-process', 'troubleshooting-technical'],
          type: 'article',
        },
        {
          id: 'troubleshooting-chat',
          title: 'Chat Not Working',
          content: `If chat isn't working, try these solutions:

**Messages Not Sending:**
- Check your internet connection
- Refresh the page
- Check if you've hit the rate limit (30 messages/5 min)
- Wait a few minutes and try again
- Clear browser cache

**Messages Not Loading:**
- Refresh the page
- Check your internet connection
- Try a different browser
- Clear browser cache and cookies
- Log out and log back in

**Can't Start a Chat:**
- Ensure both users have accepted the match
- Check that you're both verified
- Verify your account status
- Try refreshing the page

**Other Issues:**
- If chat was blocked, contact support
- Check for browser updates
- Disable browser extensions temporarily
- Try incognito/private mode

**Still Not Working?**
Contact support@domumatch.com with:
- What specifically isn't working
- Your browser and device
- Any error messages
- Screenshots if possible`,
          section: 'troubleshooting',
          tags: ['chat', 'troubleshooting'],
          keywords: ['chat not working', 'messages not sending', 'chat error'],
          relatedArticles: ['chat-basics', 'troubleshooting-technical'],
          type: 'article',
        },
        {
          id: 'troubleshooting-technical',
          title: 'Technical Issues',
          content: `General technical troubleshooting steps:

**Page Not Loading:**
- Check your internet connection
- Try refreshing the page (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache and cookies
- Try a different browser
- Check if the site is down (status page)

**Slow Performance:**
- Close other browser tabs
- Clear browser cache
- Disable browser extensions
- Check your internet speed
- Try a different browser

**Login Issues:**
- Check your email and password
- Use "Forgot Password" if needed
- Clear browser cache
- Try incognito/private mode
- Ensure cookies are enabled

**Display Issues:**
- Refresh the page
- Clear browser cache
- Update your browser
- Check browser zoom level (should be 100%)
- Try a different browser

**Mobile Issues:**
- Update the app if using mobile app
- Try the mobile website instead
- Clear app cache/data
- Reinstall the app
- Check for app updates

**Still Having Issues?**
Contact support@domumatch.com with:
- Description of the issue
- Steps to reproduce
- Browser/device information
- Screenshots or error messages
- When the issue started`,
          section: 'troubleshooting',
          tags: ['technical', 'troubleshooting'],
          keywords: ['technical issues', 'not working', 'error', 'bug'],
          relatedArticles: ['troubleshooting-matches', 'troubleshooting-chat'],
          type: 'article',
        },
        {
          id: 'troubleshooting-account',
          title: 'Account Access Issues',
          content: `Having trouble accessing your account?

**Forgot Password:**
1. Click "Forgot Password" on the login page
2. Enter your university email address
3. Check your email for reset link
4. Create a new password
5. Log in with your new password

**Can't Log In:**
- Double-check your email and password
- Ensure you're using your university email
- Try resetting your password
- Clear browser cache
- Try a different browser
- Contact support if issues persist

**Account Locked:**
- Accounts may be temporarily locked for security
- Wait 15-30 minutes and try again
- Contact support if locked for longer
- Check your email for security notifications

**Email Changed:**
- You must verify the new email
- Check your email for verification link
- Contact support if you can't access the new email
- You cannot use a non-university email

**Two-Factor Authentication:**
- If enabled, you'll need your authentication code
- Use backup codes if you've lost access
- Contact support for account recovery

**Contact Support:**
For account access issues, contact support@domumatch.com with:
- Your university email address
- Description of the issue
- When you last successfully logged in`,
          section: 'troubleshooting',
          tags: ['account', 'login', 'access'],
          keywords: ['can\'t log in', 'forgot password', 'account locked'],
          relatedArticles: ['account-settings', 'troubleshooting-technical'],
          type: 'article',
        },
      ],
      faqs: [
        {
          id: 'faq-contact-support',
          title: 'How do I contact support?',
          content: `You can contact support:
- Email: support@domumatch.com
- Use the contact form on the website
- Report issues through the help center
- For safety issues: safety@domumatch.com
- For privacy: privacy@domumatch.com

Include as much detail as possible for faster resolution.`,
          section: 'troubleshooting',
          tags: ['support', 'contact'],
          keywords: ['contact support', 'help', 'support'],
          relatedArticles: [],
          type: 'faq',
        },
        {
          id: 'faq-response-time',
          title: 'How quickly does support respond?',
          content: `Response times vary:
- General inquiries: 24-48 hours
- Technical issues: 24 hours
- Safety/urgent: Within 24 hours (often faster)
- Privacy requests: 3-5 business days (GDPR requirement)

We aim to respond as quickly as possible. Complex issues may take longer.`,
          section: 'troubleshooting',
          tags: ['support', 'response'],
          keywords: ['response time', 'how long', 'support time'],
          relatedArticles: [],
          type: 'faq',
        },
      ],
    },
    {
      id: 'student-life',
      title: 'Student Life (Netherlands)',
      description: 'Tips and guides for student life, finding roommates, and navigating the Dutch housing market.',
      icon: '🇳🇱',
      articles: [
        {
          id: 'finding-roommates',
          title: 'Finding Roommates in the Netherlands',
          content: `Finding compatible roommates is crucial for a positive living experience.

**Why Use Domu Match:**
- Scientific compatibility matching
- Verified students only
- Safety-first platform
- Detailed compatibility insights
- University partnerships

**Traditional Methods vs. Domu Match:**

**Traditional Methods:**
- Facebook groups (unverified users, scams common)
- Student housing websites (no compatibility matching)
- University housing offices (limited options)
- Word of mouth (limited network)

**Domu Match Advantages:**
- Compatibility-based matching
- All users verified
- Safety features and reporting
- Detailed compatibility breakdowns
- Focus on long-term compatibility

**Tips for Success:**
- Be honest in your questionnaire
- Complete your profile fully
- Start conversations early
- Ask important questions upfront
- Meet in person (safely) before committing
- Discuss expectations and boundaries

**Red Flags to Watch For:**
- Requests for money before meeting
- Refusal to meet in person
- Vague or suspicious profiles
- Pressure to make quick decisions
- Requests for personal financial information`,
          section: 'student-life',
          tags: ['roommates', 'Netherlands', 'tips'],
          keywords: ['find roommates', 'roommate tips', 'living together'],
          relatedArticles: ['dutch-housing', 'roommate-agreements'],
          type: 'article',
        },
        {
          id: 'dutch-housing',
          title: 'Understanding the Dutch Housing Market',
          content: `Navigating the Dutch housing market can be challenging for international students.

**Market Characteristics:**
- High demand, especially in student cities
- Competitive rental market
- Typically unfurnished apartments
- Deposit usually 1-2 months rent
- Contracts often 6-12 months minimum

**Student Cities:**
- **Amsterdam**: Highest prices, most competitive
- **Utrecht**: Good balance, student-friendly
- **Rotterdam**: Affordable, growing student scene
- **Groningen**: Very student-friendly, lower prices
- **Eindhoven**: Tech-focused, moderate prices
- **Leiden/Delft**: Smaller, traditional university towns

**Housing Types:**
- **Student Housing**: University-managed, limited availability
- **Shared Apartments**: Most common for students
- **Studio Apartments**: Private but expensive
- **Anti-squat**: Temporary, very cheap but unstable

**Cost Expectations:**
- Single room in shared apartment: €400-700/month
- Studio apartment: €600-1200/month
- Utilities: €100-200/month (if not included)
- Internet: €30-50/month
- Deposit: 1-2 months rent

**Tips:**
- Start searching early (2-3 months before)
- Be flexible with location
- Consider suburbs for better prices
- Have documents ready (ID, proof of enrollment, income proof)
- Watch out for scams (see safety tips)

**Important Documents:**
- Valid ID (passport or ID card)
- Proof of enrollment
- Income proof (scholarship, loan, or job contract)
- Sometimes: guarantor information`,
          section: 'student-life',
          tags: ['housing', 'Netherlands', 'market'],
          keywords: ['Dutch housing', 'housing market', 'rental market'],
          relatedArticles: ['finding-roommates', 'moving-tips'],
          type: 'article',
        },
        {
          id: 'roommate-agreements',
          title: 'Creating Roommate Agreements',
          content: `A clear roommate agreement prevents conflicts and sets expectations.

**What to Include:**

**Financial Responsibilities:**
- Rent split (equal or based on room size)
- Utilities and internet costs
- Shared expenses (cleaning supplies, toilet paper)
- Payment schedule and method
- What happens if someone can't pay

**Household Rules:**
- Cleaning schedule and responsibilities
- Quiet hours
- Guest policies (overnight guests, parties)
- Shared space usage
- Kitchen and bathroom etiquette

**Personal Boundaries:**
- Privacy expectations
- Personal space and belongings
- Borrowing policies
- Communication preferences

**Conflict Resolution:**
- How to address issues
- Regular check-ins or house meetings
- Mediation process if needed

**Practical Tips:**
- Write it down (even if informal)
- Discuss before moving in
- Be flexible and open to compromise
- Review and update as needed
- Keep a copy for everyone

**Sample Topics:**
- Cleaning rotation (weekly/monthly)
- Noise levels and quiet hours
- Overnight guests (how often, advance notice)
- Shared groceries vs. separate
- Bills and payment responsibility
- Move-out procedures

**Remember:**
- Agreements should be fair to everyone
- Communication is key
- Be willing to compromise
- Address issues early, before they escalate`,
          section: 'student-life',
          tags: ['agreements', 'roommates', 'living together'],
          keywords: ['roommate agreement', 'house rules', 'living together'],
          relatedArticles: ['finding-roommates', 'cultural-tips'],
          type: 'article',
        },
        {
          id: 'moving-tips',
          title: 'Moving Tips for Students',
          content: `Moving to a new place can be stressful. Here are tips to make it easier.

**Before Moving:**
- Plan your move date (usually 1st of the month)
- Arrange transportation (rental van, friends with cars)
- Pack systematically (label boxes by room)
- Take inventory of your belongings
- Arrange internet/utilities transfer
- Change your address with university, bank, etc.

**Moving Day:**
- Start early in the day
- Have snacks and drinks ready
- Keep important items separate (documents, phone charger)
- Take photos of the empty apartment (condition report)
- Test all appliances and fixtures
- Get keys and copies made

**After Moving In:**
- Unpack essentials first (bed, bathroom, kitchen basics)
- Set up internet and utilities
- Meet your roommates properly
- Familiarize yourself with the area
- Register at the new address (required in Netherlands)
- Update your address with all services

**Setting Up Your Room:**
- Measure space before buying furniture
- Check what's included (bed, desk, wardrobe)
- Consider IKEA or second-hand stores for furniture
- Make it feel like home (photos, plants, etc.)

**Registering Your Address:**
- Required within 5 days of moving
- Visit the municipality (Gemeente) office
- Bring ID and rental contract
- Free service, but appointments may be needed

**Budgeting:**
- Moving costs (van, supplies)
- Furniture and essentials
- Deposit (usually 1-2 months rent)
- First month's rent
- Utilities setup fees
- Groceries and basics

**Pro Tips:**
- Start packing early (spread it over days)
- Use suitcases for clothes
- Take photos before moving (in case of damage claims)
- Label everything clearly
- Ask roommates about shared items before buying`,
          section: 'student-life',
          tags: ['moving', 'tips', 'Netherlands'],
          keywords: ['moving tips', 'moving in', 'relocation'],
          relatedArticles: ['dutch-housing', 'cultural-tips'],
          type: 'article',
        },
        {
          id: 'cultural-tips',
          title: 'Cultural Tips for International Students',
          content: `Adjusting to life in the Netherlands as an international student.

**Dutch Culture:**
- Direct communication (not rude, just honest)
- Punctuality is important
- Equality and informality
- Work-life balance is valued
- Cycling is the primary mode of transport

**Communication Style:**
- Dutch people are direct - don't take it personally
- "No" means no, not maybe
- Small talk is less common
- Be straightforward in your communication

**Language:**
- Most Dutch people speak excellent English
- Learning some Dutch is appreciated
- "Dank je" (thank you), "Alsjeblieft" (please/you're welcome)
- Many courses are in English

**Social Life:**
- Join student associations
- Participate in university events
- Make friends in your program
- Explore the city and country
- Join expat/international groups

**Living with Dutch Roommates:**
- Discuss expectations openly
- Be direct about issues
- Respect their routines and habits
- Participate in household responsibilities
- Don't be afraid to ask questions

**Practical Tips:**
- Get a bike (essential for student life)
- Learn about the public transport system (OV-chipkaart)
- Open a Dutch bank account
- Get health insurance (mandatory)
- Learn basic Dutch phrases

**Important Services:**
- **GP (Doctor)**: Register with a local doctor
- **Bank Account**: Needed for many services
- **Health Insurance**: Mandatory, compare options
- **Public Transport**: Get an OV-chipkaart
- **Phone**: Consider local SIM or international plan

**Money Matters:**
- Tipping is not expected (rounding up is fine)
- Split bills evenly ("going Dutch")
- Student discounts available (CJP card)
- Budget carefully (Netherlands can be expensive)

**Food Culture:**
- Dutch cuisine is simple
- Lunch is often bread with toppings
- Dinner is typically around 6 PM
- Many international food options available
- Grocery shopping: Albert Heijn, Jumbo, Lidl

**Making Friends:**
- Join university clubs and societies
- Participate in orientation events
- Be open to new experiences
- Don't be afraid to initiate conversations
- Join language exchange programs`,
          section: 'student-life',
          tags: ['culture', 'international', 'Netherlands'],
          keywords: ['cultural tips', 'international student', 'Dutch culture'],
          relatedArticles: ['finding-roommates', 'moving-tips'],
          type: 'article',
        },
      ],
      faqs: [
        {
          id: 'faq-housing-scams',
          title: 'How can I avoid housing scams?',
          content: `Red flags to watch for:
- Requests for money before viewing
- Too-good-to-be-true prices
- Pressure to decide quickly
- Requests for personal/financial info upfront
- Owner "abroad" and can't meet
- No rental contract or vague terms

Always: View in person, verify landlord identity, use official contracts, never pay before signing.`,
          section: 'student-life',
          tags: ['scams', 'safety', 'housing'],
          keywords: ['scams', 'fraud', 'avoid scams'],
          relatedArticles: ['dutch-housing', 'safety-features'],
          type: 'faq',
        },
        {
          id: 'faq-bank-account',
          title: 'Do I need a Dutch bank account?',
          content: `It's highly recommended because:
- Many landlords require it for rent
- Easier for utilities and subscriptions
- Required for some services
- Avoids international transfer fees

Major banks: ING, ABN AMRO, Rabobank. Bring ID, proof of enrollment, and sometimes proof of address.`,
          section: 'student-life',
          tags: ['bank account', 'Netherlands'],
          keywords: ['bank account', 'Dutch bank', 'banking'],
          relatedArticles: ['cultural-tips', 'moving-tips'],
          type: 'faq',
        },
        {
          id: 'faq-health-insurance',
          title: 'Do I need health insurance?',
          content: `Yes, health insurance is mandatory in the Netherlands. Options:
- Basic Dutch insurance (~€100-120/month)
- International student insurance
- EU Health Insurance Card (if from EU, temporary)

Compare options and choose based on your needs and stay duration.`,
          section: 'student-life',
          tags: ['health insurance', 'Netherlands'],
          keywords: ['health insurance', 'insurance', 'mandatory'],
          relatedArticles: ['cultural-tips'],
          type: 'faq',
        },
      ],
    },
  ],
  nl: [
    // Dutch translations would go here - for now, using English content
    // In production, these should be fully translated
    {
      id: 'getting-started',
      title: 'Aan de slag',
      description: 'Nieuw bij Domu Match? Begin hier om de basis te leren.',
      icon: '🚀',
      articles: [],
      faqs: [],
    },
  ],
}

/**
 * Get all articles across all sections
 */
export function getAllArticles(locale: 'en' | 'nl' = 'en'): HelpArticle[] {
  const sections = helpContent[locale]
  const articles: HelpArticle[] = []
  
  for (const section of sections) {
    articles.push(...section.articles, ...section.faqs)
  }
  
  return articles
}

/**
 * Get article by ID
 */
export function getArticleById(id: string, locale: 'en' | 'nl' = 'en'): HelpArticle | undefined {
  return getAllArticles(locale).find(article => article.id === id)
}

/**
 * Get section by ID
 */
export function getSectionById(id: string, locale: 'en' | 'nl' = 'en'): HelpSection | undefined {
  return helpContent[locale].find(section => section.id === id)
}

/**
 * Get articles by section
 */
export function getArticlesBySection(sectionId: string, locale: 'en' | 'nl' = 'en'): HelpArticle[] {
  const section = getSectionById(sectionId, locale)
  if (!section) return []
  
  return [...section.articles, ...section.faqs]
}

