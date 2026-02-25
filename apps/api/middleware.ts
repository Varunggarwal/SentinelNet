import type { Request, Response, NextFunction } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction){
    const authHeadr = req.headers['authorization'];
    req.userId = "4";
    next()
}
