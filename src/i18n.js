import { createI18n } from "vue-i18n";

const messages = {
  en: {
    rewind: "Rewind 5 seconds",
    forward: "Forward 5 seconds",
    play: "Play",
    pause: "Pause",
    volumeControl: "Volume control",
  },
  fr: {
    rewind: "Reculer de 5 secondes",
    forward: "Avancer de 5 secondes",
    play: "Lecture",
    pause: "Pause",
    volumeControl: "Contrôle du volume",
  },
};

export default createI18n({
  legacy: false,
  locale: document.querySelector("html").getAttribute("lang") || "en",
  fallbackLocale: "en",
  messages,
});
