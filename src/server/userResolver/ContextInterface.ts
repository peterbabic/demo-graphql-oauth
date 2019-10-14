import { Request, Response } from "express"
import { ContextPayload } from "./auth"

export interface ContextInterface {
	req: Request
	res: Response
	payload?: ContextPayload
}
