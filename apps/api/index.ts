import "dotenv/config";
import express, { Router } from "express"
import { authMiddleware } from "./middleware";
import { prismaClient } from "db/client";
import cors from "cors";
import { Connection } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const app = express();
const router = Router();
const port = Number(process.env.API_PORT || 8080);
const clerkEnabled = Boolean(
  process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

app.use(cors());
app.use(express.json());

// Apply auth middleware to all routes in this router
router.use(authMiddleware as any);

router.post("/website", async (req, res): Promise<void> => {
    try {
        const userId = req.userId!;
        const { url } = req.body;

        if (!url) {
            res.status(400).json({ error: 'URL is required' });
            return;
        }

        const data = await prismaClient.websites.create({
            data: {
                id: `website-${Date.now()}`,
                url,
                userId
            }
        })

        res.json({
            id: data.id
        });
    } catch (error) {
        console.error('Error creating website:', error);
        res.status(500).json({ error: 'Failed to create website', details: (error as Error).message });
    }
});

router.get("/website/status", async (req, res): Promise<void> => {
    try {
        const websiteId = req.query.websiteId! as unknown as string;
        const userId = req.userId;

        const data = await prismaClient.websites.findFirst({
            where: {
                id: websiteId,
                userId,
                disabled: false
            },
            include: {
                ticks: true
            }
        })

        res.json(data);
    } catch (error) {
        console.error('Error fetching website status:', error);
        res.status(500).json({ error: 'Failed to fetch website status', details: (error as Error).message });
    }
});

router.get("/websites", async (req, res): Promise<void> => {
    try {
        const userId = req.userId!;

        const websites = await prismaClient.websites.findMany({
            where: {
                userId,
                disabled: false
            },
            include: {
                ticks: true
            }
        })

        res.json({
            websites
        });
    } catch (error) {
        console.error('Error fetching websites:', error);
        res.status(500).json({ error: 'Failed to fetch websites', details: (error as Error).message });
    }
});

router.delete("/website", async (req, res): Promise<void> => {
    try {
        const websiteId = req.body.websiteId;
        const userId = req.userId!;

        if (!websiteId) {
            res.status(400).json({ error: 'Website ID is required' });
            return;
        }

        await prismaClient.websites.update({
            where: {
                id: websiteId,
                userId
            },
            data: {
                disabled: true
            }
        })

        res.json({
            message: "Deleted website successfully"
        });
    } catch (error) {
        console.error('Error deleting website:', error);
        res.status(500).json({ error: 'Failed to delete website', details: (error as Error).message });
    }
});

router.post("/payout/:validatorId", async (req, res): Promise<void> => {
    // TODO: Implement payout logic
    res.status(501).json({ error: 'Not implemented' });
});

async function main() {
    if (clerkEnabled) {
        const { clerkMiddleware } = await import("@clerk/express");
        app.use(clerkMiddleware());
    } else {
        console.warn("Clerk keys are missing. API auth is running in local dev mode.");
    }

    app.use("/api/v1", router);
    app.listen(port);
    console.log(`App started on port ${port}`);
}

main().catch((error) => {
    console.error("Failed to start API", error);
    process.exit(1);
});
