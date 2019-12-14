import { gql } from "apollo-server-express"
import { Readable, Stream } from "stream"
import { createConnection, getConnection } from "typeorm"
import { Upload } from "./FigureResolver/Upload"
import { callSchema } from "./schema"
import {
    context,
    initializeRollbackTransactions,
    runInRollbackTransaction,
    testingConnectionOptions,
    uploadDir,
} from "./testing"
import fs = require("fs-extra")

describe("resolver of figures should", () => {
    it(
        "return an error when wrong file extension is provided",
        runInRollbackTransaction(async () => {
            const filename = "wrong_extensions.txt"
            const file: Upload = {
                filename,
                mimetype: "image/text",
                encoding: "7bit",
                createReadStream: () => new Stream(),
            }
            const response = await callSchema(uploadFileMutation, context(), {
                file,
            })

            expect(response.errors).toBeDefined()
            expect(response.data).toBeNull()
            await expect(fs.stat(uploadDir + filename)).rejects.toThrow()
        })
    )

    it(
        "return an error when error occurs during streaming",
        runInRollbackTransaction(async () => {
            const filename = "stream_error.png"
            const file: Upload = {
                filename,
                mimetype: "image/png",
                encoding: "7bit",
                createReadStream: () => {
                    const stream = new Readable({
                        objectMode: true,
                        read() {},
                    })
                    stream.push("file contents")
                    stream.destroy(new Error("readable stream error"))
                    return stream
                },
            }
            const response = await callSchema(uploadFileMutation, context(), {
                file,
            })

            expect(response.errors).toBeDefined()
            expect(response.data).toBeNull()
            await expect(fs.stat(uploadDir + filename)).resolves.toBeTruthy()
        })
    )

    it(
        "return truthy when ok",
        runInRollbackTransaction(async () => {
            const filename = "truthy.png"
            const file: Upload = {
                filename,
                mimetype: "image/png",
                encoding: "7bit",
                createReadStream: () => {
                    const stream = new Readable({
                        objectMode: true,
                        autoDestroy: true,
                        read() {},
                    })

                    stream.push(null)
                    return stream
                },
            }
            const response = await callSchema(uploadFileMutation, context(), {
                file,
            })

            expect(response.errors).toBeUndefined()
            expect(response.data).toMatchObject({ uploadFigure: true })
            await expect(fs.stat(uploadDir + filename)).resolves.toBeTruthy()
        })
    )
})

beforeAll(async () => {
    initializeRollbackTransactions()
    await createConnection(testingConnectionOptions())
    await fs.emptyDir(uploadDir)
})

afterAll(async () => {
    await getConnection().close()
    // await fs.emptyDir(uploadDir)
})

const uploadFileMutation = gql`
    mutation($file: Upload!) {
        uploadFigure(file: $file)
    }
`
