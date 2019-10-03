import { gql } from "apollo-server"
import { createConnection, getConnection } from "typeorm"
import { callSchema, connectionOptionsforDB } from "./schema"
import { signToken, verifyToken } from "./userResolver/auth"
import { LoginTokens } from "./userResolver/LoginTokens"
import { User } from "./userResolver/User"

beforeAll(async () => {
	return await createConnection(connectionOptionsforDB("testing"))
})

afterAll(async () => {
	return await getConnection().close()
})

afterEach(async () => {
	return await getConnection().synchronize(true)
})

describe("resolver of user", () => {
	describe("createUser mutation should", () => {
		it("return email as it creates user with mutation", async () => {
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
	})

	describe("users query should", () => {
		it("return emails of registered users", async () => {
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
	})

	describe("loginTokens query should", () => {
		const loginTokensQuery = gql`
			query {
				loginTokens(email: "email@email.com", password: "good-password") {
					accessToken
				}
			}
		`

		it("return error for non-existent user", async () => {
			const response = await callSchema(loginTokensQuery)

			expect(response.errors).not.toBeUndefined()
			expect(response.data).toBeNull()
		})

		it("return error for bad password", async () => {
			await User.create({
				email: "email@email.com",
				password: "BAD-password",
			}).save()

			const response = await callSchema(loginTokensQuery)

			expect(response.errors).not.toBeUndefined()
			expect(response.data).toBeNull()
		})

		it("return a valid access token with good credentials", async () => {
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
			expect(verifyToken(accessToken)).toBeTruthy()
		})
	})

	describe("me query should", () => {
		const meQuery = gql`
			query {
				me {
					email
				}
			}
		`

		it("return an error without a valid jwt token", async () => {
			const context = {
				req: {
					headers: {
						authorization: "Bearer INVALID-TOKEN",
					},
				},
			}
			const response = await callSchema(meQuery, context)

			expect(response.errors).not.toBeUndefined()
			expect(response.data).toBeNull()
		})

		it("return an user with a valid jwt token", async () => {
			const user = await User.create({
				email: "email@email.com",
			}).save()

			const context = {
				req: {
					headers: {
						authorization: "Bearer " + signToken({ userId: user.id }),
					},
				},
			}

			const response = await callSchema(meQuery, context)

			expect(response.errors).toBeUndefined()
			expect(response.data).toMatchObject({
				me: { email: user.email },
			})
		})
	})
})
