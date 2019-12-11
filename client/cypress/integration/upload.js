/// <reference types="Cypress" />

describe("upload route should", () => {
    it.only("handle one file upload", () => {
        cy.visit("/")
        cy.contains("Drop files")

        cy.fixture("logos/mcdonald.png", "base64").then(fileContent => {
            cy.get('[cy="dropzone"]').upload(
                {
                    fileContent,
                    fileName: "mcdonald.png",
                    mimeType: "image/png",
                },
                { subjectType: "drag-n-drop" }
            )
        })
    })
})
