/**
 * Dashboard E2E Tests
 * Tests: Dashboard loading, stats display, navigation
 */

describe('Dashboard', () => {
  beforeEach(() => {
    cy.mockAuth();
    cy.visit('/dashboard');
  });

  describe('Page Loading', () => {
    it('should load dashboard successfully', () => {
      cy.isLoggedIn();
      cy.contains('Dashboard', { matchCase: false }).should('exist');
    });

    it('should display main dashboard sections', () => {
      cy.contains('Goals', { matchCase: false }).should('exist');
      cy.contains('Habits', { matchCase: false }).should('exist');
      cy.contains('Streak', { matchCase: false }).should('exist');
    });

    it('should display user stats', () => {
      cy.contains('Today', { matchCase: false }).should('exist');
      cy.contains('Week', { matchCase: false }).should('exist');
      cy.contains('Month', { matchCase: false }).should('exist');
    });
  });

  describe('Stats Display', () => {
    it('should display goals count', () => {
      cy.contains('Goal').should('exist');
      // Check if numeric value exists
      cy.get('body').then(($body) => {
        if ($body.text().includes('0')) {
          cy.contains(/\d+/).should('exist');
        }
      });
    });

    it('should display habits count', () => {
      cy.contains('Habit').should('exist');
    });

    it('should display streak count', () => {
      cy.contains('Streak', { matchCase: false }).should('exist');
    });

    it('should display life completion percentage', () => {
      cy.contains('%', { matchCase: false }).should('exist');
    });
  });

  describe('Quick Actions', () => {
    it('should have button to create goal', () => {
      cy.contains('Create Goal', { matchCase: false }).should('exist').and('be.visible');
    });

    it('should have button to create habit', () => {
      cy.contains('Create Habit', { matchCase: false }).should('exist').and('be.visible');
    });

    it('should navigate to goals when clicking create goal', () => {
      cy.contains('Create Goal', { matchCase: false }).click();
      cy.url().should('include', '/goals');
    });

    it('should navigate to habits when clicking create habit', () => {
      cy.contains('Create Habit', { matchCase: false }).click();
      cy.url().should('include', '/habits');
    });
  });

  describe('Navigation', () => {
    it('should navigate to goals section', () => {
      cy.contains('Goals', { matchCase: false }).click();
      cy.url().should('include', '/goals');
    });

    it('should navigate to habits section', () => {
      cy.contains('Habits', { matchCase: false }).click();
      cy.url().should('include', '/habits');
    });

    it('should navigate to settings', () => {
      cy.contains('Settings', { matchCase: false }).click();
      cy.url().should('include', '/settings');
    });

    it('should navigate to generator', () => {
      cy.contains('Generator', { matchCase: false }).click();
      cy.url().should('include', '/generator');
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile', () => {
      cy.viewport('iphone-x');
      cy.contains('Dashboard', { matchCase: false }).should('exist');
      cy.contains('Goals', { matchCase: false }).should('be.visible');
    });

    it('should display correctly on tablet', () => {
      cy.viewport('ipad-2');
      cy.contains('Dashboard', { matchCase: false }).should('exist');
      cy.contains('Goals', { matchCase: false }).should('be.visible');
    });

    it('should display correctly on desktop', () => {
      cy.viewport(1280, 720);
      cy.contains('Dashboard', { matchCase: false }).should('exist');
    });
  });
});
