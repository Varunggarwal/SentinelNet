import type { NextFunction, Request, Response } from "express";
import { prismaClient } from "db/client";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const clerkEnabled = Boolean(
            process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        );
        const userId = clerkEnabled
            ? req.auth?.userId
            : process.env.LOCAL_USER_ID || "local-dev-user";

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
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
