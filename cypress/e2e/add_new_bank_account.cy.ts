import { slowCypressDown } from 'cypress-slow-down'
slowCypressDown()

describe('Add New Bank Account', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should handle user login', () => {
    cy.url().should('include', '/dashboard')
  })

  it('should handle add interbank account', () => {
    cy.visit('http://localhost:5173/dashboard')
    // Navigate to Profile page
    cy.get('[data-cy=profile-link]').click()
    cy.url().should('include', '/profile')

    // Navigate to Payment Data page
    cy.get('[data-cy=payment-data-link]').click()
    cy.url().should('include', '/profile/payment-data')

    cy.get('[data-cy=add-account-button]').click()

    cy.get('[data-cy=bank-dropdown-button]').click()
    cy.get('[data-cy=bank-dropdown-list]').contains('BANK MANDIRI TASPEN').click()
    cy.get('[data-cy=bank-branches-input]').type('JAKARTA')

    cy.get('[data-cy=bank-account-number-input]').type('510654304')

    cy.get('[data-cy=bank-account-name-input]').type('Rival Test')

    // Submit the form
    cy.get('[data-cy=submit-bank-btn]').click()
    cy.wait(500)
    cy.contains('Data Pembayaran berhasil ditambahkan').should('be.visible')

    // visit data pembayaran page
    cy.visit('http://localhost:5173/profile/payment-data')
  })

  it('should handle add intrabank account', () => {
    const intrabankAccountNo = '10110827344'

    cy.visit('http://localhost:5173/dashboard')
    // Navigate to Profile page
    cy.get('[data-cy=profile-link]').click()
    cy.url().should('include', '/profile')

    // Navigate to Payment Data page
    cy.get('[data-cy=payment-data-link]').click()
    cy.url().should('include', '/profile/payment-data')

    cy.get('[data-cy=add-account-button]').click()

    cy.get('[data-cy=bank-dropdown-button]').click()
    cy.get('[data-cy=bank-dropdown-list]').contains('BANK NATIONAL NOBU').click()
    cy.get('[data-cy=bank-branches-input]').type('JAKARTA')

    cy.get('[data-cy=bank-account-number-input]').type(intrabankAccountNo)

    cy.get('[data-cy=bank-account-name-input]').type('Rival Intrabank Test')

    // Submit the form
    cy.get('[data-cy=submit-bank-btn]').click()
    cy.wait(500)
    cy.contains('Data Pembayaran berhasil ditambahkan').should('be.visible')

    // visit data pembayaran page
    cy.visit('http://localhost:5173/profile/payment-data')
  })
})