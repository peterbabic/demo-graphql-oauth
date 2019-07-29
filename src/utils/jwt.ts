import * as jwt from "jsonwebtoken"
export * from "jsonwebtoken"

import fs = require('fs')
import path = require('path')

const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, 'keys', 'jwtRS256.key'))
export const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, 'keys', 'jwtRS256.key.pub')) 

export function signWithRS256(payload: string | object) {
    return jwt.sign(payload, PRIVATE_KEY, {algorithm: "RS256"})
}
