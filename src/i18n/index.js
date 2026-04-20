import i18next from "i18next";

const resources = {
  es: {
    translation: {
      app: {
        name: "Focus Guardian",
        tagline: "Bloquea distracciones",
      },
      blocker: {
        placeholder: "Ingresa un dominio para desterrar...",
        addButton: "Mandar al exilio",
        emptyActive: "No hay sitios desterrados aún",
        emptyHidden: "No hay sitios ocultos",
        confirmTitle: "Estás a punto de desterrar:",
        confirmMessage: "Este sitio será bloqueado para siempre.",
        confirmButton: "¡Condenación Eterna!",
        cancelButton: "Retirarse",
      },
      pomodoro: {
        title: "Temporizador Pomodoro",
        workTime: "Tiempo de Trabajo",
        shortBreak: "Descanso Corto",
        longBreak: "Descanso Largo",
        start: "Iniciar",
        pause: "Pausar",
        reset: "Reiniciar",
        pomodoros: "Pomodoros",
      },
      tabs: {
        blocker: "Bloqueador",
        pomodoro: "Pomodoro",
      },
      notifications: {
        workTime: "¡Tiempo de trabajar!",
        breakTime: "¡Tiempo de descansar!",
      },
    },
  },
  en: {
    translation: {
      app: {
        name: "Focus Guardian",
        tagline: "Block distractions",
      },
      blocker: {
        placeholder: "Enter a domain to banish...",
        addButton: "Banish",
        emptyActive: "No sites banished yet",
        emptyHidden: "No hidden sites",
        confirmTitle: "You are about to banish:",
        confirmMessage: "This site will be blocked forever.",
        confirmButton: "Eternal Condemnation!",
        cancelButton: "Retreat",
      },
      pomodoro: {
        title: "Pomodoro Timer",
        workTime: "Work Time",
        shortBreak: "Short Break",
        longBreak: "Long Break",
        start: "Start",
        pause: "Pause",
        reset: "Reset",
        pomodoros: "Pomodoros",
      },
      tabs: {
        blocker: "Blocker",
        pomodoro: "Pomodoro",
      },
      notifications: {
        workTime: "Time to work!",
        breakTime: "Time to rest!",
      },
    },
  },
};

export async function initI18n(lang = "es") {
  await i18next.init({
    lng: lang,
    fallbackLng: "en",
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

  return i18next;
}

export function t(key, options) {
  return i18next.t(key, options);
}

export function changeLanguage(lang) {
  return i18next.changeLanguage(lang);
}

export { i18next };
