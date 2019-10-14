require("dotenv").config()
import { DocumentNode, graphql, GraphQLSchema } from "graphql"
import { buildSchema } from "type-graphql"
import { UserResolver } from "./UserResolver"
import { customAuthChecker } from "./userResolver/auth"
import { ContextInterface } from "./userResolver/ContextInterface"

let schema: GraphQLSchema

export const callSchema = async (document: DocumentNode, context?: ContextInterface) => {
	if (!schema) {
		schema = await createSchema()
	}

	return graphql({
		schema,
		source: document.loc!.source.body,
		contextValue: context,
	})
}

export const createSchema = () =>
	buildSchema({
		resolvers: [UserResolver],
		authChecker: customAuthChecker,
	})
