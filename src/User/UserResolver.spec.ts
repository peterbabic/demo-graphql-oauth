import { callSchema } from "../callSchema";

const usersQuery = `
query {
    users {
        id
    }
}`

describe("user resolver", () => {
    it("should return an empty array when no users are in sample", async () => {
        const response = await callSchema({
            source: usersQuery,
        })

        expect(response).toMatchObject({
            data: {
                users: [],
            },
        })
    })
})
