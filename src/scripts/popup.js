// =====================
// DOM Elements & State
// =====================
const elements = {
  siteList: document.getElementById("siteList"),
  input: document.getElementById("newSite"),
  errorMessage: document.getElementById("errorMessage"),
  addBtn: document.getElementById("addSite"),
  modal: document.getElementById("confirmModal"),
  modalText: document.getElementById("modalText"),
  confirmBtn: document.getElementById("confirmBtn"),
  cancelBtn: document.getElementById("cancelBtn"),
  toggleViewBtn: document.getElementById("toggleViewBtn"),
};

const state = {
  pendingSite: "",
  showHidden: false,
};

// =====================
// Storage Management
// =====================
const storage = {
  getSites: async () => {
    return new Promise((resolve) => {
      (chrome || browser).storage.local.get(
        ["blockedSites", "hiddenSites", "showHidden"],
        (data) => {
          resolve({
            blocked: data.blockedSites || [],
            hidden: data.hiddenSites || [],
            showHidden: data.showHidden || false,
          });
        },
      );
    });
  },

  saveSites: async (blocked, hidden = []) => {
    return new Promise((resolve) => {
      (chrome || browser).storage.local.set(
        { blockedSites: blocked, hiddenSites: hidden },
        () => {
          resolve();
        },
      );
    });
  },

  saveViewState: async (showHidden) => {
    return new Promise((resolve) => {
      (chrome || browser).storage.local.set({ showHidden }, () => {
        resolve();
      });
    });
  },
};

// =====================
// Blocking Rules
// =====================
const blocking = {
  generateRuleId: (site) => {
    let hash = 0;
    for (let i = 0; i < site.length; i++) {
      hash = (hash << 5) - hash + site.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 9000) + 1000;
  },

  updateRules: async (sites) => {
    const api = typeof chrome !== "undefined" ? chrome : browser;
    if (api && api.declarativeNetRequest) {
      const existingRules = await new Promise((resolve) => {
        api.declarativeNetRequest.getDynamicRules((rules) => resolve(rules));
      });

      const existingIds = existingRules.map((r) => r.id);

      const rules = sites.map((site) => ({
        id: blocking.generateRuleId(site),
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: site,
          resourceTypes: ["main_frame"],
        },
      }));

      api.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingIds,
        addRules: rules,
      });
    } else {
      console.warn("Dynamic rules are not supported in this browser.");
    }
  },
};

// =====================
// UI Rendering
// =====================
const ui = {
  renderList: (sites, isHiddenList = false) => {
    elements.siteList.innerHTML = "";

    if (!sites || sites.length === 0) {
      const message = isHiddenList
        ? "No hay sitios ocultos<br>El vacío está solo..."
        : "No hay sitios desterrados aún<br>Tu fuerza de voluntad es fuerte";
      elements.siteList.innerHTML = `<div class="empty-state">${message}</div>`;
      return;
    }

    sites.forEach((site) => {
      const li = document.createElement("li");
      const btnClass = isHiddenList ? "show-btn" : "hide-btn";
      const btnIcon = isHiddenList ? "fa-eye" : "fa-eye-slash";
      const btn = document.createElement("button");
      btn.className = "action-btn " + btnClass;
      btn.dataset.site = site;
      btn.dataset.hidden = isHiddenList;
      btn.innerHTML = '<i class="fas ' + btnIcon + '"></i>';
      btn.style.pointerEvents = "auto";
      btn.style.cursor = "pointer";

      btn.onclick = (e) => {
        e.stopPropagation();
        console.log("ONCLICK:", site, isHiddenList);
        actions.toggleSiteVisibility(site, isHiddenList);
      };

      const span = document.createElement("span");
      span.className = "site-text";
      span.textContent = (isHiddenList ? "👁️ " : "🔒 ") + site;

      li.appendChild(span);
      li.appendChild(btn);
      elements.siteList.appendChild(li);
    });
  },

  updateToggleButton: (showHidden) => {
    elements.toggleViewBtn.innerHTML = showHidden
      ? '<i class="fas fa-eye"></i>'
      : '<i class="fas fa-eye-slash"></i>';
    elements.toggleViewBtn.title = showHidden
      ? "Mostrar sitios activos"
      : "Mostrar sitios ocultos";
  },

  showModal: (site) => {
    elements.modalText.innerHTML = `⚠️ Estás a punto de desterrar:<br><strong>${site}</strong><br><br>Este sitio será <span style="color:#ff4242">bloqueado para siempre</span>.<br>¿Estás listo para este sacrificio?`;
    elements.modal.style.display = "flex";
  },

  hideModal: () => {
    elements.modal.style.display = "none";
  },
};

