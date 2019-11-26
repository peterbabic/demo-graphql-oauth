import { gql } from "apollo-server-express"
import { Request, Response } from "express"
import { createConnection, getConnection } from "typeorm"
import { callSchema } from "./schema"
import {
	initializeRollbackTransactions,
	runInRollbackTransaction,
	testingConnectionOptions,
} from "./testing"
import { Context, signAccessToken, verifiedAccessTokenPayload } from "./userResolver/auth"
import { User } from "./userResolver/User"

describe("resolver of user", () => {
	describe("createUser mutation should", () => {
		it(
			"return email as it creates user with mutation",
			runInRollbackTransaction(async () => {
				const response = await callSchema(createUserMutation)

				expect(response.errors).toBeUndefined()
				expect(response.data).toMatchObject({
					createUser: { email: "user-mutation@user-resolver.com" },
				})
			})
		)
	})

	describe("accessToken query should", () => {
		it(
			"return error for bad password or not-existent user",
			runInRollbackTransaction(async () => {
				await User.create({
					email: "access-token@user-resolver.com",
					password: "BAD-password",
				}).save()

				const response = await callSchema(accessTokenQuery, contextWithCookie())

				expect(response.errors).not.toBeUndefined()
				expect(response.data).toBeNull()
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

				const response = await callSchema(accessTokenQuery, contextWithCookie())
				const accessToken: string = response.data!.accessToken
				const jwtPayload = verifiedAccessTokenPayload(accessToken)
				const jwtLifetime = jwtPayload.exp! - jwtPayload.iat!

				expect(jwtLifetime).toBeGreaterThanOrEqual(oneMinute)
				expect(jwtLifetime).not.toBeGreaterThan(sixteenMinutes)
				expect(jwtPayload.userId).toBe(user.id)
				expect(jwtPayload.ms).toBeLessThan(1000)
				expect(response.errors).toBeUndefined()
			})
		)
	})

	describe("me query should", () => {
		it(
			"return an error without a valid access token",
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
			"return an user with a valid access token",
			runInRollbackTransaction(async () => {
				const user = await User.create({
					email: "me-query@user-resolver.com",
				}).save()

				const contextWithValidToken = contextWithAuthHeader(
					"Bearer " + signAccessToken({ userId: user.id })
				)
				const response = await callSchema(meQuery, contextWithValidToken)

				expect(response.errors).toBeUndefined()
				expect(response.data).toMatchObject({
					me: { email: "me-query@user-resolver.com" },
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
const accessTokenQuery = gql`
	query {
		accessToken(email: "access-token@user-resolver.com", password: "password")
	}
`
const meQuery = gql`
	query {
		me {
			email
		}
	}
`

const contextWithAuthHeader = (header: string): Context => ({
	req: {
		headers: {
			authorization: header,
		},
	} as Request,
	res: {} as Response,
})

const contextWithCookie = (): Context => ({
	req: {} as Request,
	res: ({ cookie: () => undefined } as unknown) as Response,
})
