import express = require("express")
import { ApolloServer } from "apollo-server-express"
import { ConnectionOptions, createConnection } from "typeorm"
import { createSchema } from "./app/schema"
import { contextFunction } from "./app/userResolver/auth"

export const bootstrap = async (connectionOptions: ConnectionOptions, port: number) => {
	await createConnection(connectionOptions)

	const server = new ApolloServer({
		schema: await createSchema(),
		playground: true,
		introspection: true,
		debug: true,
		context: contextFunction,
	})

	const app = express()
	server.applyMiddleware({ app })
	app.listen({ port })

	return server
}
