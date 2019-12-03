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
    const tokenPayload: TokenPayload = { ...payload, msc: Date.now() % 1000 }

    return jwtSign(tokenPayload, accessTokenSecret, {
        expiresIn: parseInt(process.env.ACCESS_EXPIRY as string),
    })
}

export const signRefreshToken = (payload: ContextPayload) => {
    const refreshTokenSecret = process.env.REFRESH_SECRET as string
    const tokenPayload: TokenPayload = { ...payload, msc: Date.now() % 1000 }

    return jwtSign(tokenPayload, refreshTokenSecret, {
        expiresIn: parseInt(process.env.REFRESH_EXPIRY as string),
    })
}

export const verifiedAccessTokenPayload = (token: string) => {
    const accessTokenSecret = process.env.ACCESS_SECRET as string

    return jwtVerify(token, accessTokenSecret) as TokenPayload
}

export const verifiedRefreshTokenPayload = (token: string) => {
    const refreshTokenSecret = process.env.REFRESH_SECRET as string
    return jwtVerify(token, refreshTokenSecret) as TokenPayload
}

export const accessTokenWithRefreshCookie = (uid: number, ver: number, res: Response) => {
    const refreshToken = signRefreshToken({ uid, ver })
    createRtCookie(res, refreshToken)

    return signAccessToken({ uid })
}

export const createRtCookie = (res: Response, token: string) =>
    res.cookie("rt", token, rtCookieOptions())

export const rtCookieOptions = () => {
    const refreshExpiryMs = parseInt(process.env.REFRESH_EXPIRY as string) * 1000

    return {
        httpOnly: true,
        path: "/refresh_token",
        expires: new Date(new Date().getTime() + refreshExpiryMs),
    }
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
    uid: number
    ver?: number
}

type TokenPayload = ContextPayload & {
    msc: number
    iat?: number
    exp?: number
}
