import { gql } from "apollo-server"
import { Request, Response } from "express"
import { createConnection, getConnection } from "typeorm"
import { callSchema } from "./schema"
import {
	initializeRollbackTransactions,
	runInRollbackTransaction,
	testingConnectionOptions,
} from "./testing"
import { signAccessToken, verifyAccessToken } from "./userResolver/auth"
import { ContextInterface } from "./userResolver/ContextInterface"
import { LoginTokens } from "./userResolver/LoginTokens"
import { User } from "./userResolver/User"

beforeAll(async () => {
	initializeRollbackTransactions()
	await createConnection(testingConnectionOptions())
})

afterAll(async () => {
	await getConnection().close()
})

describe("resolver of user", () => {
	describe("createUser mutation should", () => {
		it(
			"return email as it creates user with mutation",
			runInRollbackTransaction(async () => {
				const createUserMutation = gql`
					mutation {
						createUser(email: "email@email.com", password: "password") {
							email
						}
					}
				`

				const response = await callSchema(createUserMutation)

				expect(response.errors).toBeUndefined()
				expect(response.data).toMatchObject({
					createUser: { email: "email@email.com" },
				})
			})
		)
	})

	describe("users query should", () => {
		it(
			"return emails of registered users",
			runInRollbackTransaction(async () => {
				const usersQuery = gql`
					query {
						users {
							email
						}
					}
				`

				const user = await User.create({
					email: "email@email.com",
				}).save()

				const response = await callSchema(usersQuery)

				expect(response.errors).toBeUndefined()
				expect(response.data).toMatchObject({
					users: [{ email: user.email }],
				})
			})
		)
	})

	describe("loginTokens query should", () => {
		const loginTokensQuery = gql`
			query {
				loginTokens(email: "email@email.com", password: "good-password") {
					accessToken
				}
			}
		`

		it(
			"return error for non-existent user",
			runInRollbackTransaction(async () => {
				const response = await callSchema(loginTokensQuery)

				expect(response.errors).not.toBeUndefined()
				expect(response.data).toBeNull()
			})
		)

		it(
			"return error for bad password",
			runInRollbackTransaction(async () => {
				await User.create({
					email: "email@email.com",
					password: "BAD-password",
				}).save()

				const response = await callSchema(loginTokensQuery)

				expect(response.errors).not.toBeUndefined()
				expect(response.data).toBeNull()
			})
		)

		it(
			"return a valid access token with good credentials",
			runInRollbackTransaction(async () => {
				await User.create({
					email: "email@email.com",
					password: "good-password",
				}).save()

				const response = await callSchema(loginTokensQuery)
				const accessToken = response.data!.loginTokens.accessToken
				const accessTokenPayload = verifyAccessToken(accessToken)
				const loginTokens = new LoginTokens()
				loginTokens.accessToken = accessToken

				const fifteenMinutes = 900
				const accessTokenLifetime =
					accessTokenPayload.exp! - accessTokenPayload.iat!
				expect(accessTokenLifetime).toBe(fifteenMinutes)
				expect(accessTokenPayload).toBeTruthy()
				expect(response.errors).toBeUndefined()
				expect(response.data).toMatchObject({ loginTokens })
			})
		)
	})

	describe("me query should", () => {
		const meQuery = gql`
			query {
				me {
					email
				}
			}
		`

		it(
			"return an error without a valid jwt token",
			runInRollbackTransaction(async () => {
				const contextWithInvalidToken = contextWithAuthHeader(
					"Bearer INVALID-TOKEN"
				)
				const response = await callSchema(meQuery, contextWithInvalidToken)

				expect(response.errors).not.toBeUndefined()
				expect(response.data).toBeNull()
			})
		)

		it(
			"return an user with a valid jwt token",
			runInRollbackTransaction(async () => {
				const user = await User.create({
					email: "email@email.com",
				}).save()

				const contextWithValidToken = contextWithAuthHeader(
					"Bearer " + signAccessToken({ userId: user.id })
				)
				const response = await callSchema(meQuery, contextWithValidToken)

				expect(response.errors).toBeUndefined()
				expect(response.data).toMatchObject({
					me: { email: user.email },
				})
			})
		)
	})
})

const contextWithAuthHeader = (header: string): ContextInterface => ({
	req: {
		headers: {
			authorization: header,
		},
	} as Request,
	res: {} as Response,
})
