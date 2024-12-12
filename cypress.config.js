const { defineConfig } = require('cypress');
const selenium = require('selenium-webdriver');

module.exports = defineConfig({
  chromeWebSecurity: false,
  e2e: {
    setupNodeEvents(on, config) {
      // Lägg till Selenium WebDriver-konfiguration här
      on('task', {
        startWebDriver({ browser }) {
          const driver = new selenium.Builder().forBrowser(browser).build();
          return driver.getSession().then(session => {
            return { sessionId: session.getId(), capabilities: session.getCapabilities() };
          });
        },
        stopWebDriver({ sessionId }) {
          const driver = new selenium.Builder().usingServer().build();
          return driver.quit();
        }
      });

      return require('./cypress/plugins/index.js')(on, config);
    }
  }
});
