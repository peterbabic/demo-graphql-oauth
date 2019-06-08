import "reflect-metadata";
import { Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { User } from "../User";

@Resolver(of => User)
export class UserResolver {

    @Query(returns => [User])
    async users() {
        const userRepository = getRepository(User)
        return userRepository.find()
    }
}
