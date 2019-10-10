require("isomorphic-fetch")
import { ApolloServer } from "apollo-server-express"
import { getConnection } from "typeorm"
import { bootstrap } from "./app"
import { connectionOptionsforTesting } from "./app/schema"
import { signToken } from "./app/userResolver/auth"
import { User } from "./app/userResolver/User"

let server: ApolloServer
let port: number

beforeAll(async () => {
	port = 4001
	server = await bootstrap(connectionOptionsforTesting(), port)
})

describe("app should", () => {
	it("accept auth header correctly", async () => {
		const user = await User.create({
			email: "email@email.com",
		}).save()

		let token = signToken({ userId: user.id })

		const url = `http://localhost:${port}/graphql`

		const rawResponse = await fetch(url, {
			method: "post",
			headers: {
				"content-Type": "application/json",
				authorization: "Bearer " + token,
			},
			body: JSON.stringify({
				query: "{me{email}}",
			}),
		})

		const response = await rawResponse.json()

		expect(response.errors).toBeUndefined()
		expect(response.data).toMatchObject({
			me: { email: user.email },
		})

		await getConnection().synchronize(true)
		await getConnection().close()
		await server.stop()
	})
})
