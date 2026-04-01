/**
 * Authentication E2E Tests
 * Tests: Login, Signup, Logout, Session Management
 */

describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Login', () => {
    it('should display login page', () => {
      cy.visit('/login');
      cy.contains('Sign In').should('exist');
      cy.get('input[type="email"]').should('exist');
      cy.get('input[type="password"]').should('exist');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button').contains('Sign In', { matchCase: false }).click();
      
      // Should show error message
      cy.contains('Invalid credentials', { matchCase: false }).should('exist');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/login');
      cy.get('button').contains('Sign In', { matchCase: false }).click();
      
      // Should show validation errors
      cy.contains('required', { matchCase: false }).should('exist');
    });

    it('should show email validation error for invalid email', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('invalidemail');
      cy.get('button').contains('Sign In', { matchCase: false }).click();
      
      // Should show email validation error
      cy.contains('valid email', { matchCase: false }).should('exist');
    });

    it('should have link to signup', () => {
      cy.visit('/login');
      cy.contains('Create an account').should('exist').click();
      cy.url().should('include', '/signup');
    });

    it('should have link to forgot password', () => {
      cy.visit('/login');
      cy.contains('Forgot password', { matchCase: false }).should('exist');
    });
  });

  describe('Signup', () => {
    it('should display signup page', () => {
      cy.visit('/signup');
      cy.contains('Create Account', { matchCase: false }).should('exist');
      cy.get('input[type="email"]').should('exist');
      cy.get('input[type="password"]').should('have.length', 2);
    });

    it('should validate password match', () => {
      cy.visit('/signup');
      cy.get('input[type="email"]').type('newuser@example.com');
      cy.get('input[type="password"]').first().type('Password123!');
      cy.get('input[type="password"]').last().type('DifferentPassword123!');
      cy.get('button').contains('Create Account', { matchCase: false }).click();
      
      // Should show password mismatch error
      cy.contains('match', { matchCase: false }).should('exist');
    });

    it('should validate password strength', () => {
      cy.visit('/signup');
      cy.get('input[type="email"]').type('newuser@example.com');
      cy.get('input[type="password"]').first().type('weak');
      cy.get('input[type="password"]').last().type('weak');
      cy.get('button').contains('Create Account', { matchCase: false }).click();
      
      // Should show password strength error
      cy.contains('password', { matchCase: false }).should('exist');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/signup');
      cy.get('button').contains('Create Account', { matchCase: false }).click();
      
      // Should show validation errors
      cy.contains('required', { matchCase: false }).should('exist');
    });

    it('should have link to login', () => {
      cy.visit('/signup');
      cy.contains('already have an account', { matchCase: false }).should('exist').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Session Management', () => {
    it('should maintain session on page refresh', () => {
      cy.mockAuth();
      cy.visit('/dashboard');
      cy.isLoggedIn();
      
      // Refresh page
      cy.reload();
      cy.isLoggedIn();
    });

    it('should clear session on logout', () => {
      cy.mockAuth();
      cy.visit('/dashboard');
      cy.isLoggedIn();
      
      // Logout
      cy.visit('/settings');
      cy.get('button').contains('Logout', { matchCase: false }).click();
      
      // Should be redirected to login
      cy.url().should('include', '/login');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing dashboard without auth', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });

    it('should redirect to login when accessing goals without auth', () => {
      cy.visit('/goals');
      cy.url().should('include', '/login');
    });

    it('should redirect to login when accessing habits without auth', () => {
      cy.visit('/habits');
      cy.url().should('include', '/login');
    });

    it('should redirect to login when accessing settings without auth', () => {
      cy.visit('/settings');
      cy.url().should('include', '/login');
    });
  });

  describe('Password Reset', () => {
    it('should display forgot password page', () => {
      cy.visit('/login');
      cy.contains('Forgot password', { matchCase: false }).click();
      cy.url().should('include', '/forgot-password');
    });

    it('should validate email on password reset', () => {
      cy.visit('/forgot-password');
      cy.get('input[type="email"]').type('invalidemail');
      cy.get('button').contains('Send', { matchCase: false }).click();
      
      // Should show validation error
      cy.contains('valid email', { matchCase: false }).should('exist');
    });

    it('should have link back to login', () => {
      cy.visit('/forgot-password');
      cy.contains('Back to Sign In', { matchCase: false }).should('exist').click();
      cy.url().should('include', '/login');
    });
  });
});
