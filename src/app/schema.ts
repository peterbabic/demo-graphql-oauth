require("dotenv").config()
import { DocumentNode, graphql, GraphQLSchema } from "graphql"
import { buildSchema } from "type-graphql"
import { ConnectionOptions } from "typeorm"
import { UserResolver } from "./UserResolver"
import { customAuthChecker } from "./userResolver/auth"
import { User } from "./userResolver/User"

let schema: GraphQLSchema

export const callSchema = async (document: DocumentNode, context?: any) => {
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

export const connectionOptionsforTesting = () => {
	let connectionOptions: ConnectionOptions = {
		type: "postgres",
		host: process.env.DB_HOST,
		port: 5432,
		database: "testing",
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
		entities: [User],
		synchronize: true,
		logging: false,
	}

	return connectionOptions
}
