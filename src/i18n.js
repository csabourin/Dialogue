import { createI18n } from "vue-i18n";

const messages = {
  en: {
    rewind: "Rewind 5 seconds",
    forward: "Forward 5 seconds",
    play: "Play",
    pause: "Pause",
    volumeControl: "Volume control",
    turnCCOn: 'Turn CC On',
    turnCCOff: 'Turn CC Off',
    turnClosedCaptionsOn: 'Turn Closed Captions On',
    turnClosedCaptionsOff: 'Turn Closed Captions Off',
  },
  fr: {
    rewind: "Reculer de 5 secondes",
    forward: "Avancer de 5 secondes",
    play: "Lecture",
    pause: "Pause",
    volumeControl: "Contrôle du volume",
    turnCCOn: 'Activer les sous-titres',
    turnCCOff: 'Désactiver les sous-titres',
    turnClosedCaptionsOn: 'Activer les sous-titres',
    turnClosedCaptionsOff: 'Désactiver les sous-titres',
  },
};

export default createI18n({
  legacy: false,
  locale: document.querySelector("html").getAttribute("lang") || "en",
  fallbackLocale: "en",
  messages,
});
