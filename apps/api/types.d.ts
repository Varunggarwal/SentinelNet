declare namespace Express{
    interface Request{
        userId?: string
    }
}

declare module "@clerk/express" {
    import type { RequestHandler } from "express";

    export function requireAuth(): RequestHandler;
}

declare module "cors" {
    import type { RequestHandler } from "express";

    function cors(): RequestHandler;
    export default cors;
}

declare module "@solana/web3.js" {
    export class Connection {
        constructor(endpoint: string, config?: unknown);
    }

    export class Transaction {}

    export const SystemProgram: unknown;
}