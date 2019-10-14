import express = require("express")
import { ApolloServer } from "apollo-server-express"
import { createSchema } from "./server/schema"
import { contextFunction } from "./server/userResolver/auth"

export const createServer = async (port: number) => {
	const server = new ApolloServer({
		schema: await createSchema(),
		playground: true,
		introspection: true,
		debug: true,
		context: contextFunction,
	})

	const app = express()
	app.post("/refresh_token", (_req, res) =>
		res.send({ data: null, errors: "Invalid access token" })
	)
	server.applyMiddleware({ app })
	app.listen({ port })

	return server
}
