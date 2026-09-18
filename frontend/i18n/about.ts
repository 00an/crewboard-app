export const aboutTranslations = {
  en: {
    title: "About Us",
    intro:
      "We bring people together by making event organization simple, efficient, and enjoyable. Our platform is built to support organizers, volunteers, and participants at every step of the journey.",

    missionTitle: "Our Mission",
    missionText:
      "Our mission is to empower event organizers with the tools they need to plan, manage, and execute successful events. From small community gatherings to large-scale events, we focus on clarity, reliability, and collaboration.",

    whatWeDoTitle: "What We Do",
    whatWeDo: [
      "Create and manage events with ease",
      "Coordinate volunteers and shifts efficiently",
      "Provide clear communication for all participants",
      "Ensure a smooth experience before, during, and after events",
    ],

    whyTitle: "Why Choose Us",
    whyText:
      "We believe great events start with great organization. Our platform is designed with real-world use in mind—intuitive interfaces, secure access, and features that grow with your needs. Whether you are an organizer or a volunteer, we make participation effortless.",

    valuesTitle: "Our Values",
    values: [
      { label: "Community", text: "Events connect people and ideas." },
      { label: "Transparency", text: "Clear roles, clear communication." },
      { label: "Reliability", text: "Tools you can depend on." },
      { label: "Impact", text: "Every well-run event makes a difference." },
    ],
  },

  nl: {
    title: "Over ons",
    intro:
      "Wij brengen mensen samen door evenementenorganisatie eenvoudig, efficiënt en plezierig te maken. Ons platform ondersteunt organisatoren, vrijwilligers en deelnemers in elke stap van het proces.",

    missionTitle: "Onze Missie",
    missionText:
      "Onze missie is om eventorganisatoren te ondersteunen met tools waarmee zij succesvolle evenementen kunnen plannen, beheren en uitvoeren. Van kleine lokale initiatieven tot grootschalige evenementen: wij focussen op duidelijkheid, betrouwbaarheid en samenwerking.",

    whatWeDoTitle: "Wat Wij Doen",
    whatWeDo: [
      "Eenvoudig evenementen aanmaken en beheren",
      "Vrijwilligers en shifts efficiënt coördineren",
      "Duidelijke communicatie voor alle deelnemers",
      "Een vlotte ervaring vóór, tijdens en na evenementen",
    ],

    whyTitle: "Waarom voor ons kiezen",
    whyText:
      "Wij geloven dat sterke evenementen beginnen met goede organisatie. Ons platform is ontworpen voor de praktijk: intuïtieve interfaces, veilige toegang en functies die meegroeien met uw behoeften.",

    valuesTitle: "Onze Waarden",
    values: [
      { label: "Gemeenschap", text: "Evenementen verbinden mensen en ideeën." },
      { label: "Transparantie", text: "Duidelijke rollen en communicatie." },
      { label: "Betrouwbaarheid", text: "Tools waarop u kunt vertrouwen." },
      { label: "Impact", text: "Elk goed georganiseerd evenement maakt verschil." },
    ],
  },
};

export type AboutLocale = keyof typeof aboutTranslations;
