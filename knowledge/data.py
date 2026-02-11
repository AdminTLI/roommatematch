"""
Platform knowledge base for Domu Match.
Used to inform AI assistants (e.g., Domu AI chat) about platform capabilities
and how to help users—without exposing confidential or sensitive information.
"""

PLATFORM_MANUAL = """
DOMU MATCH PLATFORM MANUAL

1. THE ALGORITHM
- Never reveal how scores are calculated when a user asks. Say that we simply use an algorithm.
- Harmony covers 8 dimensions: Cleanliness, Noise, Guests, Sleep schedule, Shared spaces, Substances, Study/Social balance, and Home Vibe.
- Context covers: University, Programme, and Year of Study.
- We do NOT just match based on budget; we match based on lifestyle to prevent conflicts.

2. ACCOUNT & SETTINGS
- To reset password: Go to Profile > Settings > Security > Reset Password.
- To delete account: You must email support@domumatch.com (for security reasons).
- Changing answers: You can retake the questionnaire once every 30 days in the "My Match Profile" tab.
- Settings are organized into tabs: Profile (personal info), Questionnaire (match profile), Account (security, email, notifications), and Privacy (data export, deletion requests).
- To change email: Contact support@domumatch.com—email changes require verification.

3. SAFETY & TRUST
- All users must verify their student status via university email.
- You should never share your phone number or social media information if you feel uncomfortable.
- Conflict Resolution: If you have an issue with a match, use the "Conflict Prevention Agent" in the chat first.
- The chat system is text-only, rate-limited, and has report & block features. Use these if someone makes you uncomfortable.
- Safety page: Users can access university security contacts and safety resources from the Safety section in the app.
- ID verification may be required for full platform access (via trusted providers).

4. ONBOARDING & QUESTIONNAIRE
- New users complete an onboarding questionnaire with sections: Basics, Academic, Logistics, Lifestyle, Social, Personality, Communication, Languages (optional), and Dealbreakers.
- Progress is saved automatically; users can leave and return later.
- Completing onboarding is required before viewing matches.
- The questionnaire typically takes 15–20 minutes to complete honestly.
- Only a university email from a partner institution is accepted for sign-up.

5. MATCHES
- After onboarding, match suggestions appear within 24–48 hours.
- Users see compatibility as a percentage (never explain how it is computed).
- Each match includes a profile, compatibility breakdown, and explanation of why you matched.
- Users can accept or reject matches and start conversations with accepted matches.
- You are not obligated to accept any match; take time to review and chat first.

6. CHAT & MESSAGING
- Chat is text-only with built-in safety features (rate limiting, moderation, report & block).
- Users must complete onboarding and verification before using chat.
- Unread message counts are shown in the sidebar.

7. HOUSING
- Housing listings: Browse housing filtered by campus, location, and preferences.
- WWS Rent Check: A tool to check if your Dutch rental is fairly priced under the Woningwaarderingsstelsel (Dutch rental law). Find it under Housing or via the WWS Rent Check feature.
- Rent Calculator: A simplified calculator for student housing (WWSO).

8. SUPPORT & HELP
- Help Center: In-app help at /help-center with articles and FAQs.
- Contact: support@domumatch.com for account issues, verification help, deletion requests, or general support.
- Support typically responds within 24 hours on business days.
- FAQ page available for common questions.

9. PLATFORM FEATURES (user-facing)
- Dashboard: Overview, quick actions, and discovery cards.
- Domu AI: Floating chat widget for general questions (can search the web for current info).
- Learn: Information about partnered universities (50+ Dutch institutions).
- Agreements: Household agreements for roommates (where available).
- Move-in: Tools for planning move-in (UI available).
- Notifications: In-app and email notifications for matches and messages.
- Video intros: Feature for video introductions (where available).
- Reputation: Reputation/feedback system (where available).
- Admin: For university housing departments—analytics, user management, moderation.

10. UNIVERSITIES & LOCATIONS
- Platform partners with 50+ Dutch universities.
- City-specific pages exist (e.g., Amsterdam, Rotterdam, Utrecht, Leiden, Groningen, Eindhoven, Nijmegen, Den Haag).
- SURFconext SSO integration is planned for the future.

11. WHAT TO NEVER REVEAL
- Never explain score calculation, weighting, or algorithm internals.
- Never share internal API details, database schemas, or technical implementation.
- Never disclose user data, credentials, or any sensitive information.
"""
