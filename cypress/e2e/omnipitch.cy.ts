describe('OmniPitch 2026 E2E Tests', () => {
  it('successfully loads the login view', () => {
    cy.visit('/')
    cy.contains('OmniPitch 2026')
    cy.contains('Select Persona')
  })

  it('navigates to Fan Dashboard', () => {
    cy.visit('/')
    cy.contains('Fan Dashboard').click()
    cy.url().should('include', '/fan')
    cy.contains('OmniPitch Fan Experience')
  })

  it('navigates to Volunteer Portal', () => {
    cy.visit('/')
    cy.contains('Volunteer Portal').click()
    cy.url().should('include', '/volunteer')
    cy.contains('Volunteer Dashboard')
  })

  it('navigates to Command Center', () => {
    cy.visit('/')
    cy.contains('Command Center').click()
    cy.url().should('include', '/organizer')
    cy.contains('Operations Overview')
  })
})
