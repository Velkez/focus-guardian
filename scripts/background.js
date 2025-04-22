let timerState = {
  isRunning: false,
  isWorkTime: true,
  minutes: 25,
  seconds: 0,
  pomodoroCount: 0
};

const settings = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 25,
  pomodorosBeforeLongBreak: 4
};

const updateTimer = () => {
  if (timerState.seconds === 0) {
    if (timerState.minutes === 0) {
      switchPeriod();
      return;
    }
    timerState.minutes--;
    timerState.seconds = 59;
  } else {
    timerState.seconds--;
  }

  chrome.storage.local.set({ timerState });
};

const switchPeriod = () => {
  if (timerState.isWorkTime) {
    timerState.pomodoroCount++;
    timerState.minutes = timerState.pomodoroCount % settings.pomodorosBeforeLongBreak === 0
      ? settings.longBreak
      : settings.shortBreak;
  } else {
    timerState.minutes = settings.workDuration;
  }

  timerState.isWorkTime = !timerState.isWorkTime;
  timerState.seconds = 0;

  chrome.storage.local.set({ timerState });
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: "Focus Guardian",
    message: timerState.isWorkTime ? "¡Tiempo de trabajar!" : "¡Tiempo de descansar!"
  });

  chrome.action.openPopup();
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startTimer") {
    if (!timerState.isRunning) {
      timerState.isRunning = true;
      chrome.alarms.create("pomodoroTimer", { periodInMinutes: 1 / 60 });
    }
  } else if (message.action === "pauseTimer") {
    timerState.isRunning = false;
    chrome.alarms.clear("pomodoroTimer");
  } else if (message.action === "resetTimer") {
    timerState = {
      isRunning: false,
      isWorkTime: true,
      minutes: settings.workDuration,
      seconds: 0,
      pomodoroCount: 0
    };
    chrome.alarms.clear("pomodoroTimer");
    chrome.storage.local.set({ timerState });
  } else if (message.action === "getTimerState") {
    sendResponse(timerState);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pomodoroTimer") {
    updateTimer();
  }
});
