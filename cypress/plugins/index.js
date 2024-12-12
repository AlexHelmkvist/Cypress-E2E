/// <reference types="cypress" />
const selenium = require('selenium-webdriver');

module.exports = (on, config) => {
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
};

// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
}
