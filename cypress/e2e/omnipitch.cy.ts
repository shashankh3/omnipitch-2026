describe('OmniPitch 2026 E2E Tests', () => {
  it('successfully loads the login view', () => {
    cy.visit('/')
    cy.contains('OMNIPITCH')
    cy.get('[aria-label="Enter Fan Experience Portal"]').should('exist')
  })

  it('FAN Flow: navigates to Match Feed and opens AI concierge', () => {
    cy.visit('/')
    cy.get('[aria-label="Enter Fan Experience Portal"]', { timeout: 5000 }).click({ force: true })
    cy.url({ timeout: 15000 }).should('include', '/fan')
    cy.contains('OMNIPITCH')
    
    // Open AI concierge
    cy.contains('AI Concierge').click({ force: true })
    cy.get('input[placeholder*="Ask about"]').should('exist')
  })

  it('VOLUNTEER Flow: navigates to portal and logs an incident', () => {
    cy.visit('/')
    cy.get('[aria-label="Enter Volunteer Portal"]', { timeout: 5000 }).click({ force: true })
    cy.url({ timeout: 15000 }).should('include', '/volunteer')
    cy.contains('OMNIPITCH')
    
    // Find location context input and type
    cy.get('input#location-context').type('Gate B Entrance')
    cy.contains('Dispatch Team').should('not.be.disabled')
  })

  it('Offline Fallback: handles 500 error from AI endpoint', () => {
    // Intercept health check to ensure we start in 'live' mode, allowing AI call to trigger
    cy.intercept('GET', '/api/health', {
      statusCode: 200,
      body: { status: 'ok', llm: 'live', supabase: 'configured' }
    }).as('healthCheck')

    // Intercept AI endpoint
    cy.intercept('POST', '/api/deepseek', {
      statusCode: 500,
      body: { error: 'Network error' }
    }).as('deepseekCall')

    cy.visit('/')
    cy.get('[aria-label="Enter Fan Experience Portal"]', { timeout: 5000 }).click({ force: true })
    cy.contains('AI Concierge', { timeout: 15000 }).click({ force: true })
    
    // Type in chat to trigger AI call
    cy.get('input[placeholder*="Ask about"]').type('Hello', { force: true })
    cy.get('button[aria-label="Send Message"]').click({ force: true })
    
    cy.wait('@deepseekCall')
    // Wait for the offline warning or tag to appear in the UI
    cy.contains(/offline|unavailable/i).should('exist')
  })
})
