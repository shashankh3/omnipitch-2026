describe('OmniPitch i18n and Language Switching', () => {
  beforeEach(() => {
    // Navigate to the app root
    cy.visit('http://localhost:5173/');
  });

  it('changes language on the login page', () => {
    // Default is English
    cy.contains('Select Persona').should('exist');
    cy.get('html').should('have.attr', 'lang', 'en');

    // Open language selector
    cy.get('[aria-label="Select Language"]').click();

    // Select Spanish
    cy.contains('Español').click();

    // Verify language changed
    cy.contains('Seleccionar Perfil').should('exist');
    cy.get('html').should('have.attr', 'lang', 'es');
  });

  it('persists language selection across views', () => {
    // Select Spanish on login
    cy.get('[aria-label="Select Language"]').click();
    cy.contains('Español').click();

    // Click Fan Experience login
    cy.contains('Experiencia del Aficionado').click();

    // Verify we are on fan dashboard and it is still in Spanish
    cy.url().should('include', '/fan');
    cy.contains('DESCONECTAR').should('exist');
    cy.get('html').should('have.attr', 'lang', 'es');
  });
});
