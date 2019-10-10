require("dotenv").config()
import { ConnectionOptions } from "typeorm"
import { bootstrap } from "./app"
import { User } from "./app/userResolver/User"

let connectionOptions: ConnectionOptions = {
	type: "postgres",
	host: process.env.DB_HOST,
	port: 5432,
	database: process.env.DB_NAME,
	username: process.env.DB_USER,
	password: process.env.DB_PASS,
	entities: [User],
	synchronize: true,
	logging: false,
}

bootstrap(connectionOptions, 4000)
