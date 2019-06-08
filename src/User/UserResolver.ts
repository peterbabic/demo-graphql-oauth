import "reflect-metadata"
import { Resolver, Query } from "type-graphql"
import { User } from "../User"

@Resolver()
export class UserResolver {
    private recipesCollection: User[] = []

    @Query(returns => [User])
    async users() {
        return await this.recipesCollection
    }
}
