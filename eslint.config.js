import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        browser: true,
        chrome: true,
        webextensions: true,
        document: "readonly",
        console: "readonly",
        MutationObserver: "readonly",
        fetch: "readonly",
        URL: "readonly",
        module: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        alert: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "no-empty": "off",
    },
  },
];
