import "reflect-metadata";
import { Query, Resolver } from "type-graphql";
import { User } from "../User";

@Resolver()
export class UserResolver {
    private usersCollection: User[] = []

    @Query(returns => [User])
    async users() {
        return await this.usersCollection
    }
}
