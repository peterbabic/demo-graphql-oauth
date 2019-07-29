
import faker = require("faker")
import { createConnection, getConnection } from "typeorm"
import { callSchema } from "../../utils/callSchema"
import * as jwt from "../../utils/jwt"
import { User } from "../User"

beforeAll(async () => {
    return await createConnection({
        type: "postgres",
        host: "localhost",
        port: 5432,
        database: "testing",
        username: "postgres",
        password: "postgres",
        // dropSchema: true,
        entities: [User],
        synchronize: true,
        logging: false,
    })
})

afterAll(async () => {
    return await getConnection().close()
})

afterEach(async () => {
    return await getConnection().synchronize(true)
})

describe("resolver of user", () => {
    it("returns email as it creates user with mutation", async () => {

        const fakeEmail = faker.internet.email()
        const fakePassword = faker.internet.password(6)
        const createUserMutation = `mutation {
            createUser(email: "${fakeEmail}", password: "${fakePassword}") {
                email
            }
        }`

        const response = await callSchema(createUserMutation)

        expect(response).toMatchObject({
            data: {
                createUser: { email: fakeEmail },
            },
        })
    })

    it("should return emails of registered users", async () => {

        const usersQuery = `{
            users {
                email
            }
        }`

        const user = await User.create({
            email: faker.internet.email(),
        }).save()

        const response = await callSchema(usersQuery)

        expect(response).toMatchObject({
            data: {
                users: [{ email: user.email }],
            },
        })
    })

    it("should return a valid login token", async () => {

        const fakeEmail = faker.internet.email()
        const fakePassword = faker.internet.password(6)
        await User.create({
            email: fakeEmail,
            password: fakePassword,
        }).save()

        const loginTokenQuery = `{
            loginToken(email: "${fakeEmail}", password: "${fakePassword}") 
        }`
        
        const response = await callSchema(loginTokenQuery)
        const token = response.data!.loginToken;

        expect(jwt.verify(token, jwt.PUBLIC_KEY)).toBeTruthy()
    })
})
