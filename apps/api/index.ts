import "dotenv/config";
import express from "express"
import { authMiddleware } from "./middleware";
import { prismaClient } from "db/client";
import cors from "cors";
import { Transaction, SystemProgram, Connection } from "@solana/web3.js";
import { clerkMiddleware } from "@clerk/express";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.post("/api/v1/website", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId!;
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
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
        })
    } catch (error) {
        console.error('Error creating website:', error);
        res.status(500).json({ error: 'Failed to create website', details: (error as Error).message });
    }
})

app.get("/api/v1/website/status", authMiddleware, async (req, res) => {
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

    res.json(data)

})

app.get("/api/v1/websites", authMiddleware, async (req, res) => {
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
    })
})

app.delete("/api/v1/website/", authMiddleware, async (req, res) => {
    const websiteId = req.body.websiteId;
    const userId = req.userId!;

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
    })
})

app.post("/api/v1/payout/:validatorId", async (req, res) => {
   
})

app.listen(8080);

console.log("App started");