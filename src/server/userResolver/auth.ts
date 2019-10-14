import { argon2id, hash, verify as argonVerify } from "argon2"
import { sign, verify as jwtVerify } from "jsonwebtoken"
import { AuthChecker } from "type-graphql"
import { ContextInterface } from "./ContextInterface"

export type ContextPayload = {
	userId: number
}

type AccessTokenPayload = {
	userId: number
	iat: number
	exp?: number
}

export const hashPassword = async (password: string) =>
	await hash(password, { type: argon2id })

export const comparePassword = async (hash: string, plain: string) =>
	await argonVerify(hash, plain, { type: argon2id })

export const signAccessToken = (payload: ContextPayload) => {
	const accessTokenSecret = process.env.ACCESS_SECRET as string

	return sign(payload, accessTokenSecret, {
		expiresIn: process.env.ACCESS_EXP,
	})
}

export const verifyAccessToken = (token: string) => {
	const accessTokenSecret = process.env.ACCESS_SECRET as string

	return jwtVerify(token, accessTokenSecret) as AccessTokenPayload
}

export const customAuthChecker: AuthChecker<ContextInterface> = ({ context }) => {
	try {
		const authHeader = context.req.headers["authorization"]
		const accessToken = authHeader!.split(" ")[1]
		const accessTokenPayload = verifyAccessToken(accessToken)
		context.payload = accessTokenPayload as ContextPayload

		return true
	} catch (error) {
		throw new Error("the valid authorization header is required: " + error)
	}
}

export const contextFunction = ({ req, res }: ContextInterface) => ({ req, res })
