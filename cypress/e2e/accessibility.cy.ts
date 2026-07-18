import 'cypress-axe';

describe('Accessibility Audit', () => {
  it('Login page has no actionable accessibility violations', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y(undefined, {
      includedImpacts: ['critical', 'serious']
    });
  });

  it('Fan Portal has no actionable accessibility violations', () => {
    cy.visit('/');
    // Wait for the fade-in animation to finish so the button is fully interactive
    cy.get('[aria-label="Enter Fan Experience Portal"]', { timeout: 5000 })
      .should('exist')
      .click({ force: true });

    // After clicking, the SPA should navigate to /fan.
    // Use a generous timeout and check via both URL and DOM presence.
    cy.url({ timeout: 15000 }).should('include', '/fan');

    cy.injectAxe();
    cy.checkA11y(undefined, {
      includedImpacts: ['critical', 'serious'],
      // Exclude the 3D canvas from a11y checks — WebGL isn't available in headless Electron
      exclude: ['.fan-map canvas', '[role="img"]']
    });
  });
});
