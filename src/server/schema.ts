require("dotenv").config()
import { DocumentNode, graphql, GraphQLSchema } from "graphql"
import { buildSchema } from "type-graphql"
import { FigureResolver } from "./FigureResolver"
import { UserResolver } from "./UserResolver"
import { Context, customAuthChecker } from "./UserResolver/auth"

let schema: GraphQLSchema

export const callSchema = async (
    document: DocumentNode,
    context?: Context,
    variables?: any
) => {
    if (!schema) {
        schema = await createSchema()
    }

    return graphql({
        schema,
        source: gqlToStr(document),
        contextValue: context,
        variableValues: variables,
    })
}

export const createSchema = () =>
    buildSchema({
        resolvers: [UserResolver, FigureResolver],
        authChecker: customAuthChecker,
        validate: false,
    })

export const gqlToStr = (document: DocumentNode) => document.loc!.source.body as string
