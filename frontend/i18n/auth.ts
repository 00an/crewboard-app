export const authTranslations = {
  en: {
    // Login
    loginTitle: "Sign in",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginButton: "Sign in",
    loggingIn: "Signing in…",
    testUsersTitle: "Predefined Test Users",
    testUsersSubtitle: "You can use the following accounts to test the application.",
    columnEmail: "Email",
    columnPassword: "Password",
    columnRole: "Role",

    // Register
    registerTitle: "Create account",
    firstNameLabel: "First name",
    lastNameLabel: "Last name",
    confirmPasswordLabel: "Confirm password",
    registerButton: "Register",
    registering: "Creating account…",
    successTitle: "Account created!",
    successMessage: "Your account has been registered. You can now sign in.",
    goToLogin: "Go to Login",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign in",
    passwordMismatch: "Passwords do not match.",
    passwordTooShort: "Password must be at least 12 characters.",
    passwordTooWeak:
      "Password must include an uppercase letter, a lowercase letter, a digit, and a special character, and must not be a common password.",
    serverError: "Could not reach the server. Please try again.",

    // Friendly error messages (login / register)
    loginFailedInvalid: "Incorrect email or password.",
    loginFailedDisabled: "Incorrect email or password.",
    tooManyAttempts: "Too many attempts. Please wait a minute and try again.",
    genericError: "Something went wrong. Please try again.",
    emailInUse: "An account with this email already exists.",

    // Role labels (test table)
    roleAdmin: "Administrator",
    roleOrganizer: "Event Organizer",
    roleVolunteer: "Volunteer",
  },

  nl: {
    // Login
    loginTitle: "Inloggen",
    emailLabel: "E-mailadres",
    passwordLabel: "Wachtwoord",
    loginButton: "Inloggen",
    loggingIn: "Bezig met inloggen…",
    testUsersTitle: "Vooraf gedefinieerde testgebruikers",
    testUsersSubtitle: "Gebruik de onderstaande accounts om de applicatie te testen.",
    columnEmail: "E-mail",
    columnPassword: "Wachtwoord",
    columnRole: "Rol",

    // Register
    registerTitle: "Account aanmaken",
    firstNameLabel: "Voornaam",
    lastNameLabel: "Achternaam",
    confirmPasswordLabel: "Wachtwoord bevestigen",
    registerButton: "Registreren",
    registering: "Account aanmaken…",
    successTitle: "Account aangemaakt!",
    successMessage: "Uw account is geregistreerd. U kunt nu inloggen.",
    goToLogin: "Ga naar inloggen",
    alreadyHaveAccount: "Heeft u al een account?",
    signIn: "Inloggen",
    passwordMismatch: "Wachtwoorden komen niet overeen.",
    passwordTooShort: "Wachtwoord moet minimaal 12 tekens bevatten.",
    passwordTooWeak:
      "Wachtwoord moet een hoofdletter, een kleine letter, een cijfer en een speciaal teken bevatten, en mag geen veelgebruikt wachtwoord zijn.",
    serverError: "Kon de server niet bereiken. Probeer het opnieuw.",

    // Duidelijke foutmeldingen (in- en registreren)
    loginFailedInvalid: "Onjuist e-mailadres of wachtwoord.",
    loginFailedDisabled: "Onjuist e-mailadres of wachtwoord.",
    tooManyAttempts: "Te veel pogingen. Wacht een minuutje en probeer het opnieuw.",
    genericError: "Er is iets misgegaan. Probeer het opnieuw.",
    emailInUse: "Er bestaat al een account met dit e-mailadres.",

    // Role labels (test table)
    roleAdmin: "Beheerder",
    roleOrganizer: "Evenementenorganisator",
    roleVolunteer: "Vrijwilliger",
  },
};

export type AuthLocale = keyof typeof authTranslations;
export type AuthText = (typeof authTranslations)[AuthLocale];
