require("dotenv").config()
import { createConnection } from "typeorm"
import { createServer } from "./server"
import { connectionOptions } from "./server/connection"
;(async () => {
	await createConnection(connectionOptions())

	const port = 4000
	await createServer(port)
})()
