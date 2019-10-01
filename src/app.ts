require("dotenv").config()
import { ApolloServer } from "apollo-server-express"
import { createConnection } from "typeorm"
import { connectionOptions, createSchema } from "./app/schema"
import express = require("express")
;(async () => {
	await createConnection(connectionOptions)

	const server = new ApolloServer({
		schema: await createSchema(),
		playground: true,
		introspection: true,
		debug: true,
		context: ({ req, res }) => ({ req, res }),
	})

	const app = express()
	server.applyMiddleware({ app })

	const APP_PORT = process.env.APP_PORT || 4000
	app.listen({ port: APP_PORT }, () =>
		console.log(
			`🚀 Server ready at http://localhost:${APP_PORT}${server.graphqlPath}.    `
		)
	)
})()
