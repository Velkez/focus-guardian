// Pomodoro Timer Module
const pomodoro = (() => {
  // DOM Elements
  const elements = {
    timer: document.getElementById('timer'),
    timerMode: document.getElementById('timerMode'),
    pomodoroCount: document.getElementById('pomodoroCount'),
    startPauseBtn: document.getElementById('startPauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    alarmSound: document.getElementById('alarmSound')
  };

  // Timer State
  const state = {
    isRunning: false,
    isWorkTime: true,
    minutes: 25,
    seconds: 0,
    pomodoroCount: 0,
    interval: null
  };

  // Timer Settings
  const settings = {
    workDuration: 25,
    shortBreak: 5,
    longBreak: 25,
    pomodorosBeforeLongBreak: 4
  };

  // Format time as MM:SS
  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

 // Update the timer display and progress circle
 const updateDisplay = () => {
  elements.timer.textContent = formatTime(state.minutes, state.seconds);
  elements.timerMode.textContent = state.isWorkTime ? 'Tiempo de Trabajo' : 'Tiempo de Descanso';
  elements.pomodoroCount.textContent = state.pomodoroCount;
  
  // Update progress circle
  const timerCircle = document.querySelector('.timer-circle');
  if (timerCircle) {
    const totalSeconds = state.isWorkTime ? 
      (settings.workDuration * 60) : 
      ((state.pomodoroCount % settings.pomodorosBeforeLongBreak === 0) ? 
        (settings.longBreak * 60) : 
        (settings.shortBreak * 60));
    
    const remainingSeconds = (state.minutes * 60) + state.seconds;
    const progressPercentage = (remainingSeconds / totalSeconds) * 100;
    
    timerCircle.style.setProperty('--progress', `${progressPercentage}%`);
  }
};

  // Play alarm sound
  const playAlarm = () => {
    elements.alarmSound.currentTime = 0;
    elements.alarmSound.play();
  };

  // Switch between work/break periods
  const switchPeriod = () => {
    if (state.isWorkTime) {
      state.pomodoroCount++;
      
      // Check if it's time for a long break
      if (state.pomodoroCount % settings.pomodorosBeforeLongBreak === 0) {
        state.minutes = settings.longBreak;
        elements.timerMode.textContent = 'Tiempo de Descanso Largo';
      } else {
        state.minutes = settings.shortBreak;
        elements.timerMode.textContent = 'Tiempo de Descanso Corto';
      }
    } else {
      state.minutes = settings.workDuration;
      elements.timerMode.textContent = 'Tiempo de Trabajo';
    }
    
    state.isWorkTime = !state.isWorkTime;
    state.seconds = 0;
    updateDisplay();
    playAlarm();
  };

  // Timer tick
  const tick = () => {
    if (state.seconds === 0) {
      if (state.minutes === 0) {
        switchPeriod();
        return;
      }
      state.minutes--;
      state.seconds = 59;
    } else {
      state.seconds--;
    }
    
    updateDisplay();
  };

  // Sync with background script
  const syncWithBackground = () => {
    chrome.runtime.sendMessage({ action: "getTimerState" }, (response) => {
      if (response) {
        state.isRunning = response.isRunning;
        state.isWorkTime = response.isWorkTime;
        state.minutes = response.minutes;
        state.seconds = response.seconds;
        state.pomodoroCount = response.pomodoroCount;
        updateDisplay();
      }
    });
  };

  // Start the timer
  const startTimer = () => {
    chrome.runtime.sendMessage({ action: "startTimer" });
  };

  // Pause the timer
  const pauseTimer = () => {
    chrome.runtime.sendMessage({ action: "pauseTimer" });
  };

  // Reset the timer
  const resetTimer = () => {
    chrome.runtime.sendMessage({ action: "resetTimer" });
  };

  // Initialize event listeners
  const init = () => {
    elements.startPauseBtn.addEventListener("click", () => {
      if (state.isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    });

    elements.resetBtn.addEventListener("click", resetTimer);

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.timerState) {
        syncWithBackground();
      }
    });

    syncWithBackground();
  };

  // Public API
  return {
    init
  };
})();

// Initialize the Pomodoro timer when the DOM is loaded
document.addEventListener("DOMContentLoaded", pomodoro.init);