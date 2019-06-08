import faker from "faker";
import { createConnection, getConnection } from "typeorm";
import { callSchema } from "../../utils/callSchema";
import { User } from "../User";

const usersQuery = `
query {
    users {
        email
    }
}`

beforeEach(() => {
    return createConnection({
        type: "sqlite",
        database: ":memory:",
        dropSchema: true,
        entities: [User],
        synchronize: true,
        logging: false
    });
});

afterEach(() => {
    let conn = getConnection();
    return conn.close();
});

describe("resolver of", () => {
    describe("users query", () => {
        it("should return an empty array when no users are created", async () => {
            const response = await callSchema({
                source: usersQuery,
            })

            expect(response).toMatchObject({
                data: {
                    users: [],
                },
            })
        })

        it("should return a populated array when an user is created", async () => {
            const user = await User.create({
                email: faker.internet.email(),
            }).save()

            const response = await callSchema({
                source: usersQuery,
            })

            expect(response).toMatchObject({
                data: {
                    users: [{ email: user.email }],
                },
            })
        })
    })
})
