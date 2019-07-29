import "reflect-metadata"
import { Arg, Mutation, Query, Resolver } from "type-graphql"
import * as argon2 from "../../utils/argon2"
import * as jwt from "../../utils/jwt"
import { User } from "../User"

@Resolver(() => User)
export class UserResolver {
    @Query(() => [User])
    async users() {
        return await User.find()
    }

    @Query(() => String, { nullable: true })
    async loginToken(
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<string | null> {
        const user = await User.findOne({ where: { email } })

        if (!user) {
            return null
        }

        const passwordValid = await argon2.verify(user.password, password)

        if (!passwordValid) {
            return null
        }

        const token = jwt.signWithRS256({ userId: user.id })
        return token
    }

    @Mutation(() => User)
    async createUser(
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<User> {
        return await User.create({
            email,
            password,
        }).save()
    }
}
