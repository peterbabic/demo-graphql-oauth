import "reflect-metadata"
import { Arg, Authorized, Ctx, Mutation, Query } from "type-graphql"
import {
	accessTokenWithRefreshCookie,
	comparePasswords,
	Context,
} from "./userResolver/auth"
import { User } from "./userResolver/User"

export class UserResolver {
	@Query(() => String)
	async accessToken(
		@Arg("email") email: string,
		@Arg("password") password: string,
		@Ctx() { res }: Context
	) {
		try {
			const user = await User.findOne({ where: { email } })
			await comparePasswords(user!.password, password)

			return accessTokenWithRefreshCookie(user!.id, res)
		} catch (error) {
			throw new Error("Login credentials are invalid: " + error)
		}
	}

	@Query(() => User)
	@Authorized()
	async me(@Ctx() { payload }: Context) {
		const id = payload!.userId
		const user = await User.findOne({ where: { id } })

		return user
	}

	@Mutation(() => User)
	async createUser(@Arg("email") email: string, @Arg("password") password: string) {
		return await User.create({
			email,
			password,
		}).save()
	}
}
