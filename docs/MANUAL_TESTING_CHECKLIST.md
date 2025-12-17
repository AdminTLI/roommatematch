# Manual Testing Checklist

This document provides a comprehensive checklist for manual testing before launch.

## Pre-Testing Setup

- [x] Clear browser cache and cookies
- [x] Test in incognito/private browsing mode
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on multiple devices (iPhone SE, iPhone 14 Pro, iPad, Desktop)
- [x] Verify all environment variables are set correctly

## Authentication Flows

### Sign Up
- [ ] New user can sign up with valid email and password
- [ ] Password requirements are enforced (min length, etc.)
- [ ] Age verification checkbox works
- [ ] Email verification email is sent
- [ ] User cannot access protected routes before email verification
- [ ] Error messages are user-friendly

### Sign In
- [x] Existing user can sign in with correct credentials
- [x] Sign in fails with incorrect password (shows friendly error)
- [ ] Sign in fails with non-existent email (shows friendly error)
- [ ] Email verification is checked on sign in
- [x] User is redirected to dashboard after successful sign in

### Email Verification
- [ ] Verification email is received
- [ ] Verification link works and redirects correctly
- [ ] User can access protected routes after verification
- [ ] Expired verification links show appropriate error
- [ ] Already verified users see appropriate message

### Password Reset
- [ ] Password reset email is sent
- [ ] Reset link works
- [ ] User can set new password
- [ ] User can sign in with new password

## Onboarding Flow

### Questionnaire Completion
- [ ] User is redirected to onboarding if not completed
- [ ] All sections can be navigated
- [ ] Progress is saved when navigating between sections
- [ ] Form validation works (required fields, etc.)
- [ ] User can submit completed questionnaire
- [ ] Submission redirects to appropriate page
- [ ] Incomplete questionnaire shows appropriate message

### Profile Data
- [ ] University selection works
- [ ] Programme selection works
- [ ] All questionnaire answers are saved correctly
- [ ] User can return and update answers

## Match Suggestions

### Viewing Matches
- [x] Matches page loads correctly
- [x] Match suggestions are displayed
- [ ] Pagination works (Load More button)
- [x] Empty state shows when no matches
- [x] Match cards display correctly
- [x] Compatibility scores are shown
- [x] Match explanations are readable

### Match Actions
- [x] User can accept a match
- [x] User can decline a match
- [x] Accepted matches move to "Pending" tab
- [x] Confirmed matches move to "Confirmed" tab
- [x] Declined matches move to "History" tab
- [ ] Multiple matches can be selected (for confirmed matches)
- [ ] Group chat can be created from confirmed matches

### Match Refresh
- [x] Refresh button works
- [ ] Rate limiting prevents spam (1 per 5 minutes)
- [ ] Appropriate error message shown when rate limited

## Chat Functionality

### Chat List
- [x] Chat list loads correctly
- [x] Unread message counts are accurate
- [x] Chat list updates in real-time
- [x] User can navigate to a chat

### Chat Interface
- [x] Messages load correctly (last 50 initially)
- [ ] "Load Older Messages" button works
- [ ] New messages appear in real-time
- [ ] Message bubbles display correctly
- [ ] Sender names are shown
- [ ] Timestamps are accurate
- [ ] Read receipts work (checkmarks)
- [ ] Typing indicators work
- [ ] Online status is shown

### Sending Messages
- [ ] User can type and send messages
- [ ] Message appears immediately (optimistic update)
- [ ] Message is sent successfully
- [ ] Rate limiting works (30 messages per 5 minutes)
- [ ] Error messages are user-friendly
- [ ] Input is cleared after sending

### Message Search
- [x] Cmd/Ctrl+K opens search dialog
- [x] Search finds messages correctly
- [x] Search highlights matching text
- [x] Keyboard navigation works (↑↓ arrows, Enter)
- [ ] Selecting a message scrolls to it

### Chat Actions
- [ ] User can block another user (1-on-1 chats)
- [ ] User can report another user
- [ ] User can delete conversation
- [ ] User can leave group chat
- [ ] Compatibility panel opens correctly
- [ ] Group compatibility is shown (group chats)

