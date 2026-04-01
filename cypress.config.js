const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Base URL for tests
    baseUrl: 'http://localhost:3000',
    
    // Set up URL visit and assertions
    specPattern: 'cypress/e2e/**/*.cy.js',
    
    // Port configuration
    port: 3001,
    
    // Viewport size
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Timeouts
    requestTimeout: 10000,
    responseTimeout: 10000,
    defaultCommandTimeout: 4000,
    
    // Number of retries for failed tests
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    // Video recording
    video: true,
    videoCompression: 32,
    videosFolder: 'cypress/videos',
    
    // Screenshots
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    
    // Downloads
    downloadsFolder: 'cypress/downloads',
    
    // Support file
    supportFile: 'cypress/support/e2e.js',
    
    // Env variables
    env: {
      // Test user credentials (created during tests)
      testEmail: 'test@example.com',
      testPassword: 'TestPassword123!',
      // Google OAuth (if testing social login)
      googleEmail: process.env.CYPRESS_GOOGLE_EMAIL,
      googlePassword: process.env.CYPRESS_GOOGLE_PASSWORD,
    },
    
    // Plugin file
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
});
