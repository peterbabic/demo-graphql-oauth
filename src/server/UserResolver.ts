import "reflect-metadata"
import { Arg, Authorized, Ctx, Mutation, Query } from "type-graphql"
import {
    accessTokenWithRefreshCookie,
    comparePasswords,
    Context,
    createRtCookie,
} from "./userResolver/auth"
import { User } from "./userResolver/User"

export class UserResolver {
    @Query(() => String)
    async query() {
        return ""
    }

    @Mutation(() => User)
    async createUser(@Arg("email") email: string, @Arg("password") password: string) {
        return await User.create({
            email,
            password,
        }).save()
    }

    @Mutation(() => String)
    async accessToken(
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() { res }: Context
    ) {
        try {
            const user = await User.findOne({ where: { email } })
            await comparePasswords(user!.password, password)

            return accessTokenWithRefreshCookie(user!.id, user!.tokenVersion, res)
        } catch (error) {
            throw new Error("Login credentials are invalid: " + error)
        }
    }

    @Mutation(() => User)
    @Authorized()
    async me(@Ctx() { payload }: Context) {
        return await User.findOne({
            where: { id: payload!.uid },
        })
    }

    @Mutation(() => Boolean)
    async signOut(@Ctx() { res }: Context) {
        createRtCookie(res, "")

        return true
    }
}