// =====================
// Validation Functions
// =====================
const validators = {
  formatURL: (url) => {
    try {
      let formatted = url.toLowerCase().trim();
      if (!formatted.startsWith("http")) {
        formatted = `https://${formatted}`;
        if (!formatted.includes(".") && !formatted.endsWith("/")) {
          formatted += ".com";
        }
      }
      return new URL(formatted).href;
    } catch (e) {
      return null;
    }
  },
};

// =====================
// Core Actions
// =====================
const actions = {
  loadCurrentList: async () => {
    const { blocked, hidden, showHidden } = await storage.getSites();
    console.log("loadCurrentList:", { blocked, hidden, showHidden });
    state.showHidden = showHidden;

    const listToRender = showHidden ? hidden : blocked;
    console.log("Rendering:", listToRender, "isHiddenList:", showHidden);
    ui.renderList(listToRender, showHidden);
    ui.updateToggleButton(showHidden);
  },

  toggleSiteVisibility: async (site, currentlyHidden) => {
    const { blocked, hidden, showHidden } = await storage.getSites();
    console.log("toggleSiteVisibility:", {
      blocked,
      hidden,
      showHidden,
      site,
      currentlyHidden,
    });

    let updatedBlocked = [...blocked];
    let updatedHidden = [...hidden];

    if (currentlyHidden) {
      updatedHidden = hidden.filter((s) => s !== site);
      updatedBlocked = [...blocked, site];
    } else {
      updatedBlocked = blocked.filter((s) => s !== site);
      updatedHidden = [...hidden, site];
    }

    console.log("After toggle:", { updatedBlocked, updatedHidden });

    await storage.saveSites(updatedBlocked, updatedHidden);
    blocking.updateRules(updatedBlocked);

    await actions.loadCurrentList();
  },

  addSite: async () => {
    elements.errorMessage.style.display = "none";
    elements.input.classList.remove("input-error");

    const rawInput = elements.input.value.trim();
    if (!rawInput) return;

    try {
      // Validación de formato
      const formattedSite = validators.formatURL(rawInput);
      if (!formattedSite) {
        throw new Error("invalid_format");
      }

      // Verificar duplicados
      const { blocked, hidden } = await storage.getSites();
      if ([...blocked, ...hidden].includes(formattedSite)) {
        throw new Error("duplicate");
      }

      state.pendingSite = formattedSite;
      ui.showModal(formattedSite);
    } catch (error) {
      elements.errorMessage.textContent = actions.getErrorMessage(
        error.message,
      );
      elements.errorMessage.style.display = "block";
      elements.input.classList.add("input-error");
    }
  },

  getErrorMessage: (errorType) => {
    // Usar función arrow
    const messages = {
      invalid_format: "Formato de URL inválido (ejemplo: ejemplo.com)",
      duplicate: "Este sitio ya está en tu lista de bloqueados",
    };
    return messages[errorType] || "Error desconocido";
  },

  confirmAddSite: async () => {
    const { blocked, hidden } = await storage.getSites();
    const updatedBlocked = [...blocked, state.pendingSite];

    await storage.saveSites(updatedBlocked, hidden);
    blocking.updateRules(updatedBlocked);

    elements.input.value = "";
    ui.hideModal();
    state.pendingSite = "";

    await actions.loadCurrentList();
  },

  toggleView: async () => {
    state.showHidden = !state.showHidden;
    await storage.saveViewState(state.showHidden);
    actions.loadCurrentList();
  },
};

// =====================
// Event Listeners
// =====================
const setupEventListeners = () => {
  elements.addBtn.addEventListener("click", actions.addSite);
  elements.confirmBtn.addEventListener("click", actions.confirmAddSite);
  elements.cancelBtn.addEventListener("click", () => {
    ui.hideModal();
    state.pendingSite = "";
  });
  elements.toggleViewBtn.addEventListener("click", actions.toggleView);

  elements.input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      actions.addSite();
    }
  });
  elements.errorMessage.style.display = "none";
  elements.input.classList.remove("input-error");
};

// =====================
// Initialization
// =====================
const init = async () => {
  setupEventListeners();
  await actions.loadCurrentList();
};

// Start the application
init();

// =====================
// Switch Pomodoro
// =====================
// Tab Switching Functionality
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons and contents
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));

    // Add active class to clicked button and corresponding content
    button.classList.add("active");
    const tabId = button.getAttribute("data-tab");
    document.getElementById(tabId).classList.add("active");
  });
});
