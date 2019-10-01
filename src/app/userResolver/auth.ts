import { argon2id, hash, verify as argonVerify } from "argon2"
import { Request, Response } from "express"
import { readFileSync } from "fs"
import { sign, verify as jwtVerify } from "jsonwebtoken"
import { join } from "path"
import { AuthChecker } from "type-graphql"

let PRIVATE_KEY: Buffer
let PUBLIC_KEY: Buffer

export type Payload = {
	userId: number
}

export interface MyContext {
	req: Request
	res: Response
	payload?: Payload
}

export const hashPassword = async (password: string) =>
	await hash(password, { type: argon2id })

export const comparePassword = async (hash: string, plain: string) =>
	await argonVerify(hash, plain, { type: argon2id })

export const signToken = (payload: Payload) => {
	if (!PRIVATE_KEY) {
		PRIVATE_KEY = readKeyFile("jwtRS256.key")
	}

	return sign(payload, PRIVATE_KEY, { algorithm: "RS256" })
}

export const verifyToken = (token: string) => {
	if (!PUBLIC_KEY) {
		PUBLIC_KEY = readKeyFile("jwtRS256.key.pub")
	}

	return jwtVerify(token, PUBLIC_KEY)
}

export const customAuthChecker: AuthChecker<MyContext> = ({ context }) => {
	try {
		const authHeader = context.req.headers["authorization"]
		const token = authHeader!.split(" ")[1]
		const payload = verifyToken(token)
		context.payload = payload as any

		return true
	} catch (error) {
		throw new Error("the valid authorization header is required")
	}
}

const readKeyFile = (fileName: string) => readFileSync(join(__dirname, "auth", fileName))
