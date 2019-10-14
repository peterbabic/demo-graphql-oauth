import { ApolloServer } from "apollo-server-express"
import { createTestClient } from "apollo-server-testing"
import { createConnection, getConnection } from "typeorm"
import { createServer } from "./server"
import { testingConnectionOptions } from "./server/testing"
import auth = require("./server/userResolver/auth")

describe("app should", () => {
	it("call the context function on apollo server", async () => {
		const spy = jest.spyOn(auth, "contextFunction")
		await createConnection(testingConnectionOptions())

		const port = 4001
		const server = (await createServer(port)) as any
		const { query } = createTestClient(server)
		await query({ query: "{me{email}}" })

		expect(server).toBeInstanceOf(ApolloServer)
		expect(spy).toHaveBeenCalledTimes(1)

		spy.mockRestore()

		await server.stop()
		await getConnection().close()
	})
})
