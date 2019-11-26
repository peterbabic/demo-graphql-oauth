import { gql } from "apollo-server-express"
import { GraphQLClient, rawRequest } from "graphql-request"
import fetch from "node-fetch"
import { createConnection } from "typeorm"
import { createServer } from "./server"
import { gqlToStr } from "./server/schema"
import { testingConnectionOptions } from "./server/testing"
import { verifiedRefreshTokenPayload } from "./server/userResolver/auth"
import { User } from "./server/userResolver/User"
import cookie = require("cookie")

describe("server should", () => {
    it("perform the refresh tokens operation flawlessly", async () => {
        const halfADay = (60 * 60 * 24) / 2
        const fifteenDays = 60 * 60 * 24 * 15

        const createUserResponse = await rawRequest(gqlUri, gqlToStr(createUserMutation))
        const userId = createUserResponse.data.createUser.id

        const accessTokenReponse = await rawRequest(gqlUri, gqlToStr(accessTokenQuery))
        const accessToken: string = accessTokenReponse.data.accessToken
        const headers: Headers = accessTokenReponse.headers
        const cookieHeader = headers.get("set-cookie") as string
        const varyHeader = headers.get("vary") as string
        const acacHeader = headers.get("access-control-allow-credentials") as string
        const acaoHeader = headers.get("access-control-allow-origin") as string
        const parsedCookie = cookie.parse(cookieHeader)
        const refreshCookieExpires = dateInKiloSeconds(parsedCookie.Expires)
        const refreshTokenPayload = verifiedRefreshTokenPayload(parsedCookie.rt)
        const jwtLifetime = refreshTokenPayload.exp! - refreshTokenPayload.iat!
        const refLifetime = dateInKiloSeconds(new Date().getTime() + jwtLifetime * 1000)

        const client = new GraphQLClient(gqlUri, {
            headers: {
                Authorization: "Bearer " + accessToken,
            },
        })
        const meResponse = await client.rawRequest(gqlToStr(meQuery))

        const refreshTokenResponse = await fetch(refreshTokenUri, {
            method: "POST",
            headers: { cookie: cookieHeader },
        })
        const jsonResponse = await refreshTokenResponse.json()

        expect(varyHeader).toBe("Origin")
        expect(acacHeader).toBe("true")
        expect(acaoHeader).toMatch(/http:/)
        expect(cookieHeader).toMatch(/HttpOnly/)
        expect(parsedCookie.Path).toBe("/refresh_token")
        expect(refreshTokenPayload.userId).toBe(userId)
        expect(refreshCookieExpires).toBeCloseTo(refLifetime)
        expect(jwtLifetime).toBeGreaterThanOrEqual(halfADay)
        expect(jwtLifetime).not.toBeGreaterThan(fifteenDays)
        expect(meResponse.data.me.email).toBe("auth@server.com")
        expect(jsonResponse.data).toBeDefined()
        expect(jsonResponse.errors).toBeUndefined()
    })

    it("it doesnt perform refresh tokens without valid cookie", async () => {
        const response = await fetch(refreshTokenUri, {
            method: "POST",
            headers: { cookie: "INVALID-COOKIE" },
        })
        const jsonResponse = await response.json()

        expect(jsonResponse.data).toBeNull()
        expect(jsonResponse.errors).not.toBeUndefined()
    })
})

beforeAll(async () => {
    await createConnection(testingConnectionOptions())
    await createServer(port)
})

afterAll(async () => {
    User.delete({ email: "auth@server.com" })
})

const port = 4001
const gqlUri = `http://localhost:${port}/graphql`
const refreshTokenUri = `http://localhost:${port}/refresh_token`

const createUserMutation = gql`
    mutation {
        createUser(email: "auth@server.com", password: "password") {
            email
            id
        }
    }
`

const accessTokenQuery = gql`
    query {
        accessToken(email: "auth@server.com", password: "password")
    }
`

const meQuery = gql`
    query {
        me {
            email
        }
    }
`

const dateInKiloSeconds = (date: string | number) => new Date(date).getTime() / 1000000
