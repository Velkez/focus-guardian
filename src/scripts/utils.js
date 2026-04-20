const browserAPI = (() => {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
    return { isChrome: true, api: chrome };
  }
  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getManifest) {
    return { isChrome: false, api: browser };
  }
  console.warn('Focus Guardian: No se detectó API de extensión. Usando polyfill.');
  return { isChrome: true, api: createPolyfill() };
})();

function createPolyfill() {
  const listeners = new Map();
  let nextListenerId = 0;

  return {
    runtime: {
      getManifest: () => ({ manifest_version: 3, version: '1.0.0' }),
      getURL: (path) => path,
      sendMessage: (message, callback) => {
        if (callback) callback({});
      },
      onMessage: {
        addListener: (callback) => {
          const id = nextListenerId++;
          listeners.set(id, callback);
          return id;
        }
      }
    },
    storage: {
      local: {
        get: (keys, callback) => {
          const result = {};
          const keyList = Array.isArray(keys) ? keys : [keys];
          keyList.forEach(k => result[k] = null);
          if (callback) callback(result);
        },
        set: (items, callback) => {
          if (callback) callback();
        }
      }
    },
    declarativeNetRequest: {
      updateDynamicRules: (options, callback) => {
        if (callback) callback();
      },
      getDynamicRules: (callback) => {
        if (callback) callback([]);
      }
    },
    alarms: {
      create: (name, options, callback) => {
        if (callback) callback();
      },
      get: (name, callback) => {
        if (callback) callback({});
      },
      clear: (name, callback) => {
        if (callback) callback({ cleared: false });
      }
    },
    notifications: {
      create: (notificationId, options, callback) => {
        if (callback) callback(notificationId);
      },
      clear: (notificationId, callback) => {
        if (callback) callback({});
      }
    }
  };
}

function getBrowserAPI() {
  return browserAPI.api;
}

function isChrome() {
  return browserAPI.isChrome;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getBrowserAPI, isChrome, browserAPI };
}