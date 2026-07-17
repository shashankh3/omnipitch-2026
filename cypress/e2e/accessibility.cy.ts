import 'cypress-axe';

describe('Accessibility Audit', () => {
  it('Login page has no actionable accessibility violations', () => {
    cy.visit('/');
    cy.injectAxe();
    // Use cypress-axe to check accessibility
    cy.checkA11y(undefined, {
      includedImpacts: ['critical', 'serious']
    });
  });

  it('Fan Portal has no actionable accessibility violations', () => {
    cy.visit('/');
    cy.get('[aria-label="Enter Fan Experience Portal"]').click();
    cy.url().should('include', '/fan');
    cy.injectAxe();
    cy.checkA11y(undefined, {
      includedImpacts: ['critical', 'serious']
    });
  });
});
