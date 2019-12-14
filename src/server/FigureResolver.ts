import { createWriteStream } from "fs-extra"
import { GraphQLUpload } from "graphql-upload"
import { pipeline } from "stream"
import { Arg, Mutation } from "type-graphql"
import { Upload } from "./FigureResolver/Upload"
import path = require("path")

export class FigureResolver {
    @Mutation(() => Boolean)
    async uploadFigure(
        @Arg("file", () => GraphQLUpload)
        { createReadStream, filename }: Upload
    ) {
        const allowedExt = [".jpg", ".png"]
        const ext = path.extname(filename)

        if (!allowedExt.includes(ext)) {
            throw new Error("wrong extension")
        }

        return new Promise((resolve, reject) =>
            pipeline(
                createReadStream() as any,
                createWriteStream(__dirname + "/../../uploads/" + filename),
                error => (error ? reject(error) : resolve(true))
            )
        )
    }
}
