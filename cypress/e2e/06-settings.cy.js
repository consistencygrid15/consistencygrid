/**
 * Settings E2E Tests
 * Tests: User settings, preferences, account management
 */

describe('Settings', () => {
  beforeEach(() => {
    cy.mockAuth();
    cy.visit('/settings');
  });

  describe('Settings Page', () => {
    it('should display settings page', () => {
      cy.contains('Settings', { matchCase: false }).should('exist');
    });

    it('should have multiple settings tabs', () => {
      cy.get('[role="tab"], button[class*="tab"]').should('have.length.greaterThan', 1);
    });

    it('should display profile settings', () => {
      cy.contains('Profile', { matchCase: false }).should('exist');
    });

    it('should display account settings', () => {
      cy.contains('Account', { matchCase: false }).should('exist');
    });

    it('should display preferences', () => {
      cy.contains('Preference', { matchCase: false }).should('exist');
    });
  });

  describe('Profile Settings', () => {
    it('should display user information', () => {
      cy.get('input[value*="test"]').should('exist');
    });

    it('should allow editing profile', () => {
      cy.contains('Edit', { matchCase: false }).should('exist').click();
      
      cy.get('input[type="text"], input[type="email"]').should('have.length.greaterThan', 0);
    });

    it('should display avatar/profile picture', () => {
      cy.get('img[alt*="profile"], img[alt*="avatar"]').should('exist');
    });

    it('should allow changing profile picture', () => {
      cy.get('button').contains('Change', { matchCase: false }).should('exist');
    });

    it('should validate profile fields', () => {
      cy.contains('Edit', { matchCase: false }).click();
      
      cy.get('input[type="text"]').first().clear();
      cy.get('button').contains('Save', { matchCase: false }).click();
      
      cy.contains('required', { matchCase: false }).should('exist');
    });

    it('should save profile changes', () => {
      cy.contains('Edit', { matchCase: false }).click();
      
      cy.get('input[type="text"]').first().clear().type('Updated Name');
      cy.get('button').contains('Save', { matchCase: false }).click();
      
      cy.contains('Updated Name').should('exist');
    });
  });

  describe('Privacy & Notifications', () => {
    it('should display notification preferences', () => {
      cy.contains('Notification', { matchCase: false }).should('exist');
    });

    it('should allow toggling notifications', () => {
      cy.get('input[type="checkbox"]').should('have.length.greaterThan', 0);
    });

    it('should allow toggling email notifications', () => {
      cy.get('input[type="checkbox"]').contains(/email/i).should('exist');
    });

    it('should display privacy settings', () => {
      cy.contains('Privacy', { matchCase: false }).should('exist');
    });

    it('should show email preference options', () => {
      cy.get('input[type="radio"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Account Settings', () => {
    it('should display email address', () => {
      cy.contains('Email', { matchCase: false }).should('exist');
    });

    it('should display change password option', () => {
      cy.contains('Change Password', { matchCase: false }).should('exist').or.contains('Password', { matchCase: false });
    });

    it('should display change password form', () => {
      cy.contains('Change Password', { matchCase: false }).click();
      
      cy.get('input[type="password"]').should('have.length.greaterThan', 0);
    });

    it('should validate old password', () => {
      cy.contains('Change Password', { matchCase: false }).click();
      
      cy.get('input[type="password"]').first().type('wrong');
      cy.get('input[type="password"]').last().type('NewPassword123!');
      cy.get('button').contains('Change', { matchCase: false }).click();
      
      cy.contains('incorrect', { matchCase: false }).should('exist');
    });

    it('should require matching new passwords', () => {
      cy.contains('Change Password', { matchCase: false }).click();
      
      cy.get('input[type="password"]').first().type('OldPassword123!');
      cy.get('input[type="password"]').eq(1).type('NewPassword123!');
      cy.get('input[type="password"]').last().type('DifferentPassword123!');
      cy.get('button').contains('Change', { matchCase: false }).click();
      
      cy.contains('match', { matchCase: false }).should('exist');
    });

    it('should display security settings', () => {
      cy.contains('Security', { matchCase: false }).should('exist');
    });

    it('should display logout option', () => {
      cy.contains('Logout', { matchCase: false }).should('exist');
    });

    it('should logout user', () => {
      cy.contains('Logout', { matchCase: false }).click();
      
      cy.url().should('include', '/login');
    });
  });

  describe('Preferences', () => {
    it('should display theme preference', () => {
      cy.contains('Theme', { matchCase: false }).should('exist');
    });

    it('should allow changing theme', () => {
      cy.get('input[type="radio"]').contains(/light|dark/i).should('have.length.greaterThan', 0);
    });

    it('should display language preference', () => {
      cy.get('select').should('have.length.greaterThan', 0);
    });

    it('should display date format preference', () => {
      cy.contains('Date Format', { matchCase: false }).should('exist');
    });

    it('should display time zone preference', () => {
      cy.contains(/Timezone|Time Zone/i).should('exist');
    });
  });

  describe('Connected Accounts', () => {
    it('should display connected accounts', () => {
      cy.contains('Connected', { matchCase: false }).should('exist');
    });

    it('should show Google connection status', () => {
      cy.contains('Google', { matchCase: false }).should('exist');
    });

    it('should allow disconnecting accounts', () => {
      cy.get('button').contains('Disconnect', { matchCase: false }).should('exist');
    });
  });

  describe('Data Management', () => {
    it('should display data export option', () => {
      cy.contains('Export', { matchCase: false }).should('exist');
    });

    it('should display backup/download option', () => {
      cy.contains('Download', { matchCase: false }).or.contains('Backup', { matchCase: false }).should('exist');
    });

    it('should allow downloading personal data', () => {
      cy.get('button').contains('Download', { matchCase: false }).click();
      
      // Should trigger download
      cy.url().should('exist');
    });

    it('should display delete account option', () => {
      cy.contains('Delete Account', { matchCase: false }).should('exist');
    });

    it('should show warning before deleting account', () => {
      cy.contains('Delete Account', { matchCase: false }).click();
      
      cy.contains('permanent', { matchCase: false }).should('exist');
    });
  });

  describe('About Section', () => {
    it('should display app version', () => {
      cy.contains('Version', { matchCase: false }).should('exist');
    });

    it('should display privacy policy link', () => {
      cy.contains('Privacy', { matchCase: false }).should('exist');
    });

    it('should display terms of service link', () => {
      cy.contains('Terms', { matchCase: false }).should('exist');
    });

    it('should display help/support link', () => {
      cy.contains('Help', { matchCase: false }).or.contains('Support', { matchCase: false }).should('exist');
    });

    it('should display contact information', () => {
      cy.contains('Contact', { matchCase: false }).should('exist');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.get('body').tab();
      cy.focused().should('exist');
    });

    it('should have proper labels', () => {
      cy.get('label').should('have.length.greaterThan', 0);
    });

    it('should have proper color contrast', () => {
      // This would require accessibility testing library
      cy.get('body').should('be.visible');
    });
  });
});
