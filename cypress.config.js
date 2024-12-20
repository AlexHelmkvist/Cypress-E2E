const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {

    },
    //baseUrl: "https://test-gateway.zignsec.com/api/v5/sessions/scanning-dp50/web",
  },
  browsers: [
    {
      name: 'chrome',
      channel: 'stable',
      family: 'chromium',
      displayName: 'Chrome',
      version: 'latest',
      path: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      majorVersion: 91,
      info: 'Inställningar för Chrome'
    },
    {
      name: 'firefox',
      channel: 'stable',
      family: 'firefox',
      displayName: 'Firefox',
      version: 'latest',
      path: 'C:/Program Files/Mozilla Firefox/firefox.exe',
      majorVersion: 89,
      info: 'Inställningar för Firefox'
    },
    {
      name: 'edge',
      channel: 'stable',
      family: 'chromium',
      displayName: 'Edge',
      version: 'latest',
      path: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      majorVersion: 91,
      info: 'Inställningar för Edge'
    }
  ]
});
