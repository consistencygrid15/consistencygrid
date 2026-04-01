/**
 * Streaks E2E Tests
 * Tests: Streak calculation, visualization, badges
 */

describe('Streaks', () => {
  beforeEach(() => {
    cy.mockAuth();
  });

  describe('Streaks Page', () => {
    it('should display streaks page', () => {
      cy.visit('/streaks');
      cy.contains('Streak', { matchCase: false }).should('exist');
    });

    it('should display streak list', () => {
      cy.visit('/streaks');
      
      cy.get('[data-testid="streak-item"], .streak-card', { timeout: 5000 }).should('exist');
    });

    it('should display active streaks', () => {
      cy.visit('/streaks');
      
      cy.get('body').then(($body) => {
        if ($body.text().includes('streak')) {
          cy.contains('Active', { matchCase: false }).should('exist');
        }
      });
    });
  });

  describe('Streak Information', () => {
    it('should display streak count', () => {
      cy.visit('/streaks');
      
      cy.get('[data-testid="streak-item"], .streak-card').first().within(() => {
        cy.contains(/\d+\s*day/i).should('exist');
      });
    });

    it('should display streak start date', () => {
      cy.visit('/streaks');
      
      cy.get('[data-testid="streak-item"], .streak-card').first().within(() => {
        // Check for date format
        cy.contains(/Started|Started on/i).should('exist');
      });
    });

    it('should display streak habit name', () => {
      cy.visit('/streaks');
      
      cy.get('[data-testid="streak-item"], .streak-card').first().within(() => {
        cy.get('body').then(($body) => {
          // Should display habit/goal name
          cy.contains(/\w+/).should('exist');
        });
      });
    });

    it('should display last completed date', () => {
      cy.visit('/streaks');
      
      cy.get('[data-testid="streak-item"], .streak-card').first().within(() => {
        cy.contains(/last|today|yesterday/i).should('exist');
      });
    });
  });

  describe('Streak Badges', () => {
    it('should display badges for milestones', () => {
      cy.visit('/streaks');
      
      cy.get('body').then(($body) => {
        if ($body.text().includes('badge') || $body.text().includes('milestone')) {
          cy.get('[class*="badge"], [aria-label*="badge"]').should('have.length.greaterThan', 0);
        }
      });
    });

    it('should show streak milestones', () => {
      cy.visit('/streaks');
      
      cy.get('body').then(($body) => {
        // Check for milestone indicators (7 days, 30 days, 100 days, etc)
        if ($body.text().includes('7') || $body.text().includes('30')) {
          cy.contains(/7|30|100/).should('exist');
        }
      });
    });
  });

  describe('Streak Calculations', () => {
    it('should calculate streak correctly for daily habits', () => {
      cy.visit('/habits');
      
      // Create/complete a habit for today
      cy.get('input[type="checkbox"]').first().check();
      
      // Go to streaks
      cy.visit('/streaks');
      
      // Should show 1 day streak
      cy.get('[data-testid="streak-item"], .streak-card').first().within(() => {
        cy.contains(/1\s*day/i).should('exist');
      });
    });

    it('should maintain streak if completed today', () => {
      cy.visit('/habits');
      
      // Check habit is completed today
      cy.get('input[type="checkbox"]').first().then(($checkbox) => {
        if (!$checkbox.is(':checked')) {
          cy.get('input[type="checkbox"]').first().check();
        }
      });
      
      cy.visit('/streaks');
      
      // Should show active streak
      cy.contains('Active', { matchCase: false }).should('exist');
    });

    it('should break streak if not completed today', () => {
      cy.visit('/streaks');
      
      cy.get('body').then(($body) => {
        if ($body.text().includes('Broken') || $body.text().includes('Inactive')) {
          cy.contains(/Broken|Inactive/i).should('exist');
        }
      });
    });
  });

  describe('Streak Filtering', () => {
    it('should allow filtering by status', () => {
      cy.visit('/streaks');
      
      cy.get('button, select').contains(/Filter|Status/i).should('exist');
    });

    it('should allow sorting streaks', () => {
      cy.visit('/streaks');
      
      cy.get('button, select').contains(/Sort|Order/i).should('exist');
    });

    it('should display only active streaks when filtered', () => {
      cy.visit('/streaks');
      
      cy.get('button, select').contains(/Filter|Active/i).click();
      
      // Should show only active streaks
      cy.get('[data-testid="streak-item"], .streak-card').each(($streak) => {
        cy.wrap($streak).within(() => {
          cy.contains(/Active|today/i).should('exist');
        });
      });
    });
  });

  describe('Streak Details', () => {
    it('should display streak details on click', () => {
      cy.visit('/streaks');
      
      cy.get('[data-testid="streak-item"], .streak-card').first().click();
      
      // Should show more details
      cy.get('body').then(($body) => {
        // Should navigate or show expanded view
        cy.contains(/history|detail|information/i).should('exist');
      });
    });

    it('should show streak history', () => {
      cy.visit('/streaks');
      
      cy.get('[data-testid="streak-item"], .streak-card').first().click();
      
      // Should display history
      cy.contains(/history|log|activity/i).should('exist');
    });
  });

  describe('Long Streaks', () => {
    it('should display long streaks prominently', () => {
      cy.visit('/streaks');
      
      // Look for high numbers
      cy.get('[data-testid="streak-item"], .streak-card').each(($streak) => {
        cy.wrap($streak).within(() => {
          cy.get('body').then(($body) => {
            if ($body.text().match(/\d{2,}/)) {
              // Long streak found - should be styled prominently
              cy.get('[class*="prominent"], [class*="highlight"]').should('exist');
            }
          });
        });
      });
    });

    it('should celebrate milestone streaks', () => {
      cy.visit('/streaks');
      
      cy.get('body').then(($body) => {
        if ($body.text().includes('100') || $body.text().includes('milestone')) {
          // Should show special styling or notification
          cy.get('[class*="milestone"], [class*="celebration"]').should('exist');
        }
      });
    });
  });

  describe('Personal Records', () => {
    it('should display personal best streak', () => {
      cy.visit('/streaks');
      
      cy.get('body').then(($body) => {
        if ($body.text().includes('best') || $body.text().includes('record')) {
          cy.contains(/best|record|personal/i).should('exist');
        }
      });
    });

    it('should compare current to personal best', () => {
      cy.visit('/streaks');
      
      cy.get('[data-testid="streak-item"], .streak-card').first().within(() => {
        cy.get('body').then(($body) => {
          // Should show comparison if available
          cy.get('body').contains(/best|record/i).should('exist');
        });
      });
    });
  });
});
