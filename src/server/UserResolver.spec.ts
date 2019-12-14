import { gql } from "apollo-server-express"
import { createConnection, getConnection } from "typeorm"
import { callSchema } from "./schema"
import {
    contextWithAuthHeader,
    contextWithCookie,
    initializeRollbackTransactions,
    runInRollbackTransaction,
    testingConnectionOptions,
} from "./testing"
import { signAccessToken, verifiedAccessTokenPayload } from "./UserResolver/auth"
import { User } from "./UserResolver/User"

describe("resolver of user", () => {
    describe("createUser mutation should", () => {
        it(
            "return email and default token version as it creates user with mutation",
            runInRollbackTransaction(async () => {
                const response = await callSchema(createUserMutation)

                expect(response.errors).toBeUndefined()
                expect(response.data).toMatchObject({
                    createUser: {
                        email: "user-mutation@user-resolver.com",
                    },
                })
            })
        )
    })

    describe("accessToken mutation should", () => {
        it(
            "return error for bad password or not-existent user",
            runInRollbackTransaction(async () => {
                const nonExistenUserResponse = await callSchema(
                    accessTokenMutation,
                    contextWithCookie()
                )
                await User.create({
                    email: "access-token@user-resolver.com",
                    password: "BAD-password",
                }).save()

                const badPasswordResponse = await callSchema(
                    accessTokenMutation,
                    contextWithCookie()
                )

                expect(nonExistenUserResponse.errors).not.toBeUndefined()
                expect(nonExistenUserResponse.data).toBeNull()
                expect(badPasswordResponse.errors).not.toBeUndefined()
                expect(badPasswordResponse.data).toBeNull()
            })
        )

        it(
            "return a valid access token with expiry providing good credentials",
            runInRollbackTransaction(async () => {
                const oneMinute = 60
                const sixteenMinutes = 60 * 16

                const user = await User.create({
                    email: "access-token@user-resolver.com",
                    password: "password",
                }).save()

                const response = await callSchema(
                    accessTokenMutation,
                    contextWithCookie()
                )
                const accessToken: string = response.data!.accessToken
                const jwtPayload = verifiedAccessTokenPayload(accessToken)
                const jwtLifetime = jwtPayload.exp! - jwtPayload.iat!

                expect(jwtLifetime).toBeGreaterThanOrEqual(oneMinute)
                expect(jwtLifetime).not.toBeGreaterThan(sixteenMinutes)
                expect(jwtPayload.uid).toBe(user.id)
                expect(jwtPayload.msc).toBeLessThan(1000)
                expect(response.errors).toBeUndefined()
            })
        )
    })

    describe("sign out mutation should", () => {
        it(
            "return true",
            runInRollbackTransaction(async () => {
                const response = await callSchema(signOutMutation, contextWithCookie())

                expect(response.errors).toBeUndefined()
                expect(response.data!.signOut).toBeTruthy()
            })
        )
    })

    describe("me mutation should", () => {
        it(
            "return an error without a valid access token",
            runInRollbackTransaction(async () => {
                const contextWithInvalidToken = contextWithAuthHeader(
                    "Bearer INVALID-TOKEN"
                )
                const response = await callSchema(meMutation, contextWithInvalidToken)

                expect(response.errors).not.toBeUndefined()
                expect(response.data).toBeNull()
            })
        )

        it(
            "return an user with a valid access token",
            runInRollbackTransaction(async () => {
                const user = await User.create({
                    email: "me-mutation@user-resolver.com",
                }).save()

                const contextWithValidToken = contextWithAuthHeader(
                    "Bearer " + signAccessToken({ uid: user.id, ver: user.tokenVersion })
                )
                const response = await callSchema(meMutation, contextWithValidToken)

                expect(response.errors).toBeUndefined()
                expect(response.data).toMatchObject({
                    me: { email: "me-mutation@user-resolver.com" },
                })
            })
        )
    })
})

beforeAll(async () => {
    initializeRollbackTransactions()
    await createConnection(testingConnectionOptions())
})

afterAll(async () => {
    await getConnection().close()
})

const createUserMutation = gql`
    mutation {
        createUser(email: "user-mutation@user-resolver.com", password: "password") {
            email
        }
    }
`
const accessTokenMutation = gql`
    mutation {
        accessToken(email: "access-token@user-resolver.com", password: "password")
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
