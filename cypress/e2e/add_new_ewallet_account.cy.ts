import { slowCypressDown } from 'cypress-slow-down'
slowCypressDown()

describe('Add New Bank Account', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should handle add e-wallet account', () => {
    const eWalletno = '083827468111'

    cy.visit('http://localhost:5173/dashboard')
    // Navigate to Profile page
    cy.get('[data-cy=profile-link]').click()
    cy.url().should('include', '/profile')

    // Navigate to Payment Data page
    cy.get('[data-cy=payment-data-link]').click()
    cy.url().should('include', '/profile/payment-data')

    cy.get('[data-cy=add-account-button]').click()

    cy.get('[data-cy=e-wallet-btn]').click()

    cy.get('[data-cy=no-ewallet-input]').type(eWalletno)

    cy.get('[data-cy=nama-pemilik-ewallet-input]').type('Rival E-Wallet Test')

    // Submit the form
    cy.get('[data-cy=submit-ewallet-btn]').click()
    cy.wait(500)
    cy.contains('Data Pembayaran berhasil ditambahkan').should('be.visible')

    // visit data pembayaran page
    cy.visit('http://localhost:5173/profile/payment-data')
  })
})