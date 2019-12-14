import cookie = require("cookie")
import { gql } from "apollo-server-express"
import { GraphQLClient, rawRequest } from "graphql-request"
import fetch from "node-fetch"
import { createConnection } from "typeorm"
import { createServer } from "../server"
import { gqlToStr } from "../server/schema"
import {
    gqlUri,
    refreshTokenUri,
    testingConnectionOptions,
    testingPort,
} from "../server/testing"
import {
    rtCookieOptions,
    signRefreshToken,
    verifiedRefreshTokenPayload,
} from "../server/UserResolver/auth"
import { User } from "../server/UserResolver/User"

let user: User

describe("server should", () => {
    it("reject refresh token without valid cookie", async () => {
        const response = await fetch(refreshTokenUri, {
            method: "POST",
            headers: { cookie: "INVALID-COOKIE" },
        })
        const jsonResponse = await response.json()

        expect(jsonResponse.data).toBeNull()
        expect(jsonResponse.errors).not.toBeUndefined()
    })

    it("reject refresh token with tokenVersion mismatch", async () => {
        const oldRefreshToken = signRefreshToken({ uid: user.id, ver: 0 })
        const cookieHeader = cookie.serialize("rt", oldRefreshToken, rtCookieOptions())

        await user.invalidateTokens()
        const response = await fetch(refreshTokenUri, {
            method: "POST",
            headers: { cookie: cookieHeader },
        })
        const jsonResponse = await response.json()

        expect(jsonResponse.data).toBeNull()
        expect(jsonResponse.errors).not.toBeUndefined()
    })

    it("provide access token given good crendentials and grant refresh token with it", async () => {
        const halfADay = (60 * 60 * 24) / 2
        const fifteenDays = 60 * 60 * 24 * 15

        const accessTokenReponse = await rawRequest(gqlUri, gqlToStr(accessTokenMutation))
        const accessToken: string = accessTokenReponse.data.accessToken
        const headers: Headers = accessTokenReponse.headers
        const varyHeader = headers.get("vary") as string
        const acacHeader = headers.get("access-control-allow-credentials") as string
        const acaoHeader = headers.get("access-control-allow-origin") as string

        const cookieHeader = headers.get("set-cookie") as string
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
        const meResponse = await client.rawRequest(gqlToStr(meMutation))

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
        expect(refreshTokenPayload.uid).toBe(user.id)
        expect(refreshTokenPayload.ver).toBe(user.tokenVersion)
        expect(refreshTokenPayload.msc).toBeLessThan(1000)
        expect(refreshCookieExpires).toBeCloseTo(refLifetime)
        expect(jwtLifetime).toBeGreaterThanOrEqual(halfADay)
        expect(jwtLifetime).not.toBeGreaterThan(fifteenDays)

        expect(meResponse.data.me.email).toBe("auth@server.com")

        expect(jsonResponse.data).toBeDefined()
        expect(jsonResponse.errors).toBeUndefined()
    })

    it("provide an empty rt cookie on signOut mutation", async () => {
        const signOutReponse = await rawRequest(gqlUri, gqlToStr(signOutMutation))
        const headers: Headers = signOutReponse.headers
        const cookieHeader = headers.get("set-cookie") as string
        const parsedCookie = cookie.parse(cookieHeader)

        expect(cookieHeader).toMatch(/HttpOnly/)
        expect(parsedCookie.Path).toBe("/refresh_token")
        expect(parsedCookie.rt).toBe("")
    })
})

beforeAll(async () => {
    await createConnection(testingConnectionOptions())
    await createServer(testingPort)

    await User.delete({ email: "auth@server.com" })
    user = await User.create({ email: "auth@server.com", password: "password" }).save()
})

afterAll(async () => {
    await User.delete({ email: "auth@server.com" })
})

const accessTokenMutation = gql`
    mutation {
        accessToken(email: "auth@server.com", password: "password")
    }
`

const meMutation = gql`
    mutation {
        me {
            email
        }
    }
`

const signOutMutation = gql`
    mutation {
        signOut
    }
`

const dateInKiloSeconds = (date: string | number) => new Date(date).getTime() / 1000000
