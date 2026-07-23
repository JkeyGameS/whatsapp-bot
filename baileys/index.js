const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const express = require("express");

// -----------------------------
// Express server (required for Render Web Service)
// -----------------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("✅ WhatsApp Bot is running!");
});

app.get("/health", (req, res) => {
    res.json({
        status: "online",
        service: "WhatsApp Bot"
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
});

// -----------------------------
// WhatsApp Bot
// -----------------------------
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    // Save authentication whenever it changes
    sock.ev.on("creds.update", saveCreds);

    // Connection events
    sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {

        if (qr) {
            console.log("📱 Scan this QR code with WhatsApp:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("✅ WhatsApp Connected!");
        }

        if (connection === "close") {
            console.log("❌ Connection closed.");

            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log("🔄 Reconnecting...");
                setTimeout(startBot, 5000);
            } else {
                console.log("🚪 Logged out. Scan the QR code again.");
            }
        }
    });

    // Incoming messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const msg = messages[0];

            if (!msg || !msg.message) return;

            const from = msg.key.remoteJid;

            // Ignore messages sent by the bot
            if (msg.key.fromMe) return;

            // Ignore WhatsApp Status updates
            if (from === "status@broadcast") return;

            // Extract text
            const text =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                "";

            if (!text) return;

            console.log(`📩 Message from ${from}: ${text}`);

            // Reply
            await sock.sendMessage(from, {
                text: `Hello! You said: "${text}"`
            });

        } catch (err) {
            console.error("❌ Error handling message:", err);
        }
    });
}

// Start the bot
startBot().catch(console.error);

// Prevent crashes
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
});