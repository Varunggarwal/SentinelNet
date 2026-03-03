
declare namespace Express {
    interface Request {
        userId?: string
        auth?: {
            userId?: string;
            user?: any;
        }
    }
}