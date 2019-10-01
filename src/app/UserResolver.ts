import "reflect-metadata"
import { Arg, Authorized, Ctx, Mutation, Query } from "type-graphql"
import { comparePassword, MyContext, signToken } from "./userResolver/auth"
import { Tokens } from "./userResolver/Tokens"
import { User } from "./userResolver/User"

export class UserResolver {
	@Query(() => [User])
	async users() {
		return await User.find()
	}

	@Query(() => Tokens)
	async tokens(
		@Arg("email") email: string,
		@Arg("password") password: string
	): Promise<Tokens> {
		try {
			const user = await User.findOne({ where: { email } })

			if (!(await comparePassword(user!.password, password))) {
				throw new Error()
			}

			const accessToken = signToken({ userId: user!.id })

			return {
				accessToken,
			}
		} catch (error) {
			throw new Error("login credentials are invalid")
		}
	}

	@Query(() => User)
	@Authorized()
	async me(@Ctx() { payload }: MyContext) {
		const id = payload!.userId
		const user = await User.findOne({ where: { id } })

		return user
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
