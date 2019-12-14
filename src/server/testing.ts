import { Request, Response } from "express"
import { ConnectionOptions } from "typeorm"
import {
    initializeTransactionalContext,
    patchTypeORMRepositoryWithBaseRepository,
    Propagation,
    Transactional,
} from "typeorm-transactional-cls-hooked"
import { connectionOptions } from "./connection"
import { Context } from "./UserResolver/auth"

export const testingPort = 4001
export const gqlUri = `http://localhost:${testingPort}/graphql`
export const refreshTokenUri = `http://localhost:${testingPort}/refresh_token`
export const uploadDir = __dirname + "/../../uploads/"

export const testingConnectionOptions = () => {
    const database = process.env.DB_NAME_TESING as string

    return { ...connectionOptions(), database } as ConnectionOptions
}

export const context = (): Context => ({
    req: {} as Request,
    res: {} as Response,
})

export const contextWithAuthHeader = (header: string): Context => ({
    req: {
        headers: {
            authorization: header,
        },
    } as Request,
    res: {} as Response,
})

export const contextWithCookie = (): Context => ({
    req: {} as Request,
    res: ({ cookie: () => undefined } as unknown) as Response,
})

export const initializeRollbackTransactions = () => {
    initializeTransactionalContext()
    patchTypeORMRepositoryWithBaseRepository()
}

type RunFunction = () => Promise<void> | void

class RollbackError extends Error {
    constructor(message: string) {
        super(message)

        this.name = this.constructor.name
    }
}

class TransactionCreator {
    @Transactional({ propagation: Propagation.REQUIRED })
    static async run(func: RunFunction) {
        await func()
        throw new RollbackError(`This is thrown to cause a rollback on the transaction.`)
    }
}

export function runInRollbackTransaction(func: RunFunction) {
    return async () => {
        try {
            await TransactionCreator.run(func)
        } catch (e) {
            /* istanbul ignore next */
            if (!(e instanceof RollbackError)) {
                throw e
            }
        }
    }
}
