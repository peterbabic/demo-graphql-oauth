import * as agron2 from "argon2"
export * from "argon2"

/**
 * Override the defaul agron2i option with agron2id
 * @param password Pasword to has using argon2id
 */
export async function hashIncludingOptions(password: string) {
    return await agron2.hash(password, { type: agron2.argon2id })
}
