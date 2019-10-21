import express = require("express")
import { ApolloServer } from "apollo-server-express"
import { createSchema } from "./server/schema"
import {
	contextFunction,
	refreshTokens,
	verifiedRefreshTokenPayload,
} from "./server/userResolver/auth"
import cookie = require("cookie")

export const createServer = async (port: number) => {
	const server = new ApolloServer({
		schema: await createSchema(),
		playground: true,
		introspection: true,
		debug: true,
		context: contextFunction,
	})

	const app = express()
	app.post("/refresh_token", (req, res) => {
		try {
			const parsedCookie = cookie.parse(req.headers.cookie!)
			const refreshTokenPayload = verifiedRefreshTokenPayload(parsedCookie.rt)
			const accessToken = refreshTokens(refreshTokenPayload.userId, res)
			res.json({ data: accessToken })
		} catch (error) {
			res.json({ data: null, errors: "Refresh failed: " + error })
		}
	})
	server.applyMiddleware({ app })
	app.listen({ port })

	return server
}
