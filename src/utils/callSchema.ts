import { graphql, GraphQLSchema } from "graphql";
import { createSchema } from "./createSchema";


let schema: GraphQLSchema

export const callSchema = async ( source : string) => {
    if (!schema) {
        schema = await createSchema()
    }
    return graphql({
        schema,
        source,
    })
}
