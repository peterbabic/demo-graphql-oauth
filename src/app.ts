require("dotenv").config()
import { ApolloServer } from "apollo-server"
import { createConnection } from "typeorm"
import { User } from "./modules/User"
import { createSchema } from "./utils/createSchema"

const PORT = process.env.PORT || 4000

async function bootstrap() {

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

    // ... Building schema here
    const schema = await createSchema()

    // Create the GraphQL server
    const server = new ApolloServer({
        schema,
        playground: true,
    })

    // Start the server
    const { url } = await server.listen(PORT)
    console.log(`Server is running, GraphQL Playground available at ${url}`)
}

bootstrap()
