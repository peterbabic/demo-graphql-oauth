require("dotenv").config()
import { DocumentNode, graphql, GraphQLSchema } from "graphql"
import { buildSchema } from "type-graphql"
import { UserResolver } from "./UserResolver"
import { Context, customAuthChecker } from "./userResolver/auth"

let schema: GraphQLSchema

export const callSchema = async (document: DocumentNode, context?: Context) => {
	if (!schema) {
		schema = await createSchema()
	}

	return graphql({
		schema,
		source: gqlToString(document),
		contextValue: context,
	})
}

export const createSchema = () =>
	buildSchema({
		resolvers: [UserResolver],
		authChecker: customAuthChecker,
	})

export const gqlToString = (document: DocumentNode) => document.loc!.source.body as string
