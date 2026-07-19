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
    cy.get('[aria-label="Enter Fan Experience Portal"]', { timeout: 5000 })
      .should('exist')
      .click({ force: true });

    cy.url({ timeout: 15000 }).should('include', '/fan');

    cy.injectAxe();
    cy.checkA11y(undefined, {
      includedImpacts: ['critical', 'serious'],
      rules: {
        'scrollable-region-focusable': { enabled: false }
      }
    }, (violations) => {
      cy.task('log', JSON.stringify(violations, null, 2));
    });
  });
});
