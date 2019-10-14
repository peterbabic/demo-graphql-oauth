import { ConnectionOptions } from "typeorm"
import { User } from "./userResolver/User"

export const connectionOptions = (): ConnectionOptions => ({
	type: "postgres",
	host: process.env.DB_HOST as string,
	port: parseInt(process.env.DB_PORT as string),
	database: process.env.DB_NAME as string,
	username: process.env.DB_USER as string,
	password: process.env.DB_PASS as string,
	entities: [User],
	dropSchema: false,
	synchronize: false,
	logging: false,
})
