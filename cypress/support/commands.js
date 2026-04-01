/**
 * Custom Cypress Commands for Consistency Grid
 * Reusable test helpers
 */

/**
 * Login via email/password
 * Usage: cy.login('user@example.com', 'password')
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button').contains('Sign In', { matchCase: false }).click();
  cy.url().should('include', '/dashboard');
});

/**
 * Sign up new account
 * Usage: cy.signup('user@example.com', 'password', 'John')
 */
Cypress.Commands.add('signup', (email, password, name) => {
  cy.visit('/signup');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').first().type(password);
  cy.get('input[type="password"]').last().type(password);
  cy.get('input[type="text"]').type(name);
  cy.get('button').contains('Create Account', { matchCase: false }).click();
  cy.url().should('include', '/onboarding');
});

/**
 * Logout
 * Usage: cy.logout()
 */
Cypress.Commands.add('logout', () => {
  cy.visit('/settings');
  cy.get('button').contains('Logout', { matchCase: false }).click();
  cy.url().should('include', '/login');
});

/**
 * Create a goal
 * Usage: cy.createGoal({ name: 'Run 5K', category: 'Health', duration: 30 })
 */
Cypress.Commands.add('createGoal', (goalData) => {
  cy.visit('/goals');
  cy.get('button').contains('Create Goal', { matchCase: false }).click();
  
  if (goalData.name) {
    cy.get('input[placeholder*="Goal name"]').type(goalData.name);
  }
  if (goalData.category) {
    cy.get('select, [role="combobox"]').first().select(goalData.category);
  }
  if (goalData.duration) {
    cy.get('input[type="number"]').type(goalData.duration);
  }
  
  cy.get('button').contains('Create', { matchCase: false }).click();
  cy.contains(goalData.name).should('exist');
});

/**
 * Complete a habit
 * Usage: cy.completeHabit('Morning Run')
 */
Cypress.Commands.add('completeHabit', (habitName) => {
  cy.visit('/habits');
  cy.contains(habitName).parent().within(() => {
    cy.get('button, input[type="checkbox"]').click();
  });
  cy.contains('Completed').should('exist');
});

/**
 * Check streak is calculated
 * Usage: cy.checkStreak('Running', 5)
 */
Cypress.Commands.add('checkStreak', (habitName, expectedDays) => {
  cy.contains(habitName).parent().within(() => {
    cy.contains(`${expectedDays} day streak`).should('exist');
  });
});

/**
 * Navigate to section
 * Usage: cy.goTo('dashboard')
 */
Cypress.Commands.add('goTo', (section) => {
  const sectionMap = {
    dashboard: '/dashboard',
    goals: '/goals',
    habits: '/habits',
    reminders: '/reminders',
    streaks: '/streaks',
    settings: '/settings',
    generator: '/generator',
  };
  
  cy.visit(sectionMap[section] || `/${section}`);
});

/**
 * Wait for API response
 * Usage: cy.waitForAPI('/api/goals')
 */
Cypress.Commands.add('waitForAPI', (endpoint) => {
  cy.intercept(endpoint).as('apiCall');
  cy.wait('@apiCall');
});

/**
 * Check if user is logged in
 * Usage: cy.isLoggedIn()
 */
Cypress.Commands.add('isLoggedIn', () => {
  cy.visit('/dashboard');
  cy.url().should('include', '/dashboard');
});

/**
 * Check if user is logged out
 * Usage: cy.isLoggedOut()
 */
Cypress.Commands.add('isLoggedOut', () => {
  cy.visit('/dashboard');
  cy.url().should('include', '/login');
});

/**
 * Fill goal form
 * Usage: cy.fillGoalForm(goalData)
 */
Cypress.Commands.add('fillGoalForm', (data) => {
  if (data.name) {
    cy.get('input[placeholder*="name"], input[placeholder*="Goal"]').type(data.name);
  }
  if (data.description) {
    cy.get('textarea').type(data.description);
  }
  if (data.category) {
    cy.get('select').select(data.category);
  }
  if (data.duration) {
    cy.get('input[type="number"]').type(data.duration);
  }
});

/**
 * Fill habit form
 * Usage: cy.fillHabitForm(habitData)
 */
Cypress.Commands.add('fillHabitForm', (data) => {
  if (data.name) {
    cy.get('input[placeholder*="name"], input[placeholder*="habit"]').type(data.name);
  }
  if (data.frequency) {
    cy.get('select').select(data.frequency);
  }
});

/**
 * Get auth token
 * Usage: cy.getAuthToken()
 */
Cypress.Commands.add('getAuthToken', () => {
  return cy.window().then(win => {
    return win.localStorage.getItem('authToken');
  });
});

/**
 * Mock authentication
 * Usage: cy.mockAuth()
 */
Cypress.Commands.add('mockAuth', () => {
  cy.window().then(win => {
    // Mock NextAuth session
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  });
});
