import { slowCypressDown } from 'cypress-slow-down'
slowCypressDown(300)

describe('Bank Withdrawal', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should handle user login', () => {
    cy.url().should('include', '/dashboard')
  })

  it('bank interbank should success', () => {
    const saldoAwal = '100.000'
    const saldoPenarikan = '12000' // + 3000 admin fee
    const saldoAkhir = '85.000'

    cy.get('[data-cy=toggle-balance-btn]').click()
    cy.get('[data-cy=balance-amount]').should('be.visible')
    cy.get('[data-cy=balance-amount]').should('contain', saldoAwal)

    cy.get('[data-cy=penarikan-btn]').click()
    cy.url().should('include', '/settlement')

    cy.get('[data-cy=bank-account-dropdown]').click()
    cy.get('[data-cy=bank-accounts-list]').should('be.visible')
    cy.get('[data-cy=bank-accounts-list]').contains('BANK MANDIRI TASPEN').click()
    cy.wait(1000)
    cy.get('[data-cy=amount-withdraw-input]').type(saldoPenarikan)
    cy.get('[data-cy=confirm-dishburment-btn]').click()

    cy.get('[data-cy=confirm-tarik-saldo-btn]').click()

    cy.contains('Masukkan PIN Anda').should('be.visible')

    // Input PIN dengan logging
    const pinCode = '123456'
    pinCode.split('').forEach((digit, index) => {
      cy.log(`Inputting digit ${digit} at position ${index}`)
      cy.get('.grid button').contains(digit).click()
      cy.wait(100)
    })

    // Klik konfirmasi
    cy.get('[data-cy=confirm-withdraw-btn]').click()

    cy.contains('Berhasil melakukan penarikan', { timeout: 10000 }).should('be.visible')

    cy.visit('http://localhost:5173/dashboard')

    cy.get('[data-cy=toggle-balance-btn]').click()
    cy.get('[data-cy=balance-amount]').should('be.visible')
    cy.get('[data-cy=balance-amount]').should('contain', saldoAkhir)
  })

  it('bank intrabank should success', () => {
    const saldoAwal = '85.000'
    const saldoPenarikan = '12000' // + 3000 admin fee
    const saldoAkhir = '70.000'

    cy.get('[data-cy=toggle-balance-btn]').click()
    cy.get('[data-cy=balance-amount]').should('be.visible')
    cy.get('[data-cy=balance-amount]').should('contain', saldoAwal)

    cy.get('[data-cy=penarikan-btn]').click()
    cy.url().should('include', '/settlement')

    cy.get('[data-cy=bank-account-dropdown]').click()
    cy.get('[data-cy=bank-accounts-list]').should('be.visible')
    cy.get('[data-cy=bank-accounts-list]').contains('BANK NATIONAL NOBU').click()
    cy.wait(1000)
    cy.get('[data-cy=amount-withdraw-input]').type(saldoPenarikan)
    cy.get('[data-cy=confirm-dishburment-btn]').click()

    cy.get('[data-cy=confirm-tarik-saldo-btn]').click()

    cy.contains('Masukkan PIN Anda').should('be.visible')

    // Input PIN dengan logging
    const pinCode = '123456'
    pinCode.split('').forEach((digit, index) => {
      cy.log(`Inputting digit ${digit} at position ${index}`)
      cy.get('.grid button').contains(digit).click()
      cy.wait(100)
    })

    // Klik konfirmasi
    cy.get('[data-cy=confirm-withdraw-btn]').click()

    cy.contains('Berhasil melakukan penarikan', { timeout: 10000 }).should('be.visible')

    cy.visit('http://localhost:5173/dashboard')

    cy.get('[data-cy=toggle-balance-btn]').click()
    cy.get('[data-cy=balance-amount]').should('be.visible')
    cy.get('[data-cy=balance-amount]').should('contain', saldoAkhir)
  })
})