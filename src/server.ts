import express = require("express")
import { ApolloServer } from "apollo-server-express"
import { createSchema } from "./server/schema"
import {
    accessTokenWithRefreshCookie,
    contextFunction,
    verifiedRefreshTokenPayload,
} from "./server/UserResolver/auth"
import { User } from "./server/UserResolver/User"
import cookie = require("cookie")
import cors = require("cors")

export const createServer = async (port: number) => {
    const server = new ApolloServer({
        schema: await createSchema(),
        playground: true,
        introspection: true,
        debug: true,
        context: contextFunction,
    })

    const app = express()
    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials: true,
        })
    )

    app.post("/refresh_token", async (req, res) => {
        try {
            const parsedCookie = cookie.parse(req.headers.cookie!)
            const rtPayload = verifiedRefreshTokenPayload(parsedCookie.rt)

            await User.findOneOrFail({
                where: { id: rtPayload.uid, tokenVersion: rtPayload.ver },
            })

            const accessToken = accessTokenWithRefreshCookie(
                rtPayload.uid,
                rtPayload.ver!,
                res
            )

            res.json({ data: accessToken })
        } catch (error) {
            res.json({ data: null, errors: "Refresh failed: " + error })
        }
    })

    server.applyMiddleware({ app, cors: false })
    app.listen({ port })

    return server
}
