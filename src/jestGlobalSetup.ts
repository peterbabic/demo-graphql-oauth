require("dotenv").config()
import { createConnection } from "typeorm"
import { testingConnectionOptions } from "./server/testing"

module.exports = async function() {
	const connection = await createConnection({
		...testingConnectionOptions(),
		dropSchema: true,
		synchronize: true,
	})

	await connection.close()
}
