require("dotenv").config()
import { ApolloServer } from "apollo-server-express"
import { createConnection } from "typeorm"
import { createSchema } from "./schema"
import { User } from "./User"
import express = require("express")

;(async () => {
    await createConnection({
        type: "postgres",
        host: "localhost",
        port: 5432,
        database: "postgres",
        username: "postgres",
        password: "postgres",
        // dropSchema: true,
        entities: [User],
        synchronize: true,
        logging: false,
    })

    const server = new ApolloServer({
        schema: await createSchema(),
        playground: true,
        introspection: true,
        debug: true,
        context: ({ req, res }) => ({ req, res }),
    })

    const app = express()
    server.applyMiddleware({ app })

    const PORT = process.env.PORT || 4000
    app.listen({ port: PORT }, () =>
        console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}.    `)
    )
})()
