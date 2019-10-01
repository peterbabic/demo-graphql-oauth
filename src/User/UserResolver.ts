import "reflect-metadata"
import { Arg, Authorized, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql"
import { comparePassword, MyContext, signToken } from "../auth"
import { User } from "../User"

@ObjectType()
class LoginTokens {
	@Field()
	accessToken: string = ""
}

@Resolver(() => User)
export class UserResolver {
	@Query(() => [User])
	async users() {
		return await User.find()
	}

	@Query(() => LoginTokens)
	async loginTokens(
		@Arg("email") email: string,
		@Arg("password") password: string
	): Promise<LoginTokens> {
		const user = await User.findOne({ where: { email } })

		if (!user) {
			throw new Error("could not find user")
		}

		const passwordValid = await comparePassword(user.password, password)

		if (!passwordValid) {
			throw new Error("password not valid")
		}

		const accessToken = signToken({ userId: user.id })

		return {
			accessToken,
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
