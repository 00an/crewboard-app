export const navTranslations = {
  en: {
    brand: "CrewBoard",
    home: "Home",
    about: "About",
    login: "Login",
    logout: "Logout",
    register: "Register",
    dashboard: "Dashboard",
    events: "Events",
    shifts: "Shifts",
  },

  nl: {
    brand: "CrewBoard",
    home: "Home",
    about: "Over ons",
    login: "Inloggen",
    logout: "Uitloggen",
    register: "Registreren",
    dashboard: "Dashboard",
    events: "Evenementen",
    shifts: "Diensten",
  },
};

export type NavLocale = keyof typeof navTranslations;
