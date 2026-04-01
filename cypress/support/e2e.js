// Cypress E2E Support File
// Runs before each test

import './commands';

// Disable console errors in tests (optional)
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific errors if needed
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  // Let other errors fail the test
  return true;
});

// Reset app state before each test
beforeEach(() => {
  // Clear localStorage
  cy.window().then(win => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});

// Global test timeout
Cypress.config('defaultCommandTimeout', 4000);
