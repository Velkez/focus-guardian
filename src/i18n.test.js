import { describe, it, expect } from "vitest";
import translations from "./src/i18n/translations.js";

describe("i18n", () => {
  describe("Spanish translations", () => {
    it("should have app name", () => {
      expect(translations.es.app.name).toBe("Focus Guardian");
    });

    it("should have blocker strings", () => {
      expect(translations.es.blocker.placeholder).toBeDefined();
      expect(translations.es.blocker.addButton).toBe("Mandar al exilio");
    });

    it("should have pomodoro strings", () => {
      expect(translations.es.pomodoro.workTime).toBe("Tiempo de Trabajo");
      expect(translations.es.pomodoro.start).toBe("Iniciar");
    });
  });

  describe("English translations", () => {
    it("should have app name", () => {
      expect(translations.en.app.name).toBe("Focus Guardian");
    });

    it("should have blocker strings", () => {
      expect(translations.en.blocker.placeholder).toBeDefined();
      expect(translations.en.blocker.addButton).toBe("Banish");
    });

    it("should have pomodoro strings", () => {
      expect(translations.en.pomodoro.workTime).toBe("Work Time");
      expect(translations.en.pomodoro.start).toBe("Start");
    });
  });

  describe("Language parity", () => {
    it("should have same keys in both languages", () => {
      const esKeys = Object.keys(translations.es);
      const enKeys = Object.keys(translations.en);
      expect(esKeys).toEqual(enKeys);
    });
  });
});
