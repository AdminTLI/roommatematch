// English translations for Roommate Match

export const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    continue: 'Continue',
    submit: 'Submit',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    open: 'Open',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    apply: 'Apply',
    reset: 'Reset',
    retry: 'Retry',
    skip: 'Skip',
    optional: 'Optional',
    required: 'Required',
    all: 'All',
    none: 'None',
    select: 'Select',
    choose: 'Choose',
    upload: 'Upload',
    download: 'Download',
    share: 'Share',
    copy: 'Copy',
    copied: 'Copied!',
    online: 'Online',
    offline: 'Offline',
    verified: 'Verified',
    pending: 'Pending',
    rejected: 'Rejected',
    accepted: 'Accepted'
  },

  // Navigation
  nav: {
    home: 'Home',
    matches: 'Matches',
    chat: 'Chat',
    forum: 'Forum',
    profile: 'Profile',
    settings: 'Settings',
    admin: 'Admin',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    language: 'Language'
  },

  // Authentication
  auth: {
    signIn: {
      title: 'Welcome back',
      subtitle: 'Sign in to your account',
      email: 'Email address',
      password: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot your password?',
      signInButton: 'Sign In',
      noAccount: "Don't have an account?",
      signUpLink: 'Sign up here',
      ssoButton: 'Sign in with your university account',
      magicLinkButton: 'Send magic link',
      magicLinkSent: 'Magic link sent! Check your email.',
      errors: {
        invalidCredentials: 'Invalid email or password',
        emailRequired: 'Email is required',
        passwordRequired: 'Password is required',
        emailInvalid: 'Please enter a valid email address',
        tooManyRequests: 'Too many attempts. Please try again later.',
        accountNotFound: 'No account found with this email',
        accountDisabled: 'Your account has been disabled'
      }
    },
    signUp: {
      title: 'Create your account',
      subtitle: 'Join thousands of students finding their perfect roommate',
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      agreeToTerms: 'I agree to the Terms of Service and Privacy Policy',
      signUpButton: 'Create Account',
      haveAccount: 'Already have an account?',
      signInLink: 'Sign in here',
      universityEmail: 'Use your university email for faster verification',
      errors: {
        emailRequired: 'Email is required',
        passwordRequired: 'Password is required',
        passwordTooShort: 'Password must be at least 8 characters',
        passwordsDoNotMatch: 'Passwords do not match',
        emailInvalid: 'Please enter a valid email address',
        emailAlreadyExists: 'An account with this email already exists',
        termsRequired: 'You must agree to the terms and conditions',
        universityEmailRequired: 'Please use your university email address'
      }
    },
    resetPassword: {
      title: 'Reset your password',
      subtitle: 'Enter your email address and we\'ll send you a link to reset your password',
      email: 'Email address',
      resetButton: 'Send reset link',
      backToSignIn: 'Back to sign in',
      linkSent: 'Password reset link sent! Check your email.',
      errors: {
        emailRequired: 'Email is required',
        emailInvalid: 'Please enter a valid email address',
        emailNotFound: 'No account found with this email'
      }
    },
    callback: {
      title: 'Signing you in...',
      success: 'Successfully signed in!',
      error: 'Sign in failed. Please try again.',
      redirecting: 'Redirecting...'
    }
  },

  // ID Verification
  verification: {
    title: 'Identity Verification',
    subtitle: 'We need to verify your identity to keep our community safe',
    steps: {
      selfie: {
        title: 'Take a selfie',
        description: 'Take a clear selfie for identity verification',
        instructions: 'Look directly at the camera and ensure good lighting',
        takePhoto: 'Take Photo',
        retakePhoto: 'Retake Photo',
        usePhoto: 'Use This Photo',
        errors: {
          noCamera: 'Camera not available',
          permissionDenied: 'Camera permission denied',
          photoRequired: 'Please take a selfie'
        }
      },
      idDocument: {
        title: 'Upload ID Document',
        description: 'Upload a clear photo of your government-issued ID',
        instructions: 'Make sure the document is clearly visible and not blurry',
        frontSide: 'Front Side',
        backSide: 'Back Side',
        uploadFront: 'Upload Front',
        uploadBack: 'Upload Back',
        errors: {
          fileRequired: 'Please upload your ID document',
          fileTooLarge: 'File size too large (max 10MB)',
          invalidFormat: 'Invalid file format. Please use JPG or PNG.',
          documentNotClear: 'Document image is not clear enough'
        }
      },
      review: {
        title: 'Review and Submit',
        description: 'Review your information before submitting for verification',
        selfiePreview: 'Selfie',
        idPreview: 'ID Document',
        submitButton: 'Submit for Verification',
        processing: 'Processing your verification...',
        estimatedTime: 'Verification usually takes 1-2 hours'
      },
      status: {
        title: 'Verification Status',
        pending: {
          title: 'Verification Pending',
          description: 'Your documents are being reviewed. We\'ll notify you once verification is complete.',
          estimatedTime: 'This usually takes 1-2 hours',
          checkAgain: 'Check Again'
        },
        verified: {
          title: 'Verification Complete!',
          description: 'Your identity has been successfully verified. You can now access all features.',
          continueButton: 'Continue to App'
        },
        failed: {
          title: 'Verification Failed',
          description: 'We couldn\'t verify your identity. Please try again with clearer documents.',
          retryButton: 'Try Again',
          contactSupport: 'Contact Support',
          commonReasons: 'Common reasons for failure:',
          reasons: [
            'Document image is blurry or unclear',
            'Document is expired or invalid',
            'Selfie doesn\'t match the document photo',
            'Document type is not supported'
          ]
        }
      }
    },
    privacy: {
      title: 'Privacy & Security',
      description: 'Your personal information is encrypted and stored securely. We only use it for verification purposes and never share it with third parties.',
      gdpr: 'Learn more about our GDPR compliance'
    }
  },

  // Questionnaire
  questionnaire: {
    title: 'Tell us about yourself',
    subtitle: 'Help us find your perfect roommate match',
    progress: 'Step {current} of {total}',
    timeEstimate: 'This will take about {minutes} minutes',
    sections: {
      basics: {
        title: 'Basic Information',
        description: 'Tell us about your academic background and housing preferences',
        degreeLevel: 'Degree Level',
        program: 'Program/Field of Study',
        campus: 'Campus',
        moveInWindow: 'When do you plan to move in?',
        degreeOptions: {
          bachelor: 'Bachelor\'s',
          master: 'Master\'s',
          phd: 'PhD',
          exchange: 'Exchange Student',
          other: 'Other'
        },
        moveInOptions: {
          immediate: 'Immediately',
          withinMonth: 'Within a month',
          within3Months: 'Within 3 months',
          flexible: 'Flexible'
        }
      },
      logistics: {
        title: 'Housing Preferences',
        description: 'Share your budget and location preferences',
        budgetMin: 'Minimum budget (€/month)',
        budgetMax: 'Maximum budget (€/month)',
        commuteMax: 'Maximum commute time (minutes)',
        leaseLength: 'Preferred lease length',
        roomType: 'Room type preference',
        leaseOptions: {
          '3_months': '3 months',
          '6_months': '6 months',
          '12_months': '12 months',
          flexible: 'Flexible'
        },
        roomTypeOptions: {
          single: 'Single room',
          shared: 'Shared room',
          studio: 'Studio apartment',
          flexible: 'Flexible'
        }
      },
      lifestyle: {
        title: 'Lifestyle & Habits',
        description: 'Help us understand your daily routines and preferences',
        sleepStart: 'What time do you usually go to sleep?',
        sleepEnd: 'What time do you usually wake up?',
        studyIntensity: 'How much do you study at home?',
        cleanlinessRoom: 'How important is a clean room?',
        cleanlinessKitchen: 'How important is a clean kitchen?',
        noiseTolerance: 'How much noise can you tolerate?',
        guestsFrequency: 'How often do you have guests?',
        partiesFrequency: 'How often do you host parties?',
        choresPreference: 'How do you prefer to handle chores?',
        alcoholAtHome: 'How do you feel about alcohol at home?',
        petsTolerance: 'How do you feel about pets?',
        scales: {
          '0': 'Not at all',
          '1': 'Very little',
          '2': 'A little',
          '3': 'Somewhat',
          '4': 'Moderately',
          '5': 'Fairly',
          '6': 'Quite a bit',
          '7': 'Very much',
          '8': 'Extremely',
          '9': 'Absolutely',
          '10': 'Essential'
        }
      },
      social: {
        title: 'Social Preferences',
        description: 'Tell us about your social preferences at home',
        socialLevel: 'How social do you like to be at home?',
        foodSharing: 'How do you feel about sharing food?',
        utensilsSharing: 'How do you feel about sharing utensils/kitchen items?',
        socialSlider: {
          quiet: 'Quiet & Private',
          social: 'Social & Open'
        }
      },
      personality: {
        title: 'Personality',
        description: 'Help us understand your personality traits',
        extraversion: 'How outgoing and social are you?',
        agreeableness: 'How cooperative and trusting are you?',
        conscientiousness: 'How organized and responsible are you?',
        neuroticism: 'How easily do you get stressed or anxious?',
        openness: 'How open are you to new experiences?',
        traits: {
          extraversion: {
            low: 'Prefer quiet, intimate settings',
            high: 'Enjoy being around people and socializing'
          },
          agreeableness: {
            low: 'Value independence and directness',
            high: 'Value cooperation and harmony'
          },
          conscientiousness: {
            low: 'Flexible and spontaneous',
            high: 'Organized and plan ahead'
          },
          neuroticism: {
            low: 'Calm and emotionally stable',
            high: 'Experience emotions intensely'
          },
          openness: {
            low: 'Prefer familiar routines and ideas',
            high: 'Enjoy new experiences and ideas'
          }
        }
      },
      communication: {
        title: 'Communication Style',
        description: 'How do you prefer to communicate and resolve conflicts?',
        conflictStyle: 'How do you handle conflicts?',
        communicationPreference: 'How do you prefer to communicate?',
        styles: {
          conflict: {
            avoid: 'Avoid conflicts',
            accommodate: 'Accommodate others',
            compromise: 'Compromise',
            collaborate: 'Collaborate to find solutions',
            compete: 'Stand firm on your position'
          },
          communication: {
            direct: 'Direct and straightforward',
            diplomatic: 'Diplomatic and considerate',
            casual: 'Casual and friendly',
            formal: 'Formal and professional'
          }
        }
      },
      languages: {
        title: 'Languages',
        description: 'What languages do you use for daily communication?',
        dailyLanguages: 'Languages for daily life',
        languageOptions: {
          en: 'English',
          nl: 'Dutch',
          de: 'German',
          fr: 'French',
          es: 'Spanish',
          other: 'Other'
        }
      },
      dealBreakers: {
        title: 'Deal Breakers',
        description: 'Set your non-negotiable preferences',
        smoking: 'Smoking allowed?',
        petsAllowed: 'Pets allowed?',
        partiesMax: 'Maximum party frequency you can tolerate',
        guestsMax: 'Maximum guest frequency you can tolerate',
        note: 'These are hard constraints that will be used to filter potential matches'
      }
    },
    navigation: {
      back: 'Back',
      next: 'Next',
      skip: 'Skip this section',
      complete: 'Complete Profile',
      saving: 'Saving...',
      saved: 'Saved!'
    },
    validation: {
      required: 'This field is required',
      minLength: 'Must be at least {min} characters',
      maxLength: 'Must be no more than {max} characters',
      invalidEmail: 'Please enter a valid email address',
      invalidUrl: 'Please enter a valid URL',
      invalidNumber: 'Please enter a valid number',
      minValue: 'Must be at least {min}',
      maxValue: 'Must be no more than {max}',
      selectRequired: 'Please select an option'
    },
    cooldown: {
      title: 'Profile Update Cooldown',
      message: 'You can only update your questionnaire answers once every 30 days. Your last update was on {date}.',
      nextUpdate: 'You can update again on {date}.',
      contactSupport: 'Contact support if you need to make urgent changes.'
    }
  },

  // Matches
  matches: {
    title: 'Your Matches',
    subtitle: 'Find your perfect roommate',
    tabs: {
      groups: 'Group Matches',
      individuals: 'Individual Matches'
    },
    filters: {
      title: 'Filters',
      university: 'University',
      degree: 'Degree Level',
      budget: 'Budget Range',
      commute: 'Max Commute',
      languages: 'Languages',
      lifestyle: 'Lifestyle',
      applyFilters: 'Apply Filters',
      clearFilters: 'Clear All'
    },
    noMatches: {
      title: 'No matches found',
      description: 'Try adjusting your filters or check back later for new matches.',
      adjustFilters: 'Adjust Filters',
      refresh: 'Refresh Matches'
    },
    matchCard: {
      compatibility: 'Compatibility',
      viewProfile: 'View Profile',
      accept: 'Accept',
      reject: 'Reject',
      chat: 'Start Chat',
      groupSize: '{count} members',
      avgScore: 'Average compatibility',
      topAlignment: 'Best match on',
      watchOut: 'Watch out for',
      houseRules: 'Suggested house rules',
      acceptGroup: 'Accept Group',
      createGroupChat: 'Create Group Chat'
    },
    compatibility: {
      personality: 'Personality',
      schedule: 'Schedule',
      lifestyle: 'Lifestyle',
      social: 'Social',
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor'
    },
    actions: {
      accept: 'Accept Match',
      reject: 'Reject Match',
      acceptGroup: 'Accept Group',
      rejectGroup: 'Reject Group',
      confirmAccept: 'Are you sure you want to accept this match?',
      confirmReject: 'Are you sure you want to reject this match?',
      accepted: 'Match accepted!',
      rejected: 'Match rejected.',
      error: 'Failed to update match status.'
    }
  },

  // Chat
  chat: {
    title: 'Chat',
    subtitle: 'Connect with your matches',
    noChats: {
      title: 'No conversations yet',
      description: 'Accept a match to start chatting!',
      viewMatches: 'View Matches'
    },
    newMessage: 'Type a message...',
    send: 'Send',
    typing: '{name} is typing...',
    online: 'Online',
    lastSeen: 'Last seen {time}',
    messageStatus: {
      sent: 'Sent',
      delivered: 'Delivered',
      read: 'Read'
    },
    actions: {
      startChat: 'Start Chat',
      leaveChat: 'Leave Chat',
      reportUser: 'Report User',
      blockUser: 'Block User',
      deleteChat: 'Delete Chat',
      confirmLeave: 'Are you sure you want to leave this chat?',
      confirmDelete: 'Are you sure you want to delete this chat?'
    },
    moderation: {
      linkBlocked: 'Links are not allowed for safety reasons',
      messageTooLong: 'Message is too long (max 1000 characters)',
      inappropriateContent: 'Message contains inappropriate content',
      rateLimited: 'You\'re sending messages too quickly. Please slow down.'
    },
    safety: {
      title: 'Chat Safety Tips',
      tips: [
        'Never share personal information like your address or phone number',
        'Meet in public places first',
        'Trust your instincts - if something feels wrong, it probably is',
        'Report any suspicious behavior immediately',
        'Remember that you can block or report users at any time'
      ]
    }
  },

  // Forum
  forum: {
    title: 'Forum',
    subtitle: 'Connect with your university community',
    newPost: 'New Post',
    anonymous: 'Post Anonymously',
    posts: {
      title: 'Posts',
      noPosts: 'No posts yet. Be the first to post!',
      createPost: 'Create Post',
      reply: 'Reply',
      report: 'Report Post',
      delete: 'Delete Post',
      edit: 'Edit Post'
    },
    createPost: {
      title: 'Create New Post',
      postTitle: 'Post Title',
      postContent: 'What would you like to share?',
      anonymous: 'Post anonymously',
      submit: 'Publish Post',
      cancel: 'Cancel',
      preview: 'Preview',
      characterCount: '{current}/{max} characters'
    },
    moderation: {
      reported: 'This post has been reported',
      removed: 'This post has been removed',
      underReview: 'This post is under review'
    }
  },

  // Profile
  profile: {
    title: 'Profile',
    subtitle: 'Manage your profile and preferences',
    sections: {
      personal: 'Personal Information',
      preferences: 'Preferences',
      verification: 'Verification Status',
      privacy: 'Privacy Settings'
    },
    verification: {
      title: 'Verification Status',
      verified: 'Verified',
      pending: 'Pending Verification',
      unverified: 'Not Verified',
      failed: 'Verification Failed',
      verifyNow: 'Verify Now',
      retryVerification: 'Retry Verification'
    },
    privacy: {
      title: 'Privacy Settings',
      minimalPublic: 'Show minimal public profile',
      description: 'When enabled, only your name, degree level, and university will be visible to others before matching.'
    },
    actions: {
      editProfile: 'Edit Profile',
      deleteAccount: 'Delete Account',
      confirmDelete: 'Are you sure you want to delete your account? This action cannot be undone.',
      accountDeleted: 'Your account has been deleted.'
    }
  },

  // Admin
  admin: {
    title: 'Admin Dashboard',
    navigation: {
      dashboard: 'Dashboard',
      users: 'Users',
      moderation: 'Moderation',
      analytics: 'Analytics',
      settings: 'Settings',
      announcements: 'Announcements',
      branding: 'Branding'
    },
    dashboard: {
      title: 'Dashboard',
      stats: {
        totalUsers: 'Total Users',
        verifiedUsers: 'Verified Users',
        activeMatches: 'Active Matches',
        totalReports: 'Total Reports'
      }
    },
    users: {
      title: 'User Management',
      search: 'Search users...',
      filters: {
        verification: 'Verification Status',
        university: 'University',
        active: 'Active Users'
      },
      actions: {
        suspend: 'Suspend User',
        activate: 'Activate User',
        delete: 'Delete User',
        verify: 'Verify User',
        unverify: 'Unverify User'
      }
    },
    moderation: {
      title: 'Content Moderation',
      reports: {
        title: 'Reports',
        noReports: 'No pending reports',
        actions: {
          dismiss: 'Dismiss',
          action: 'Take Action',
          resolve: 'Resolve'
        }
      }
    },
    analytics: {
      title: 'Analytics',
      charts: {
        signups: 'User Signups',
        verification: 'Verification Rate',
        matches: 'Match Activity',
        retention: 'User Retention'
      }
    },
    announcements: {
      title: 'Announcements',
      create: 'Create Announcement',
      edit: 'Edit Announcement',
      titleField: 'Announcement Title',
      contentField: 'Content',
      startDate: 'Start Date',
      endDate: 'End Date',
      publish: 'Publish',
      draft: 'Save as Draft'
    },
    branding: {
      title: 'University Branding',
      logo: 'University Logo',
      primaryColor: 'Primary Color',
      welcomeMessage: 'Welcome Message',
      save: 'Save Changes'
    }
  },

  // Errors
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.',
    unauthorized: 'You are not authorized to perform this action.',
    forbidden: 'Access denied.',
    notFound: 'The requested resource was not found.',
    serverError: 'Server error. Please try again later.',
    validation: 'Please check your input and try again.',
    rateLimit: 'Too many requests. Please slow down.',
    maintenance: 'The system is under maintenance. Please try again later.',
    sessionExpired: 'Your session has expired. Please sign in again.'
  },

  // Success messages
  success: {
    profileUpdated: 'Profile updated successfully!',
    matchAccepted: 'Match accepted!',
    matchRejected: 'Match rejected.',
    messageSent: 'Message sent!',
    postCreated: 'Post created successfully!',
    settingsSaved: 'Settings saved!',
    verificationSubmitted: 'Verification submitted successfully!',
    passwordReset: 'Password reset link sent!',
    accountCreated: 'Account created successfully!'
  },

  // Accessibility
  accessibility: {
    closeDialog: 'Close dialog',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    previousPage: 'Go to previous page',
    nextPage: 'Go to next page',
    skipToContent: 'Skip to main content',
    loadingContent: 'Loading content...',
    errorOccurred: 'An error occurred',
    requiredField: 'This field is required',
    optionalField: 'This field is optional',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    expandSection: 'Expand section',
    collapseSection: 'Collapse section'
  },

  // Legal
  legal: {
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    cookiePolicy: 'Cookie Policy',
    gdpr: 'GDPR Compliance',
    contact: 'Contact Us',
    support: 'Support'
  }
} as const
