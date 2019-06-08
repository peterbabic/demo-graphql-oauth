import { graphql, GraphQLSchema } from "graphql"
import { createSchema } from "./createSchema"

interface Options {
    source: string
}

let schema: GraphQLSchema

export const callSchema = async ({ source }: Options) => {
    if (!schema) {
        schema = await createSchema()
    }
    return graphql({
        schema,
        source,
    })
}
