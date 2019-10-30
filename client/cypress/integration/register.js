/// <reference types="Cypress" />

describe("registration should", () => {
    it.only("handle its form", () => {
        cy.visit("/register")

        cy.get("form")
            .contains("Login")
            .next("input")
            .type("mylogin")

        cy.get("form")
            .contains("Password")
            .next("input")
            .type("mypassword")

        cy.get("form")
            .contains("Submit")
            .click()

        cy.url().should("not.contain", "?")
        cy.get("#output").should("contain", "mylogin")
    })
})
