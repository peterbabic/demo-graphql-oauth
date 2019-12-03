/// <reference types="Cypress" />

const email = "mylogin"
const password = "mypassword"

const homeUrl = Cypress.config().baseUrl + "/"

describe("user login process should", () => {
    it("be able to sign up, in, see profile and out", () => {
        cy.clock()

        // guest phase
        cy.log("guest should be redirected")

        cy.visit("/sign-out")
        cy.url().should("eq", homeUrl)
        cy.visit("/my-profile")
        cy.url().should("include", "sign-in")

        // signing up phase
        cy.log("reach sign-up page through sign-in form or nav")

        cy.get("form [href=sign-up]").click()
        cy.url().should("include", "/sign-up")
        cy.get("nav [href=sign-up]")
            .as("sign-up")
            .click()
        cy.url().should("include", "/sign-up")

        cy.log("fill the sign-up form and be redirected to sign in")

        cy.get("[cy=email]")
            .click()
            .type(email)
        cy.get("[cy=password]")
            .click()
            .type(password)
        cy.get("[cy=submit]").click()
        cy.url().should("include", "sign-in")

        // signing in phase
        cy.log("reach sign-in form through nav")

        cy.get("nav [href=sign-in]")
            .as("sign-in")
            .click()
        cy.url().should("include", "/sign-in")

        cy.log("fill the sign-in form and be redirected to my profile")

        cy.get("[cy=email]")
            .click()
            .type(email)
        cy.get("[cy=password]")
            .click()
            .type(password)
        cy.get("[cy=submit]").click()
        cy.url().should("include", "my-profile")

        // signed in phase
        cy.log("signed in user should be redirected")

        cy.visit("/sign-in")
        cy.url().should("include", "my-profile")
        cy.visit("/sign-up")
        cy.url().should("include", "my-profile")

        cy.log("stay signed in even after 30 miutes and a reload")

        cy.tick(30 * 60 * 1000)
        cy.get("main[cy]").should(element =>
            expect(element.attr("cy")).to.be.gt(0)
        )

        cy.reload()
        cy.get("nav [href=sign-up]").should("not.exist")
        cy.get("nav [href=sign-in]").should("not.exist")
        cy.get("nav [href=my-profile]")
            .as("my-profile")
            .click()
        cy.get("[cy=session]").contains(email)

        // my profile phase
        cy.log("reach my profile via nav and see details")

        cy.get("@my-profile").click()
        cy.url().should("include", "my-profile")

        cy.get("[cy=session]")
            .as("session")
            .contains(email)

        // signing out phase
        cy.log("sign out the user out and be redirected home")

        cy.get("nav [href=sign-out]")
            .as("sign-out")
            .click()
        cy.url().should("eq", homeUrl)
        cy.get("nav")
            .contains("home")
            .as("home")
            .click()
        cy.url().should("eq", homeUrl)

        // guest phase
        cy.log("finish the loop by going to sign in page")

        cy.get("@sign-in").click()
        cy.url().should("include", "/sign-in")
    })
})
