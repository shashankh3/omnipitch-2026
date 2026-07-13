import 'cypress-axe';

describe('Accessibility Audit', () => {
  it('Login page has no actionable accessibility violations', () => {
    cy.visit('/');
    cy.injectAxe();
    // Use cypress-axe to check accessibility
    // You can exclude specific rules if needed, but for now we check all
    cy.checkA11y(undefined, {
      includedImpacts: ['critical', 'serious']
    });
  });

  it('Fan Portal has no actionable accessibility violations', () => {
    // For testing purposes, maybe we don't need to authenticate fully, 
    // or we can stub it. Assuming /fan redirects to login if not auth,
    // we should mock or just test the login
    cy.visit('/login');
    cy.get('button').contains('FAN PORTAL').click();
    cy.url().should('include', '/fan');
    cy.injectAxe();
    cy.checkA11y(undefined, {
      includedImpacts: ['critical', 'serious']
    });
  });
});
