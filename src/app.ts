import { ApolloServer } from "apollo-server"
import { buildSchema } from "type-graphql"
import { UserResolver } from "./User/UserResolver"

const PORT = process.env.PORT || 4000

async function bootstrap() {
    // ... Building schema here
    const schema = await buildSchema({
        resolvers: [UserResolver],
    })

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
