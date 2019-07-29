import { buildSchema, MiddlewareFn } from "type-graphql"
import { UserResolver } from "../modules/User/UserResolver"

const ErrorInterceptor: MiddlewareFn<any> = async ({}, next) => {
    try {
        return await next()
    } catch (err) {
        console.error(err)
    }
}

export const createSchema = () =>
    buildSchema({
        resolvers: [UserResolver],
        globalMiddlewares: [ErrorInterceptor],
    })
