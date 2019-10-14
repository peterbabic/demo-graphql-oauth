import ApolloClient, { gql } from "apollo-boost"
import fetch from "node-fetch"
import { createConnection } from "typeorm"
import { createServer } from "./server"
import {
	initializeRollbackTransactions,
	runInRollbackTransaction,
	testingConnectionOptions,
} from "./server/testing"

const port = 4001

beforeAll(async () => {
	initializeRollbackTransactions()
	await createConnection(testingConnectionOptions())
	await createServer(port)
})

describe("server should", () => {
	it(
		"handle auth user me request",
		runInRollbackTransaction(async () => {
			const uri = `http://localhost:${port}/graphql`
			let client = new ApolloClient({ uri, fetch })

			const createUserMutation = gql`
				mutation {
					createUser(email: "email@email.com", password: "password") {
						email
					}
				}
			`
			await client.mutate({ mutation: createUserMutation })

			const loginTokensQuery = gql`
				query {
					loginTokens(email: "email@email.com", password: "password") {
						accessToken
					}
				}
			`

			const tokens = await client.query({ query: loginTokensQuery })
			const accessToken = tokens.data.loginTokens.accessToken

			client = new ApolloClient({
				uri,
				fetch,
				request: operation => {
					operation.setContext({
						headers: {
							authorization: "Bearer " + accessToken,
						},
					})
				},
			})

			const meQuery = gql`
				query {
					me {
						email
					}
				}
			`

			const meResponse = await client.query({ query: meQuery })
			const meEmail = meResponse.data.me.email

			expect(meEmail).toBe("email@email.com")
		})
	)

	it(
		"receive no refresh token without auth header",
		runInRollbackTransaction(async () => {
			const uri = `http://localhost:${port}/refresh_token`

			const response = await fetch(uri, { method: "POST" })
			const jsonResponse = await response.json()

			expect(jsonResponse.data).toBeNull()
			expect(jsonResponse.errors).not.toBeUndefined()
		})
	)
})
