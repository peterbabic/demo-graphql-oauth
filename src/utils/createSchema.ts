import { AuthChecker, buildSchema, MiddlewareFn } from "type-graphql"
// import { User } from "../modules/User"
import { UserResolver } from "../modules/User/UserResolver"

const errorInterceptor: MiddlewareFn<any> = async ({}, next) => {
    try {
        return await next()
    } catch (err) {
        console.error(err)
    }
}

const customAuthChecker: AuthChecker<any> = () => false
//     { root, args, context, info },
//     roles,
//   ) => {
//       console.log(`root: `)
//       console.log(root)
//       console.log(`args: `)
//       console.log(args)
//       console.log(`context: `)
//       console.log(context)
//       console.log(`info: `)
//       console.log(info)
//       console.log(`roles: `)
//       console.log(roles)
//     // here we can read the user from context
//     // and check his permission in the db against the `roles` argument
//     // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]
  
//     return false; // or false if access is denied
//   };

export const createSchema = () =>
    buildSchema({
        resolvers: [UserResolver],
        globalMiddlewares: [errorInterceptor],
        authChecker: customAuthChecker,
        // authMode: "null"
    })
