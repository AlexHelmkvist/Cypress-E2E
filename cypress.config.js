const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "https://test-gateway.zignsec.com/api/v5/sessions/scanning-dp50",
  },
  component: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  browsers: [
    {
      name: 'chrome',
      channel: 'stable',
      family: 'chromium',
      displayName: 'Chrome',
      version: 'latest',
      path: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      majorVersion: 91 // Lägg till majorVersion
    },
    {
      name: 'firefox',
      channel: 'stable',
      family: 'firefox',
      displayName: 'Firefox',
      version: 'latest',
      path: 'C:/Program Files/Mozilla Firefox/firefox.exe',
      majorVersion: 89 // Lägg till majorVersion
    },
    {
      name: 'edge',
      channel: 'stable',
      family: 'chromium',
      displayName: 'Edge',
      version: 'latest',
      path: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      majorVersion: 91 // Lägg till majorVersion
    }
  ]
});