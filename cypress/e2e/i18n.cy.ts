describe('OmniPitch i18n and Language Switching', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('changes language on the login page', () => {
    // Default is English
    cy.contains('Fan Experience').should('exist');
    cy.get('html').should('have.attr', 'lang', 'en');

    // Open language selector
    cy.get('[aria-label="Select Language"]').click();

    // Select Spanish
    cy.get('button[role="option"]').contains(/^es$/i).click({ force: true });

    // Verify language changed
    cy.contains('Experiencia del Fan').should('exist');
    cy.get('html').should('have.attr', 'lang', 'es');
  });

  it('persists language selection across views', () => {
    // Select Spanish on login
    cy.get('[aria-label="Select Language"]').click();
    cy.get('button[role="option"]').contains(/^es$/i).click({ force: true });

    // Click Fan Experience login (force to avoid dropdown overlay interference)
    cy.get('[data-cy="login-fan"]').click({ force: true });

    // Verify we are on fan dashboard and it is still in Spanish
    cy.url().should('include', '/fan');
    cy.contains('DESCONECTAR').should('exist');
    cy.get('html').should('have.attr', 'lang', 'es');
  });
});
