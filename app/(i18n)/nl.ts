// Dutch translations for Roommate Match

export const nl = {
  // Common
  common: {
    loading: 'Laden...',
    error: 'Fout',
    success: 'Succesvol',
    cancel: 'Annuleren',
    save: 'Opslaan',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    back: 'Terug',
    next: 'Volgende',
    previous: 'Vorige',
    continue: 'Doorgaan',
    submit: 'Versturen',
    confirm: 'Bevestigen',
    yes: 'Ja',
    no: 'Nee',
    close: 'Sluiten',
    open: 'Openen',
    search: 'Zoeken',
    filter: 'Filter',
    clear: 'Wissen',
    apply: 'Toepassen',
    reset: 'Resetten',
    retry: 'Opnieuw proberen',
    skip: 'Overslaan',
    optional: 'Optioneel',
    required: 'Verplicht',
    all: 'Alle',
    none: 'Geen',
    select: 'Selecteren',
    choose: 'Kiezen',
    upload: 'Uploaden',
    download: 'Downloaden',
    share: 'Delen',
    copy: 'Kopiëren',
    copied: 'Gekopieerd!',
    online: 'Online',
    offline: 'Offline',
    verified: 'Geverifieerd',
    pending: 'In behandeling',
    rejected: 'Afgewezen',
    accepted: 'Geaccepteerd'
  },

  // Navigation
  nav: {
    home: 'Home',
    matches: 'Matches',
    chat: 'Chat',
    forum: 'Forum',
    profile: 'Profiel',
    settings: 'Instellingen',
    admin: 'Beheer',
    signIn: 'Inloggen',
    signUp: 'Registreren',
    signOut: 'Uitloggen',
    language: 'Taal'
  },

  // Authentication
  auth: {
    signIn: {
      title: 'Welkom terug',
      subtitle: 'Log in op je account',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      rememberMe: 'Onthoud mij',
      forgotPassword: 'Wachtwoord vergeten?',
      signInButton: 'Inloggen',
      noAccount: 'Nog geen account?',
      signUpLink: 'Registreer hier',
      ssoButton: 'Inloggen met je universiteitsaccount',
      magicLinkButton: 'Verstuur magic link',
      magicLinkSent: 'Magic link verzonden! Controleer je e-mail.',
      errors: {
        invalidCredentials: 'Ongeldig e-mailadres of wachtwoord',
        emailRequired: 'E-mailadres is verplicht',
        passwordRequired: 'Wachtwoord is verplicht',
        emailInvalid: 'Voer een geldig e-mailadres in',
        tooManyRequests: 'Te veel pogingen. Probeer het later opnieuw.',
        accountNotFound: 'Geen account gevonden met dit e-mailadres',
        accountDisabled: 'Je account is uitgeschakeld'
      }
    },
    signUp: {
      title: 'Maak je account aan',
      subtitle: 'Sluit je aan bij duizenden studenten die hun perfecte huisgenoot zoeken',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      confirmPassword: 'Bevestig wachtwoord',
      agreeToTerms: 'Ik ga akkoord met de Algemene Voorwaarden en Privacybeleid',
      signUpButton: 'Account Aanmaken',
      haveAccount: 'Al een account?',
      signInLink: 'Log hier in',
      universityEmail: 'Gebruik je universiteits-e-mail voor snellere verificatie',
      errors: {
        emailRequired: 'E-mailadres is verplicht',
        passwordRequired: 'Wachtwoord is verplicht',
        passwordTooShort: 'Wachtwoord moet minimaal 8 tekens bevatten',
        passwordsDoNotMatch: 'Wachtwoorden komen niet overeen',
        emailInvalid: 'Voer een geldig e-mailadres in',
        emailAlreadyExists: 'Er bestaat al een account met dit e-mailadres',
        termsRequired: 'Je moet akkoord gaan met de voorwaarden',
        universityEmailRequired: 'Gebruik je universiteits-e-mailadres'
      }
    },
    resetPassword: {
      title: 'Reset je wachtwoord',
      subtitle: 'Voer je e-mailadres in en we sturen je een link om je wachtwoord te resetten',
      email: 'E-mailadres',
      resetButton: 'Verstuur reset link',
      backToSignIn: 'Terug naar inloggen',
      linkSent: 'Wachtwoord reset link verzonden! Controleer je e-mail.',
      errors: {
        emailRequired: 'E-mailadres is verplicht',
        emailInvalid: 'Voer een geldig e-mailadres in',
        emailNotFound: 'Geen account gevonden met dit e-mailadres'
      }
    },
    callback: {
      title: 'Je wordt ingelogd...',
      success: 'Succesvol ingelogd!',
      error: 'Inloggen mislukt. Probeer het opnieuw.',
      redirecting: 'Doorverwijzen...'
    }
  },

  // ID Verification
  verification: {
    title: 'Identiteitsverificatie',
    subtitle: 'We moeten je identiteit verifiëren om onze community veilig te houden',
    steps: {
      selfie: {
        title: 'Maak een selfie',
        description: 'Maak een duidelijke selfie voor identiteitsverificatie',
        instructions: 'Kijk recht in de camera en zorg voor goede verlichting',
        takePhoto: 'Foto Maken',
        retakePhoto: 'Opnieuw Maken',
        usePhoto: 'Deze Foto Gebruiken',
        errors: {
          noCamera: 'Camera niet beschikbaar',
          permissionDenied: 'Cameratoestemming geweigerd',
          photoRequired: 'Maak een selfie'
        }
      },
      idDocument: {
        title: 'Upload ID-document',
        description: 'Upload een duidelijke foto van je door de overheid uitgegeven ID',
        instructions: 'Zorg ervoor dat het document duidelijk zichtbaar is en niet wazig',
        frontSide: 'Voorzijde',
        backSide: 'Achterzijde',
        uploadFront: 'Voorzijde Uploaden',
        uploadBack: 'Achterzijde Uploaden',
        errors: {
          fileRequired: 'Upload je ID-document',
          fileTooLarge: 'Bestand te groot (max 10MB)',
          invalidFormat: 'Ongeldig bestandsformaat. Gebruik JPG of PNG.',
          documentNotClear: 'Documentafbeelding is niet duidelijk genoeg'
        }
      },
      review: {
        title: 'Beoordelen en Versturen',
        description: 'Controleer je informatie voordat je deze verstuurt voor verificatie',
        selfiePreview: 'Selfie',
        idPreview: 'ID-document',
        submitButton: 'Verstuur voor Verificatie',
        processing: 'Je verificatie wordt verwerkt...',
        estimatedTime: 'Verificatie duurt meestal 1-2 uur'
      },
      status: {
        title: 'Verificatiestatus',
        pending: {
          title: 'Verificatie in Behandeling',
          description: 'Je documenten worden beoordeeld. We laten je weten zodra verificatie voltooid is.',
          estimatedTime: 'Dit duurt meestal 1-2 uur',
          checkAgain: 'Opnieuw Controleren'
        },
        verified: {
          title: 'Verificatie Voltooid!',
          description: 'Je identiteit is succesvol geverifieerd. Je hebt nu toegang tot alle functies.',
          continueButton: 'Doorgaan naar App'
        },
        failed: {
          title: 'Verificatie Mislukt',
          description: 'We konden je identiteit niet verifiëren. Probeer het opnieuw met duidelijkere documenten.',
          retryButton: 'Opnieuw Proberen',
          contactSupport: 'Contact Ondersteuning',
          commonReasons: 'Veelvoorkomende redenen voor mislukking:',
          reasons: [
            'Documentafbeelding is wazig of onduidelijk',
            'Document is verlopen of ongeldig',
            'Selfie komt niet overeen met de documentfoto',
            'Documenttype wordt niet ondersteund'
          ]
        }
      }
    },
    privacy: {
      title: 'Privacy & Beveiliging',
      description: 'Je persoonlijke informatie is versleuteld en veilig opgeslagen. We gebruiken het alleen voor verificatiedoeleinden en delen het nooit met derden.',
      gdpr: 'Meer informatie over onze GDPR-naleving'
    }
  },

  // Questionnaire
  questionnaire: {
    title: 'Vertel ons over jezelf',
    subtitle: 'Help ons je perfecte huisgenoot te vinden',
    progress: 'Stap {current} van {total}',
    timeEstimate: 'Dit duurt ongeveer {minutes} minuten',
    sections: {
      basics: {
        title: 'Basisinformatie',
        description: 'Vertel ons over je academische achtergrond en huisvestingsvoorkeuren',
        degreeLevel: 'Studieniveau',
        program: 'Studierichting',
        campus: 'Campus',
        moveInWindow: 'Wanneer wil je intrekken?',
        degreeOptions: {
          bachelor: 'Bachelor',
          master: 'Master',
          phd: 'PhD',
          exchange: 'Uitwisselingsstudent',
          other: 'Anders'
        },
        moveInOptions: {
          immediate: 'Onmiddellijk',
          withinMonth: 'Binnen een maand',
          within3Months: 'Binnen 3 maanden',
          flexible: 'Flexibel'
        }
      },
      logistics: {
        title: 'Huisvestingsvoorkeuren',
        description: 'Deel je budget en locatievoorkeuren',
        budgetMin: 'Minimum budget (€/maand)',
        budgetMax: 'Maximum budget (€/maand)',
        commuteMax: 'Maximale reistijd (minuten)',
        leaseLength: 'Voorkeur huurperiode',
        roomType: 'Kamertype voorkeur',
        leaseOptions: {
          '3_months': '3 maanden',
          '6_months': '6 maanden',
          '12_months': '12 maanden',
          flexible: 'Flexibel'
        },
        roomTypeOptions: {
          single: 'Eigen kamer',
          shared: 'Gedeelde kamer',
          studio: 'Studio appartement',
          flexible: 'Flexibel'
        }
      },
      lifestyle: {
        title: 'Leefstijl & Gewoontes',
        description: 'Help ons je dagelijkse routines en voorkeuren te begrijpen',
        sleepStart: 'Hoe laat ga je meestal slapen?',
        sleepEnd: 'Hoe laat sta je meestal op?',
        studyIntensity: 'Hoeveel studeer je thuis?',
        cleanlinessRoom: 'Hoe belangrijk is een schone kamer?',
        cleanlinessKitchen: 'Hoe belangrijk is een schone keuken?',
        noiseTolerance: 'Hoeveel geluid kun je verdragen?',
        guestsFrequency: 'Hoe vaak heb je gasten?',
        partiesFrequency: 'Hoe vaak geef je feestjes?',
        choresPreference: 'Hoe ga je om met huishoudelijke taken?',
        alcoholAtHome: 'Hoe denk je over alcohol thuis?',
        petsTolerance: 'Hoe denk je over huisdieren?',
        scales: {
          '0': 'Helemaal niet',
          '1': 'Zeer weinig',
          '2': 'Weinig',
          '3': 'Enigszins',
          '4': 'Matig',
          '5': 'Redelijk',
          '6': 'Behoorlijk',
          '7': 'Veel',
          '8': 'Zeer veel',
          '9': 'Extreem',
          '10': 'Essentieel'
        }
      },
      social: {
        title: 'Sociale Voorkeuren',
        description: 'Vertel ons over je sociale voorkeuren thuis',
        socialLevel: 'Hoe sociaal wil je thuis zijn?',
        foodSharing: 'Hoe denk je over het delen van voedsel?',
        utensilsSharing: 'Hoe denk je over het delen van keukengerei?',
        socialSlider: {
          quiet: 'Rustig & Privé',
          social: 'Sociaal & Open'
        }
      },
      personality: {
        title: 'Persoonlijkheid',
        description: 'Help ons je persoonlijkheidskenmerken te begrijpen',
        extraversion: 'Hoe extravert en sociaal ben je?',
        agreeableness: 'Hoe coöperatief en vertrouwend ben je?',
        conscientiousness: 'Hoe georganiseerd en verantwoordelijk ben je?',
        neuroticism: 'Hoe gemakkelijk raak je gestrest of angstig?',
        openness: 'Hoe open sta je voor nieuwe ervaringen?',
        traits: {
          extraversion: {
            low: 'Voorkeur voor rustige, intieme omgevingen',
            high: 'Geniet van omgang met mensen en socialiseren'
          },
          agreeableness: {
            low: 'Waardeert onafhankelijkheid en directheid',
            high: 'Waardeert samenwerking en harmonie'
          },
          conscientiousness: {
            low: 'Flexibel en spontaan',
            high: 'Georganiseerd en plant vooruit'
          },
          neuroticism: {
            low: 'Kalm en emotioneel stabiel',
            high: 'Ervaart emoties intens'
          },
          openness: {
            low: 'Voorkeur voor bekende routines en ideeën',
            high: 'Geniet van nieuwe ervaringen en ideeën'
          }
        }
      },
      communication: {
        title: 'Communicatiestijl',
        description: 'Hoe communiceer en los je conflicten op?',
        conflictStyle: 'Hoe ga je om met conflicten?',
        communicationPreference: 'Hoe communiceer je het liefst?',
        styles: {
          conflict: {
            avoid: 'Vermijd conflicten',
            accommodate: 'Pas je aan anderen aan',
            compromise: 'Compromissen sluiten',
            collaborate: 'Samenwerken om oplossingen te vinden',
            compete: 'Sta stevig in je schoenen'
          },
          communication: {
            direct: 'Direct en rechtuit',
            diplomatic: 'Diplomatisch en attent',
            casual: 'Informeel en vriendelijk',
            formal: 'Formeel en professioneel'
          }
        }
      },
      languages: {
        title: 'Talen',
        description: 'Welke talen gebruik je voor dagelijkse communicatie?',
        dailyLanguages: 'Talen voor dagelijks leven',
        languageOptions: {
          en: 'Engels',
          nl: 'Nederlands',
          de: 'Duits',
          fr: 'Frans',
          es: 'Spaans',
          other: 'Anders'
        }
      },
      dealBreakers: {
        title: 'Deal Breakers',
        description: 'Stel je niet-onderhandelbare voorkeuren in',
        smoking: 'Roken toegestaan?',
        petsAllowed: 'Huisdieren toegestaan?',
        partiesMax: 'Maximale feestfrequentie die je kunt verdragen',
        guestsMax: 'Maximale gastfrequentie die je kunt verdragen',
        note: 'Dit zijn harde beperkingen die worden gebruikt om potentiële matches te filteren'
      }
    },
    navigation: {
      back: 'Terug',
      next: 'Volgende',
      skip: 'Deze sectie overslaan',
      complete: 'Profiel Voltooien',
      saving: 'Opslaan...',
      saved: 'Opgeslagen!'
    },
    validation: {
      required: 'Dit veld is verplicht',
      minLength: 'Moet minimaal {min} tekens bevatten',
      maxLength: 'Mag maximaal {max} tekens bevatten',
      invalidEmail: 'Voer een geldig e-mailadres in',
      invalidUrl: 'Voer een geldige URL in',
      invalidNumber: 'Voer een geldig nummer in',
      minValue: 'Moet minimaal {min} zijn',
      maxValue: 'Mag maximaal {max} zijn',
      selectRequired: 'Selecteer een optie'
    },
    cooldown: {
      title: 'Profiel Update Cooldown',
      message: 'Je kunt je vragenlijstantwoorden slechts eens per 30 dagen bijwerken. Je laatste update was op {date}.',
      nextUpdate: 'Je kunt opnieuw bijwerken op {date}.',
      contactSupport: 'Neem contact op met ondersteuning als je dringende wijzigingen moet maken.'
    }
  },

  // Matches
  matches: {
    title: 'Je Matches',
    subtitle: 'Vind je perfecte huisgenoot',
    tabs: {
      groups: 'Groep Matches',
      individuals: 'Individuele Matches'
    },
    filters: {
      title: 'Filters',
      university: 'Universiteit',
      degree: 'Studieniveau',
      budget: 'Budget Bereik',
      commute: 'Max Reistijd',
      languages: 'Talen',
      lifestyle: 'Leefstijl',
      applyFilters: 'Filters Toepassen',
      clearFilters: 'Alle Filters Wissen'
    },
    noMatches: {
      title: 'Geen matches gevonden',
      description: 'Probeer je filters aan te passen of kom later terug voor nieuwe matches.',
      adjustFilters: 'Filters Aanpassen',
      refresh: 'Matches Vernieuwen'
    },
    matchCard: {
      compatibility: 'Compatibiliteit',
      viewProfile: 'Profiel Bekijken',
      accept: 'Accepteren',
      reject: 'Afwijzen',
      chat: 'Chat Starten',
      groupSize: '{count} leden',
      avgScore: 'Gemiddelde compatibiliteit',
      topAlignment: 'Beste match op',
      watchOut: 'Let op',
      houseRules: 'Voorgestelde huisregels',
      acceptGroup: 'Groep Accepteren',
      createGroupChat: 'Groepschat Aanmaken'
    },
    compatibility: {
      personality: 'Persoonlijkheid',
      schedule: 'Schema',
      lifestyle: 'Leefstijl',
      social: 'Sociaal',
      excellent: 'Uitstekend',
      good: 'Goed',
      fair: 'Redelijk',
      poor: 'Slecht'
    },
    actions: {
      accept: 'Match Accepteren',
      reject: 'Match Afwijzen',
      acceptGroup: 'Groep Accepteren',
      rejectGroup: 'Groep Afwijzen',
      confirmAccept: 'Weet je zeker dat je deze match wilt accepteren?',
      confirmReject: 'Weet je zeker dat je deze match wilt afwijzen?',
      accepted: 'Match geaccepteerd!',
      rejected: 'Match afgewezen.',
      error: 'Kon matchstatus niet bijwerken.'
    }
  },

  // Chat
  chat: {
    title: 'Chat',
    subtitle: 'Verbind met je matches',
    noChats: {
      title: 'Nog geen gesprekken',
      description: 'Accepteer een match om te beginnen met chatten!',
      viewMatches: 'Matches Bekijken'
    },
    newMessage: 'Type een bericht...',
    send: 'Versturen',
    typing: '{name} is aan het typen...',
    online: 'Online',
    lastSeen: 'Laatst gezien {time}',
    messageStatus: {
      sent: 'Verzonden',
      delivered: 'Afgeleverd',
      read: 'Gelezen'
    },
    actions: {
      startChat: 'Chat Starten',
      leaveChat: 'Chat Verlaten',
      reportUser: 'Gebruiker Rapporteren',
      blockUser: 'Gebruiker Blokkeren',
      deleteChat: 'Chat Verwijderen',
      confirmLeave: 'Weet je zeker dat je deze chat wilt verlaten?',
      confirmDelete: 'Weet je zeker dat je deze chat wilt verwijderen?'
    },
    moderation: {
      linkBlocked: 'Links zijn niet toegestaan uit veiligheidsoverwegingen',
      messageTooLong: 'Bericht is te lang (max 1000 tekens)',
      inappropriateContent: 'Bericht bevat ongepaste inhoud',
      rateLimited: 'Je stuurt berichten te snel. Vertraag wat.'
    },
    safety: {
      title: 'Chat Veiligheidstips',
      tips: [
        'Deel nooit persoonlijke informatie zoals je adres of telefoonnummer',
        'Ontmoet eerst op openbare plaatsen',
        'Vertrouw op je instincten - als iets niet goed voelt, is het waarschijnlijk zo',
        'Rapporteer verdacht gedrag onmiddellijk',
        'Onthoud dat je gebruikers altijd kunt blokkeren of rapporteren'
      ]
    }
  },

  // Forum
  forum: {
    title: 'Forum',
    subtitle: 'Verbind met je universiteitsgemeenschap',
    newPost: 'Nieuw Bericht',
    anonymous: 'Anoniem Plaatsen',
    posts: {
      title: 'Berichten',
      noPosts: 'Nog geen berichten. Wees de eerste die post!',
      createPost: 'Bericht Aanmaken',
      reply: 'Antwoorden',
      report: 'Bericht Rapporteren',
      delete: 'Bericht Verwijderen',
      edit: 'Bericht Bewerken'
    },
    createPost: {
      title: 'Nieuw Bericht Aanmaken',
      postTitle: 'Berichttitel',
      postContent: 'Wat wil je delen?',
      anonymous: 'Anoniem plaatsen',
      submit: 'Bericht Publiceren',
      cancel: 'Annuleren',
      preview: 'Voorbeeld',
      characterCount: '{current}/{max} tekens'
    },
    moderation: {
      reported: 'Dit bericht is gerapporteerd',
      removed: 'Dit bericht is verwijderd',
      underReview: 'Dit bericht wordt beoordeeld'
    }
  },

  // Profile
  profile: {
    title: 'Profiel',
    subtitle: 'Beheer je profiel en voorkeuren',
    sections: {
      personal: 'Persoonlijke Informatie',
      preferences: 'Voorkeuren',
      verification: 'Verificatiestatus',
      privacy: 'Privacy Instellingen'
    },
    verification: {
      title: 'Verificatiestatus',
      verified: 'Geverifieerd',
      pending: 'Verificatie in Behandeling',
      unverified: 'Niet Geverifieerd',
      failed: 'Verificatie Mislukt',
      verifyNow: 'Nu Verifiëren',
      retryVerification: 'Verificatie Opnieuw Proberen'
    },
    privacy: {
      title: 'Privacy Instellingen',
      minimalPublic: 'Toon minimaal openbaar profiel',
      description: 'Wanneer ingeschakeld, zijn alleen je naam, studieniveau en universiteit zichtbaar voor anderen voordat je matcht.'
    },
    actions: {
      editProfile: 'Profiel Bewerken',
      deleteAccount: 'Account Verwijderen',
      confirmDelete: 'Weet je zeker dat je je account wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
      accountDeleted: 'Je account is verwijderd.'
    }
  },

  // Admin
  admin: {
    title: 'Beheer Dashboard',
    navigation: {
      dashboard: 'Dashboard',
      users: 'Gebruikers',
      moderation: 'Moderatie',
      analytics: 'Analytics',
      settings: 'Instellingen',
      announcements: 'Aankondigingen',
      branding: 'Huisstijl'
    },
    dashboard: {
      title: 'Dashboard',
      stats: {
        totalUsers: 'Totaal Gebruikers',
        verifiedUsers: 'Geverifieerde Gebruikers',
        activeMatches: 'Actieve Matches',
        totalReports: 'Totaal Rapporten'
      }
    },
    users: {
      title: 'Gebruikersbeheer',
      search: 'Zoek gebruikers...',
      filters: {
        verification: 'Verificatiestatus',
        university: 'Universiteit',
        active: 'Actieve Gebruikers'
      },
      actions: {
        suspend: 'Gebruiker Schorsen',
        activate: 'Gebruiker Activeren',
        delete: 'Gebruiker Verwijderen',
        verify: 'Gebruiker Verifiëren',
        unverify: 'Gebruiker Niet Verifiëren'
      }
    },
    moderation: {
      title: 'Inhoud Moderatie',
      reports: {
        title: 'Rapporten',
        noReports: 'Geen openstaande rapporten',
        actions: {
          dismiss: 'Afwijzen',
          action: 'Actie Ondernemen',
          resolve: 'Oplossen'
        }
      }
    },
    analytics: {
      title: 'Analytics',
      charts: {
        signups: 'Gebruikersregistraties',
        verification: 'Verificatiepercentage',
        matches: 'Match Activiteit',
        retention: 'Gebruikersbehoud'
      }
    },
    announcements: {
      title: 'Aankondigingen',
      create: 'Aankondiging Aanmaken',
      edit: 'Aankondiging Bewerken',
      titleField: 'Aankondiging Titel',
      contentField: 'Inhoud',
      startDate: 'Startdatum',
      endDate: 'Einddatum',
      publish: 'Publiceren',
      draft: 'Opslaan als Concept'
    },
    branding: {
      title: 'Universiteits Huisstijl',
      logo: 'Universiteits Logo',
      primaryColor: 'Primaire Kleur',
      welcomeMessage: 'Welkomstbericht',
      save: 'Wijzigingen Opslaan'
    }
  },

  // Errors
  errors: {
    generic: 'Er is iets misgegaan. Probeer het opnieuw.',
    network: 'Netwerkfout. Controleer je verbinding.',
    unauthorized: 'Je bent niet geautoriseerd om deze actie uit te voeren.',
    forbidden: 'Toegang geweigerd.',
    notFound: 'De gevraagde bron is niet gevonden.',
    serverError: 'Serverfout. Probeer het later opnieuw.',
    validation: 'Controleer je invoer en probeer het opnieuw.',
    rateLimit: 'Te veel verzoeken. Vertraag wat.',
    maintenance: 'Het systeem is in onderhoud. Probeer het later opnieuw.',
    sessionExpired: 'Je sessie is verlopen. Log opnieuw in.'
  },

  // Success messages
  success: {
    profileUpdated: 'Profiel succesvol bijgewerkt!',
    matchAccepted: 'Match geaccepteerd!',
    matchRejected: 'Match afgewezen.',
    messageSent: 'Bericht verzonden!',
    postCreated: 'Bericht succesvol aangemaakt!',
    settingsSaved: 'Instellingen opgeslagen!',
    verificationSubmitted: 'Verificatie succesvol verzonden!',
    passwordReset: 'Wachtwoord reset link verzonden!',
    accountCreated: 'Account succesvol aangemaakt!'
  },

  // Accessibility
  accessibility: {
    closeDialog: 'Dialoog sluiten',
    openMenu: 'Menu openen',
    closeMenu: 'Menu sluiten',
    previousPage: 'Ga naar vorige pagina',
    nextPage: 'Ga naar volgende pagina',
    skipToContent: 'Ga naar hoofdinhoud',
    loadingContent: 'Inhoud laden...',
    errorOccurred: 'Er is een fout opgetreden',
    requiredField: 'Dit veld is verplicht',
    optionalField: 'Dit veld is optioneel',
    showPassword: 'Wachtwoord tonen',
    hidePassword: 'Wachtwoord verbergen',
    expandSection: 'Sectie uitklappen',
    collapseSection: 'Sectie inklappen'
  },

  // Legal
  legal: {
    termsOfService: 'Algemene Voorwaarden',
    privacyPolicy: 'Privacybeleid',
    cookiePolicy: 'Cookie Beleid',
    gdpr: 'GDPR Naleving',
    contact: 'Contact',
    support: 'Ondersteuning'
  }
} as const
