import { randomUUIDv7 } from "bun";
import type { OutgoingMessage, SignupOutgoingMessage, ValidateOutgoingMessage } from "common/types";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";

const CALLBACKS: { [callbackId: string]: (data: SignupOutgoingMessage) => void } = {};

let validatorId: string | null = null;

const hubUrl = process.env.HUB_URL || "ws://localhost:8081";

function getValidatorKeypair() {
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        throw new Error("Missing PRIVATE_KEY in .env");
    }

    return Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(privateKey))
    );
}

async function main() {
    const keypair = getValidatorKeypair();

    console.log("Connecting to hub:", hubUrl);

    const ws = new WebSocket(hubUrl);

    ws.onopen = async () => {
        console.log("✅ Connected to hub");

        const callbackId = randomUUIDv7();

        CALLBACKS[callbackId] = (data: SignupOutgoingMessage) => {
            validatorId = data.validatorId;
            console.log("✅ Registered as validator:", validatorId);
        };

        const signedMessage = await signMessage(
            `Signed message for ${callbackId}, ${keypair.publicKey.toBase58()}`,
            keypair
        );

        ws.send(JSON.stringify({
            type: 'signup',
            data: {
                callbackId,
                ip: '127.0.0.1',
                publicKey: keypair.publicKey.toBase58(), // ✅ FIXED
                signedMessage,
            },
        }));
    };

    ws.onmessage = async (event) => {
        const data: OutgoingMessage = JSON.parse(event.data);

        if (data.type === 'signup') {
            CALLBACKS[data.data.callbackId]?.(data.data);
            delete CALLBACKS[data.data.callbackId];
        }

        else if (data.type === 'validate') {
            await validateHandler(ws, data.data, keypair);
        }
    };

    ws.onclose = () => {
        console.log("❌ Disconnected from hub");
    };

    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
    };
}

async function validateHandler(
    ws: WebSocket,
    { url, callbackId, websiteId }: ValidateOutgoingMessage,
    keypair: Keypair
) {
    console.log(`🔍 Validating ${url}`);

    const startTime = Date.now();

    const signature = await signMessage(
        `Replying to ${callbackId}`,
        keypair
    );

    try {
        let formattedUrl = url;

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            formattedUrl = `https://${url}`;
        }

        const response = await fetch(formattedUrl);

        const latency = Date.now() - startTime;

        ws.send(JSON.stringify({
            type: 'validate',
            data: {
                callbackId,
                status: response.status === 200 ? 'Good' : 'Bad',
                latency,
                websiteId,
                validatorId,
                signedMessage: signature,
            },
        }));

    } catch (error) {
        console.error("❌ Validation failed:", error);

        ws.send(JSON.stringify({
            type: 'validate',
            data: {
                callbackId,
                status: 'Bad',
                latency: 1000,
                websiteId,
                validatorId,
                signedMessage: signature,
            },
        }));
    }
}

async function signMessage(message: string, keypair: Keypair) {
    const messageBytes = nacl_util.decodeUTF8(message);

    const signature = nacl.sign.detached(
        messageBytes,
        keypair.secretKey
    );

    return JSON.stringify(Array.from(signature));
}

main();