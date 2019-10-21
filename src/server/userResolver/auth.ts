import { argon2id, hash, verify as argonVerify } from "argon2"
import { Request, Response } from "express"
import { sign, verify as jwtVerify } from "jsonwebtoken"
import { AuthChecker } from "type-graphql"
import { AccessToken } from "./AccessToken"

export type Context = {
	req: Request
	res: Response
	payload?: ContextPayload
}

type ContextPayload = {
	userId: number
}

type JWTPayload = {
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
		expiresIn: parseInt(process.env.ACCESS_EXPIRY as string),
	})
}

export const signRefreshToken = (payload: ContextPayload) => {
	const accessTokenSecret = process.env.REFRESH_SECRET as string

	return sign(payload, accessTokenSecret, {
		expiresIn: parseInt(process.env.REFRESH_EXPIRY as string),
	})
}

export const verifiedAccessTokenPayload = (token: string) => {
	const accessTokenSecret = process.env.ACCESS_SECRET as string

	return jwtVerify(token, accessTokenSecret) as JWTPayload
}

export const verifiedRefreshTokenPayload = (token: string) => {
	const refreshTokenSecret = process.env.REFRESH_SECRET as string

	return jwtVerify(token, refreshTokenSecret) as JWTPayload
}

export const refreshTokens = (userId: number, res: Response) => {
	const accessToken = new AccessToken()
	accessToken.jwt = signAccessToken({ userId })
	accessToken.jwtExpiry = parseInt(process.env.ACCESS_EXPIRY as string)

	const refreshExpiryMs = parseInt(process.env.REFRESH_EXPIRY as string) * 1000
	res.cookie("rt", signRefreshToken({ userId }), {
		httpOnly: true,
		path: "/refresh_token",
		expires: new Date(new Date().getTime() + refreshExpiryMs),
	})

	return accessToken
}

export const customAuthChecker: AuthChecker<Context> = ({ context }) => {
	try {
		const authHeader = context.req.headers["authorization"]
		const accessToken = authHeader!.split(" ")[1]
		const accessTokenPayload = verifiedAccessTokenPayload(accessToken)
		context.payload = accessTokenPayload as ContextPayload

		return true
	} catch (error) {
		throw new Error("the valid authorization header is required: " + error)
	}
}

export const contextFunction = ({ req, res }: Context) => ({ req, res })
