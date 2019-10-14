import "reflect-metadata"
import { Field, ObjectType } from "type-graphql"

@ObjectType()
export class LoginTokens {
	@Field()
	accessToken: string = ""
}
