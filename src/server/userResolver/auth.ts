import { argon2id, hash as argonHash, verify as argonVerify } from "argon2"
import { Request, Response } from "express"
import { sign as jwtSign, verify as jwtVerify } from "jsonwebtoken"
import { AuthChecker } from "type-graphql"

export const hashPassword = async (password: string) =>
    await argonHash(password, { type: argon2id })

export const comparePasswords = async (hash: string, plain: string) => {
    if (!(await argonVerify(hash, plain, { type: argon2id }))) {
        throw new Error("Passwords do not match")
    }

    return true
}

export const signAccessToken = (payload: ContextPayload) => {
    const accessTokenSecret = process.env.ACCESS_SECRET as string
    const payloadWithMs = { ...payload, ms: Date.now() % 1000 }

    return jwtSign(payloadWithMs, accessTokenSecret, {
        expiresIn: parseInt(process.env.ACCESS_EXPIRY as string),
    })
}

export const signRefreshToken = (payload: ContextPayload) => {
    const accessTokenSecret = process.env.REFRESH_SECRET as string

    return jwtSign(payload, accessTokenSecret, {
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

export const accessTokenWithRefreshCookie = (userId: number, res: Response) => {
    const accessToken = signAccessToken({ userId })

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
    ms?: number
}
