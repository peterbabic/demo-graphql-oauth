import { DocumentNode, graphql, GraphQLSchema } from "graphql"
import { buildSchema } from "type-graphql"
import { customAuthChecker } from "./auth"
import { UserResolver } from "./User/UserResolver"

let schema: GraphQLSchema

export const callSchema = async (document: DocumentNode, context?: any) => {
	if (!schema) {
		schema = await createSchema()
	}

	return graphql({
		schema,
		source: document.loc!.source.body || "",
		contextValue: context,
	})
}

export const createSchema = () =>
	buildSchema({
		resolvers: [UserResolver],
		authChecker: customAuthChecker,
	})
