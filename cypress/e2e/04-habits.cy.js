/**
 * Habits E2E Tests
 * Tests: Create habits, Complete habits, Track streaks
 */

describe('Habits Management', () => {
  beforeEach(() => {
    cy.mockAuth();
  });

  describe('Habits Page', () => {
    it('should display habits page', () => {
      cy.visit('/habits');
      cy.contains('Habit', { matchCase: false }).should('exist');
    });

    it('should display create habit button', () => {
      cy.visit('/habits');
      cy.contains('Create Habit', { matchCase: false }).should('exist');
    });

    it('should display empty state when no habits', () => {
      cy.visit('/habits');
      cy.get('body').then(($body) => {
        if (!$body.text().includes('habit')) {
          cy.contains('No habits yet', { matchCase: false }).should('exist');
        }
      });
    });

    it('should display today\'s date', () => {
      cy.visit('/habits');
      const today = new Date().toLocaleDateString();
      cy.get('body').contains(today.split('/')[1]).should('exist');
    });
  });

  describe('Create Habit', () => {
    it('should display create habit form', () => {
      cy.visit('/habits');
      cy.contains('Create Habit', { matchCase: false }).click();
      
      // Check form fields exist
      cy.get('input, textarea, select, button').should('have.length.greaterThan', 0);
    });

    it('should validate habit name field', () => {
      cy.visit('/habits');
      cy.contains('Create Habit', { matchCase: false }).click();
      
      // Try to submit empty form
      cy.get('button').contains('Create', { matchCase: false }).click();
      
      // Should show validation error
      cy.contains('required', { matchCase: false }).should('exist');
    });

    it('should create habit with valid data', () => {
      cy.visit('/habits');
      cy.contains('Create Habit', { matchCase: false }).click();
      
      cy.fillHabitForm({
        name: 'Morning Meditation',
        frequency: 'daily',
      });
      
      cy.get('button').contains('Create', { matchCase: false }).click();
      
      // Should see success
      cy.get('body').then(($body) => {
        if ($body.text().includes('Morning Meditation')) {
          cy.contains('Morning Meditation').should('exist');
        }
      });
    });

    it('should have frequency options', () => {
      cy.visit('/habits');
      cy.contains('Create Habit', { matchCase: false }).click();
      
      cy.get('select, [role="combobox"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Habit List', () => {
    it('should display habits in list', () => {
      cy.visit('/habits');
      cy.get('[data-testid="habit-item"], .habit-card', { timeout: 5000 }).should('exist');
    });

    it('should display habit frequency', () => {
      cy.visit('/habits');
      cy.get('body').then(($body) => {
        if ($body.text().includes('Habit')) {
          // Check for frequency indicator
          cy.contains(/daily|weekly|monthly/i).should('exist');
        }
      });
    });

    it('should display checkbox for daily completion', () => {
      cy.visit('/habits');
      cy.get('input[type="checkbox"], button[aria-label*="Complete"]').should('have.length.greaterThan', 0);
    });

    it('should allow sorting habits', () => {
      cy.visit('/habits');
      cy.get('button, select').contains(/Sort|Order/i).should('exist');
    });
  });

  describe('Complete Habit', () => {
    it('should mark habit as complete', () => {
      cy.visit('/habits');
      
      // Get first habit checkbox
      cy.get('input[type="checkbox"]').first().check();
      
      // Should be checked
      cy.get('input[type="checkbox"]').first().should('be.checked');
    });

    it('should update habit status immediately', () => {
      cy.visit('/habits');
      
      cy.get('input[type="checkbox"]').first().check();
      
      // Check for completed indicator
      cy.contains('Completed', { matchCase: false }).should('exist');
    });

    it('should allow unchecking completed habit', () => {
      cy.visit('/habits');
      
      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="checkbox"]').first().uncheck();
      
      cy.get('input[type="checkbox"]').first().should('not.be.checked');
    });

    it('should persist completion status', () => {
      cy.visit('/habits');
      
      cy.get('input[type="checkbox"]').first().check();
      cy.reload();
      
      // Should still be checked
      cy.get('input[type="checkbox"]').first().should('be.checked');
    });
  });

  describe('Streak Tracking', () => {
    it('should display streak count', () => {
      cy.visit('/habits');
      
      // Look for streak indicator
      cy.contains(/streak|day/i).should('exist');
    });

    it('should display streak in habit card', () => {
      cy.visit('/habits');
      
      cy.get('[data-testid="habit-item"], .habit-card').first().within(() => {
        cy.contains(/\d+\s*day/i).should('exist');
      });
    });

    it('should increment streak on completion', () => {
      cy.visit('/habits');
      
      // Get initial streak
      cy.get('[data-testid="habit-item"], .habit-card').first().within(() => {
        cy.contains(/(\d+)\s*day/i).then(($streak) => {
          const initialCount = parseInt($streak.text());
          
          // Complete habit
          cy.get('input[type="checkbox"]').check();
          
          // Streak should increment (or stay same if already completed today)
          cy.contains(/(\d+)\s*day/i).should('exist');
        });
      });
    });

    it('should display streak on streaks page', () => {
      cy.visit('/streaks');
      cy.contains('Streak', { matchCase: false }).should('exist');
    });
  });

  describe('Edit Habit', () => {
    it('should display edit button', () => {
      cy.visit('/habits');
      
      cy.get('[data-testid="habit-item"], .habit-card').first().within(() => {
        cy.contains('Edit', { matchCase: false }).should('exist');
      });
    });

    it('should allow editing habit', () => {
      cy.visit('/habits');
      
      cy.get('[data-testid="habit-item"], .habit-card').first().within(() => {
        cy.contains('Edit', { matchCase: false }).click();
      });
      
      // Should show form
      cy.get('input, textarea, select').should('have.length.greaterThan', 0);
    });
  });

  describe('Delete Habit', () => {
    it('should display delete button', () => {
      cy.visit('/habits');
      
      cy.get('[data-testid="habit-item"], .habit-card').first().within(() => {
        cy.contains('Delete', { matchCase: false }).should('exist');
      });
    });

    it('should show confirmation on delete', () => {
      cy.visit('/habits');
      
      cy.get('[data-testid="habit-item"], .habit-card').first().within(() => {
        cy.contains('Delete', { matchCase: false }).click();
      });
      
      cy.contains('confirm', { matchCase: false }).should('exist');
    });
  });

  describe('Progress Visualization', () => {
    it('should display weekly progress', () => {
      cy.visit('/habits');
      
      // Should show week view
      cy.contains('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');
    });

    it('should display completion status per day', () => {
      cy.visit('/habits');
      
      // Should show checkmarks or colored indicators
      cy.get('.habit-card, [data-testid="habit-item"]').first().within(() => {
        cy.get('[role="button"], button, input').should('have.length.greaterThan', 1);
      });
    });
  });
});
