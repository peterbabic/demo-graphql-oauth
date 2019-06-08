import { buildSchema } from "type-graphql";
import { UserResolver } from "./User/UserResolver";

export const createSchema = () =>
    buildSchema({
        resolvers: [UserResolver],
    })
