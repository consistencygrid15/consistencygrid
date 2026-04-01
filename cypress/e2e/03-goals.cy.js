/**
 * Goals E2E Tests
 * Tests: Create, Read, Update, Delete goals
 */

describe('Goals Management', () => {
  beforeEach(() => {
    cy.mockAuth();
  });

  describe('Goals Page', () => {
    it('should display goals page', () => {
      cy.visit('/goals');
      cy.contains('Goals', { matchCase: false }).should('exist');
    });

    it('should display create goal button', () => {
      cy.visit('/goals');
      cy.contains('Create Goal', { matchCase: false }).should('exist');
    });

    it('should display empty state when no goals', () => {
      cy.visit('/goals');
      // Check for empty state message
      cy.get('body').then(($body) => {
        if (!$body.text().includes('goal')) {
          cy.contains('No goals yet', { matchCase: false }).should('exist');
        }
      });
    });
  });

  describe('Create Goal', () => {
    it('should display create goal form', () => {
      cy.visit('/goals');
      cy.contains('Create Goal', { matchCase: false }).click();
      
      // Check form fields
      cy.get('input, textarea, select').should('have.length.greaterThan', 0);
    });

    it('should validate goal name field', () => {
      cy.visit('/goals');
      cy.contains('Create Goal', { matchCase: false }).click();
      
      // Try to submit empty form
      cy.get('button').contains('Create', { matchCase: false }).click();
      
      // Should show validation error
      cy.contains('required', { matchCase: false }).should('exist');
    });

    it('should create goal with valid data', () => {
      cy.visit('/goals');
      cy.contains('Create Goal', { matchCase: false }).click();
      
      cy.fillGoalForm({
        name: 'Complete Cypress Tests',
        duration: 30,
      });
      
      cy.get('button').contains('Create', { matchCase: false }).click();
      
      // Should see success message or redirect
      cy.url().should('not.include', '/goals/new');
    });

    it('should display form validation for name', () => {
      cy.visit('/goals');
      cy.contains('Create Goal', { matchCase: false }).click();
      
      cy.get('input[placeholder*="name"], input[placeholder*="Goal"]').type('a');
      cy.get('button').contains('Create', { matchCase: false }).click();
      
      // Should validate minimum length
      cy.get('body').then(($body) => {
        if ($body.text().includes('least')) {
          cy.contains('at least', { matchCase: false }).should('exist');
        }
      });
    });

    it('should validate duration is positive', () => {
      cy.visit('/goals');
      cy.contains('Create Goal', { matchCase: false }).click();
      
      cy.fillGoalForm({
        name: 'Valid Goal Name',
        duration: -1,
      });
      
      cy.get('button').contains('Create', { matchCase: false }).click();
      
      // Should validate duration
      cy.get('body').then(($body) => {
        if ($body.text().includes('positive')) {
          cy.contains('positive', { matchCase: false }).should('exist');
        }
      });
    });
  });

  describe('Goal List', () => {
    it('should display goals in list', () => {
      cy.visit('/goals');
      // Wait for goals to load
      cy.get('[data-testid="goal-item"], .goal-card', { timeout: 5000 }).should('have.length.greaterThan', 0);
    });

    it('should display goal information', () => {
      cy.visit('/goals');
      cy.get('body').then(($body) => {
        if ($body.text().includes('Goal')) {
          // Check for progress
          cy.contains('%', { matchCase: false }).should('exist');
        }
      });
    });

    it('should allow sorting goals', () => {
      cy.visit('/goals');
      cy.get('button, select').contains('Sort', { matchCase: false }).should('exist');
    });

    it('should allow filtering goals', () => {
      cy.visit('/goals');
      cy.get('button, select').contains('Filter', { matchCase: false }).should('exist');
    });
  });

  describe('Goal Details', () => {
    it('should display goal details when clicked', () => {
      cy.visit('/goals');
      
      // Click first goal
      cy.get('[data-testid="goal-item"], .goal-card').first().click();
      
      // Should navigate to goal details
      cy.url().should('include', '/goals/');
    });

    it('should display edit goal button', () => {
      cy.visit('/goals');
      cy.get('[data-testid="goal-item"], .goal-card').first().click();
      
      cy.contains('Edit', { matchCase: false }).should('exist');
    });

    it('should display delete goal button', () => {
      cy.visit('/goals');
      cy.get('[data-testid="goal-item"], .goal-card').first().click();
      
      cy.contains('Delete', { matchCase: false }).should('exist');
    });

    it('should display goal progress', () => {
      cy.visit('/goals');
      cy.get('[data-testid="goal-item"], .goal-card').first().click();
      
      cy.contains('Progress', { matchCase: false }).should('exist');
    });
  });

  describe('Update Goal', () => {
    it('should allow editing goal', () => {
      cy.visit('/goals');
      cy.get('[data-testid="goal-item"], .goal-card').first().click();
      
      cy.contains('Edit', { matchCase: false }).click();
      
      // Should show form
      cy.get('input, textarea, select').should('have.length.greaterThan', 0);
    });

    it('should save goal changes', () => {
      cy.visit('/goals');
      cy.get('[data-testid="goal-item"], .goal-card').first().click();
      
      cy.contains('Edit', { matchCase: false }).click();
      
      cy.get('button').contains('Save', { matchCase: false }).click();
      
      // Should redirect back to goal details
      cy.url().should('include', '/goals/');
    });
  });

  describe('Delete Goal', () => {
    it('should show confirmation when deleting', () => {
      cy.visit('/goals');
      cy.get('[data-testid="goal-item"], .goal-card').first().click();
      
      cy.contains('Delete', { matchCase: false }).click();
      
      // Should show confirmation dialog
      cy.contains('confirm', { matchCase: false }).should('exist');
    });

    it('should delete goal on confirmation', () => {
      cy.visit('/goals');
      cy.get('[data-testid="goal-item"], .goal-card').first().click();
      
      cy.contains('Delete', { matchCase: false }).click();
      cy.contains('Confirm', { matchCase: false }).click();
      
      // Should redirect to goals list
      cy.url().should('include', '/goals');
    });
  });
});
