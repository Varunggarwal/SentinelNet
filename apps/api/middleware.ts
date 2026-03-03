import type { NextFunction, Request, Response } from "express";
import { prismaClient } from "db/client";


export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        // Check if user is authenticated via Clerk
        const token = req.auth;
        if (!token || !token.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = token .userId;
        
        // Ensure user exists in database
        await prismaClient.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                email: `user-${userId}@clerk.dev`
            }
        });

        req.userId = userId;
        next()
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Unauthorized', details: (error as Error).message });
    }
}