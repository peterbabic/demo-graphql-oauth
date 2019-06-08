import { buildSchema } from "type-graphql";
import { UserResolver } from "../modules/User/UserResolver";

export const createSchema = () =>
    buildSchema({
        resolvers: [UserResolver],
    })