### Mobile Responsiveness
- [ ] Chat interface works on iPhone SE (375px)
- [ ] Chat interface works on iPhone 14 Pro (390px)
- [ ] Chat interface works on iPad (768px)
- [ ] Chat interface works on Desktop (1920px)
- [ ] Message bubbles don't overflow
- [ ] Input area is accessible (keyboard doesn't cover it)
- [ ] Touch targets are at least 44x44px
- [ ] No horizontal scrolling

## Admin Features

### Admin Access
- [ ] Non-admin users are redirected from /admin routes
- [ ] Admin users can access admin routes
- [ ] Middleware protection works correctly

### Admin Dashboard
- [ ] Dashboard loads correctly
- [ ] Metrics are displayed
- [ ] Charts/graphs render correctly

## Profile & Settings

### Profile Updates
- [ ] User can update first name
- [ ] User can update last name
- [ ] User can update phone number
- [ ] Phone number validation works
- [ ] User can update bio
- [ ] Bio character limit is enforced (500 chars)
- [ ] Validation errors are user-friendly
- [ ] Changes are saved successfully

## Error Handling

### Network Errors
- [ ] Offline state is handled gracefully
- [ ] Connection errors show friendly messages
- [ ] Retry mechanisms work

### API Errors
- [ ] 401 errors redirect to sign in
- [ ] 403 errors show appropriate message
- [ ] 404 errors show appropriate message
- [ ] 500 errors show user-friendly message
- [ ] Rate limit errors show retry-after time

### Form Validation
- [ ] Required fields are validated
- [ ] Format validation works (email, phone, etc.)
- [ ] Error messages are clear and actionable
- [ ] Validation happens on submit

## Performance

### Loading States
- [ ] Loading skeletons appear during data fetch
- [ ] Loading states don't flash
- [ ] Empty states are shown appropriately

### Pagination
- [ ] Match pagination works correctly
- [ ] Chat message pagination works correctly
- [ ] "Load More" buttons work
- [ ] Pagination metadata is accurate

## Security

### Authentication
- [ ] Protected routes require authentication
- [ ] Email verification is enforced
- [ ] Session expires appropriately
- [ ] CSRF protection works

### Authorization
- [ ] Users can only see their own data
- [ ] Admin routes are protected
- [ ] RLS policies work correctly

### Data Privacy
- [ ] Sensitive data is not logged
- [ ] Error messages don't expose sensitive info
- [ ] User data is not exposed in URLs

## Browser Compatibility

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] iOS Safari (iPhone SE, iPhone 14 Pro)
- [ ] iOS Safari (iPad)
- [ ] Chrome Mobile (Android)

## Accessibility

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Keyboard shortcuts work (Cmd+K, Esc, Enter)

### Screen Readers
- [ ] ARIA labels are present
- [ ] Alt text for images
- [ ] Form labels are associated
- [ ] Error messages are announced

### Color Contrast
- [ ] Text is readable in light mode
- [ ] Text is readable in dark mode
- [ ] Interactive elements have sufficient contrast

## Dark Mode

### Theme Toggle
- [ ] Theme toggle is visible in header
- [ ] Theme switches correctly
- [ ] Theme persists across page reloads
- [ ] All components support dark mode

### Visual Consistency
- [ ] No color issues in dark mode
- [ ] Images/icons are visible in both modes
- [ ] Borders and shadows work in both modes

## Real-time Features

### Chat Updates
- [ ] New messages appear without refresh
- [ ] Typing indicators update in real-time
- [ ] Online status updates in real-time
- [ ] Read receipts update in real-time

### Connection Status
- [ ] Connection status is shown
- [ ] Reconnection works automatically
- [ ] Error messages are shown when disconnected

## Edge Cases

### Empty States
- [ ] No matches shows empty state
- [ ] No messages shows empty state
- [ ] No chats shows empty state
- [ ] Empty states have actionable next steps

### Large Data
- [ ] Many matches load correctly (pagination)
- [ ] Many messages load correctly (pagination)
- [ ] Performance is acceptable with large datasets

### Concurrent Actions
- [ ] Multiple tabs work correctly
- [ ] Actions in one tab reflect in others
- [ ] No race conditions

## Final Checks

- [ ] All critical flows work end-to-end
- [ ] No console errors in production build
- [ ] No TypeScript errors (if strict mode enabled)
- [ ] No ESLint errors (if strict mode enabled)
- [ ] Build succeeds without warnings
- [ ] All environment variables are set
- [ ] Rate limiting is configured
- [ ] Database indexes are created
- [ ] Error tracking is working (Sentry)
- [ ] Analytics are working (Vercel Analytics)

## Device-Specific Tests

### iPhone SE (375px width)
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Forms are usable
- [ ] Chat interface works
- [ ] No horizontal scrolling

### iPhone 14 Pro (390px width)
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Forms are usable
- [ ] Chat interface works

### iPad (768px width)
- [ ] Layout adapts correctly
- [ ] Sidebar works (if applicable)
- [ ] Touch targets are appropriate

### Desktop (1920px width)
- [ ] Layout uses available space
- [ ] No excessive whitespace
- [ ] All features are accessible

## Notes

- Test each item systematically
- Document any bugs found
- Test fixes before marking as complete
- Re-test after each fix to ensure no regressions










