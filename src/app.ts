require("dotenv").config()
import { ApolloServer } from "apollo-server-express"
import { createConnection } from "typeorm"
import { connectionOptionsforDB, createSchema } from "./app/schema"
import express = require("express")
;(async () => {
	await createConnection(connectionOptionsforDB())

	const server = new ApolloServer({
		schema: await createSchema(),
		playground: true,
		introspection: true,
		debug: true,
		context: ({ req, res }) => ({ req, res }),
	})

	const app = express()
	server.applyMiddleware({ app })

	app.listen({ port: process.env.APP_PORT }, () =>
		console.log(
			`Server ready at http://localhost:${process.env.APP_PORT}${server.graphqlPath}`
		)
	)
})()
