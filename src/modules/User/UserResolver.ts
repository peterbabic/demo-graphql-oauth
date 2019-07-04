import "reflect-metadata";
import { Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { User } from "../User";

@Resolver(_of => User)
export class UserResolver {

    @Query(_returns => [User])
    async users() {
        const userRepository = getRepository(User)
        return userRepository.find()
    }
}
