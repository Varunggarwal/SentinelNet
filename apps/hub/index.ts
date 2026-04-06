import { randomUUIDv7, type ServerWebSocket } from "bun";
import type { IncomingMessage, SignupIncomingMessage } from "common/types";
import { prismaClient } from "db/client";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";

const availableValidators: {
  validatorId: string;
  socket: ServerWebSocket<unknown>;
  publicKey: string;
}[] = [];

const CALLBACKS: { [callbackId: string]: (data: IncomingMessage) => void } = {};

const COST_PER_VALIDATION = 100;
const port = Number(process.env.PORT || process.env.HUB_PORT || 8081);

Bun.serve({
  port,

  fetch(req, server) {
    // 🔥 CRITICAL: upgrade FIRST (before URL parsing)
    if (server.upgrade(req)) {
      return;
    }

    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response("Hub is running");
    }

    if (url.pathname === "/health") {
      return new Response("ok");
    }

    return new Response("Not found", { status: 404 });
  },

  websocket: {
    async open(ws) {
      console.log("✅ Validator connected");
    },

    async message(ws: ServerWebSocket<unknown>, message: string) {
      let data: IncomingMessage;
      try {
        data = JSON.parse(message);
      } catch {
        console.log("❌ Invalid WebSocket message (not JSON)");
        return;
      }

      if (data.type === "signup") {
        const verified = await verifyMessage(
          `Signed message for ${data.data.callbackId}, ${data.data.publicKey}`,
          data.data.publicKey,
          data.data.signedMessage
        );

        if (!verified) {
          console.log("❌ Invalid signup signature");
          return;
        }

        await signupHandler(ws, data.data);
      }

      else if (data.type === "validate") {
        CALLBACKS[data.data.callbackId]?.(data);
        delete CALLBACKS[data.data.callbackId];
      }
    },

    async close(ws) {
      console.log("⚠️ Validator disconnected");

      const index = availableValidators.findIndex(v => v.socket === ws);
      if (index !== -1) {
        availableValidators.splice(index, 1);
      }
    },
  },
});

console.log(`🚀 Hub started on port ${port}`);

async function signupHandler(
  ws: ServerWebSocket<unknown>,
  { ip, publicKey, callbackId }: SignupIncomingMessage
) {
  let validatorDb = await prismaClient.validator.findFirst({
    where: { publicKey },
  });

  if (!validatorDb) {
    validatorDb = await prismaClient.validator.create({
      data: {
        ip,
        publicKey,
        location: "unknown",
      },
    });
  }

  ws.send(JSON.stringify({
    type: "signup",
    data: {
      validatorId: validatorDb.id,
      callbackId,
    },
  }));

  const existing = availableValidators.findIndex((v) => v.socket === ws);
  if (existing !== -1) {
    availableValidators.splice(existing, 1);
  }

  availableValidators.push({
    validatorId: validatorDb.id,
    socket: ws,
    publicKey: validatorDb.publicKey,
  });

  console.log(`✅ Validator registered: ${validatorDb.id}`);
}

async function verifyMessage(
  message: string,
  publicKey: string,
  signature: string
) {
  try {
    const messageBytes = nacl_util.decodeUTF8(message);

    return nacl.sign.detached.verify(
      messageBytes,
      new Uint8Array(JSON.parse(signature)),
      new PublicKey(publicKey).toBytes()
    );
  } catch {
    return false;
  }
}

let validationCycleRunning = false;

setInterval(async () => {
  if (validationCycleRunning) {
    console.log("⏭️ Skipping validation cycle (previous run still in progress)");
    return;
  }
  validationCycleRunning = true;

  try {
    console.log("🔁 Running validation cycle");
    console.log("Validators connected:", availableValidators.length);

    if (availableValidators.length === 0) return;

    const websitesToMonitor = await prismaClient.websites.findMany({
      where: { disabled: false },
    });

    for (const website of websitesToMonitor) {
      for (const validator of availableValidators) {
        const callbackId = randomUUIDv7();

        console.log(`➡️ Sending validate to ${validator.validatorId}: ${website.url}`);

        try {
          validator.socket.send(JSON.stringify({
            type: "validate",
            data: {
              url: website.url,
              callbackId,
              websiteId: website.id,
            },
          }));
        } catch (err) {
          console.log("❌ Failed to send validate (socket closed?)", err);
          continue;
        }

        CALLBACKS[callbackId] = async (data: IncomingMessage) => {
          if (data.type !== "validate") return;

          const { status, latency, signedMessage } = data.data;

          const verified = await verifyMessage(
            `Replying to ${callbackId}`,
            validator.publicKey,
            signedMessage
          );

          if (!verified) {
            console.log("❌ Invalid validation signature");
            return;
          }

          await prismaClient.$transaction(async (tx) => {
            await tx.websiteTick.create({
              data: {
                websiteId: website.id,
                validatorId: validator.validatorId,
                status,
                latency,
                createdAt: new Date(),
              },
            });

            await tx.validator.update({
              where: { id: validator.validatorId },
              data: {
                pendingPayouts: { increment: COST_PER_VALIDATION },
              },
            });
          });

          console.log(`✅ Stored result from ${validator.validatorId}`);
        };
      }
    }
  } finally {
    validationCycleRunning = false;
  }
}, 60 * 1000);
