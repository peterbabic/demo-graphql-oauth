import "reflect-metadata"
import { Field, ObjectType } from "type-graphql"

@ObjectType()
export class AccessToken {
	@Field()
	jwt: string = ""

	@Field()
	jwtExpiry: number = 0
}
