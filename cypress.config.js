const { defineConfig } = require("cypress");
require('dotenv').config()

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      config.env.BASE_URL = process.env.BASE_URL;
      config.env.PRODUCTION_URL = process.env.PRODUCTION_URL;
      
      const version = config.env.VERSION || 'local'

      const urls = {
        local: config.env.BASE_URL,
        prod: config.env.PRODUCTION_URL
      }

      // choosing version from urls object
      config.baseUrl = urls[version]

      return config
    },
    "chromeWebSecurity": false,
  }
});
