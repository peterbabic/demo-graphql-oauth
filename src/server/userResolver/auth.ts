import { argon2id, hash, verify as argonVerify } from "argon2"
import { Request, Response } from "express"
import { sign, verify as jwtVerify } from "jsonwebtoken"
import { AuthChecker } from "type-graphql"

export type Payload = {
	userId: number
}

export interface ContextInterface {
	req: Request
	res: Response
	payload?: Payload
}

export const hashPassword = async (password: string) =>
	await hash(password, { type: argon2id })

export const comparePassword = async (hash: string, plain: string) =>
	await argonVerify(hash, plain, { type: argon2id })

export const signAccessToken = (payload: Payload) => {
	return sign(payload, process.env.ACCESS_SECRET!)
}

export const verifyAccessToken = (token: string) => {
	return jwtVerify(token, process.env.ACCESS_SECRET!)
}

export const customAuthChecker: AuthChecker<ContextInterface> = ({ context }) => {
	try {
		const authHeader = context.req.headers["authorization"]
		const accessToken = authHeader!.split(" ")[1]
		const payload = verifyAccessToken(accessToken)
		context.payload = payload as any

		return true
	} catch (error) {
		throw new Error("the valid authorization header is required: " + error)
	}
}

export const contextFunction = ({ req, res }: ContextInterface) => ({ req, res })
