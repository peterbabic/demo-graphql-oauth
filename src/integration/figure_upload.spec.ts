import fetch from "node-fetch"
import { gqlUri, uploadDir } from "../server/testing"
import FormData = require("form-data")
import fs = require("fs-extra")

describe("figure upload integration should", () => {
    it("upload a file", async () => {
        const filename = "ok.png"
        const path = uploadDir + filename

        const body = bodyFrom(filename)
        const reponse = await fetchWith(body)
        const uploadedFile = await fs.access(path, fs.constants.F_OK)

        expect(uploadedFile).toBeUndefined()
        expect(reponse.errors).toBeUndefined()
        expect(reponse.data).toMatchObject({ uploadFigure: true })
    })

    it("revoke a non-picture file", async () => {
        const filename = "file.txt"
        const path = uploadDir + filename

        const body = bodyFrom(filename)
        const response = await fetchWith(body)

        await expect(fs.access(path, fs.constants.F_OK)).rejects.toThrow()
        expect(response.errors).toBeDefined()
        expect(response.data).toBeNull()
    })
})

const fetchWith = async (body: FormData): Promise<FetchResponse> => {
    const reponse = await fetch(gqlUri, {
        method: "POST",
        body,
    })
    return reponse.json()
}

const bodyFrom = (filename: string) => {
    const body = new FormData()
    body.append(
        "operations",
        JSON.stringify({
            query: /* GraphQL */ `
                mutation($file: Upload!) {
                    uploadFigure(file: $file)
                }
            `,
            variables: {
                file: null,
            },
        })
    )
    body.append("map", JSON.stringify({ 0: ["variables.file"] }))
    body.append("0", "", { filename })

    return body
}

interface FetchResponse {
    data: any
    errors?: any
}
