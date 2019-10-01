import { argon2id, hash, verify as argonVerify } from "argon2"
import { Request, Response } from "express"
import { readFileSync } from "fs"
import { sign, verify as jwtVerify } from "jsonwebtoken"
import { join } from "path"
import { AuthChecker } from "type-graphql"

export type Payload = {
	userId: number
}

export interface MyContext {
	req: Request
	res: Response
	payload?: Payload
}

export async function hashPassword(password: string) {
	return await hash(password, { type: argon2id })
}

export async function comparePassword(hash: string, plain: string) {
	return await argonVerify(hash, plain, { type: argon2id })
}

export function signToken(payload: Payload) {
	const PRIVATE_KEY = readFileSync(join(__dirname, "auth", "jwtRS256.key"))

	return sign(payload, PRIVATE_KEY, { algorithm: "RS256" })
}

export function verifyToken(token: string) {
	const PUBLIC_KEY = readFileSync(join(__dirname, "auth", "jwtRS256.key.pub"))

	return jwtVerify(token, PUBLIC_KEY)
}

export const customAuthChecker: AuthChecker<MyContext> = ({ context }) => {
	const authHeader = context.req.headers["authorization"]

	if (!authHeader) {
		throw new Error("authorization header is missing")
	}

	const token = authHeader.split(" ")[1]

	if (!token) {
		throw new Error("token not present in authorization header")
	}

	const payload = verifyToken(token)

	if (!payload) {
		throw new Error("payload not present in the token")
	}

	context.payload = payload as any
	return true
}
