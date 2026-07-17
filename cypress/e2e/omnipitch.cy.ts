describe('OmniPitch 2026 E2E Tests', () => {
  it('successfully loads the login view', () => {
    cy.visit('/')
    cy.contains('OMNIPITCH')
    cy.get('[aria-label="Enter Fan Experience Portal"]').should('exist')
  })

  it('navigates to Fan Dashboard', () => {
    cy.visit('/')
    cy.get('[aria-label="Enter Fan Experience Portal"]').click()
    cy.url().should('include', '/fan')
    cy.contains('OMNIPITCH')
  })

  it('navigates to Volunteer Portal', () => {
    cy.visit('/')
    cy.get('[aria-label="Enter Volunteer Portal"]').click()
    cy.url().should('include', '/volunteer')
    cy.contains('OMNIPITCH')
  })

  it('navigates to Command Center', () => {
    cy.visit('/')
    cy.get('[aria-label="Enter Organizer Command Center"]').click()
    cy.url().should('include', '/organizer')
    cy.contains('OMNIPITCH')
  })
})
