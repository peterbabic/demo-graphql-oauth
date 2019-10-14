import { gql } from "apollo-server"
import { Request, Response } from "express"
import { createConnection, getConnection } from "typeorm"
import {
	initializeTransactionalContext,
	patchTypeORMRepositoryWithBaseRepository,
} from "typeorm-transactional-cls-hooked"
import { callSchema } from "./schema"
import { runInTransaction, testingConnectionOptions } from "./testing"
import { ContextInterface, signAccessToken, verifyAccessToken } from "./userResolver/auth"
import { LoginTokens } from "./userResolver/LoginTokens"
import { User } from "./userResolver/User"

beforeAll(async () => {
	initializeTransactionalContext()
	patchTypeORMRepositoryWithBaseRepository()

	await createConnection(testingConnectionOptions())
})

afterAll(async () => {
	await getConnection().close()
})

describe("resolver of user", () => {
	describe("createUser mutation should", () => {
		it(
			"return email as it creates user with mutation",
			runInTransaction(async () => {
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
			runInTransaction(async () => {
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
			runInTransaction(async () => {
				const response = await callSchema(loginTokensQuery)

				expect(response.errors).not.toBeUndefined()
				expect(response.data).toBeNull()
			})
		)

		it(
			"return error for bad password",
			runInTransaction(async () => {
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
			runInTransaction(async () => {
				await User.create({
					email: "email@email.com",
					password: "good-password",
				}).save()

				const response = await callSchema(loginTokensQuery)
				const accessToken = response.data!.loginTokens.accessToken
				const loginTokens = new LoginTokens()
				loginTokens.accessToken = accessToken

				expect(response.errors).toBeUndefined()
				expect(response.data).toMatchObject({ loginTokens })
				expect(verifyAccessToken(accessToken)).toBeTruthy()
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
			runInTransaction(async () => {
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
			runInTransaction(async () => {
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
