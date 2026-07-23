const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const express = require("express");

// =============================
// EXPRESS SERVER (Render)
// =============================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("✅ WhatsApp Bot is running!");
});

app.get("/health", (req, res) => {
    res.json({
        status: "online"
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
});

// =============================
// OWNER NUMBER
// =============================
const OWNER_NUMBER = "2250555584775";

// =============================
// START BOT
// =============================
async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("./auth");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {

        if (qr) {
            console.log("📱 Scan this QR Code:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("✅ WhatsApp Connected!");
        }

        if (connection === "close") {

            console.log("❌ Connection Closed");

            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log("🔄 Reconnecting...");
                setTimeout(startBot, 5000);
            } else {
                console.log("🚪 Logged out.");
            }
        }
    });

    // =============================
    // INCOMING MESSAGES
    // =============================
    sock.ev.on("messages.upsert", async ({ messages }) => {

        try {

            const msg = messages[0];

            if (!msg || !msg.message) return;

            if (msg.key.fromMe) return;

            const from = msg.key.remoteJid;

            if (from === "status@broadcast") return;

            const text =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                "";

            if (!text) return;

            const command = text.trim().toLowerCase();

            const isGroup = from.endsWith("@g.us");

            const sender = isGroup
                ? msg.key.participant
                : msg.key.remoteJid;

            const isOwner = sender.startsWith(OWNER_NUMBER);

            console.log(`📩 ${sender}: ${text}`);

            // =============================
            // MENU
            // =============================
            if (command === "/menu") {

                if (isGroup) {

                    const metadata = await sock.groupMetadata(from);

                    const isAdmin = metadata.participants.some(
                        p =>
                            p.id === sender &&
                            (p.admin === "admin" ||
                                p.admin === "superadmin")
                    );

                    if (!isOwner && !isAdmin)
                        return;

                } else {

                    if (!isOwner)
                        return;

                }

                await sock.sendMessage(from, {
                    text: `🤖 *WhatsApp Bot*

📋 *Available Commands*

👋 /hello

🏓 /ping

📖 /menu

━━━━━━━━━━━━━━━

👥 Group Commands

/tagall
/groupinfo
/kick
/promote
/demote

━━━━━━━━━━━━━━━

More features coming soon 🚀`
                });

                return;
            }

            // =============================
            // PING
            // =============================
            if (command === "/ping") {

                await sock.sendMessage(from, {
                    text: "🏓 Pong!"
                });

                return;
            }

            // =============================
            // HELLO
            // =============================
            if (command === "/hello") {

                await sock.sendMessage(from, {
                    text: "👋 Hello!"
                });

                return;
            }

            // =============================
            // UNKNOWN COMMAND
            // =============================
            if (command.startsWith("/")) {
                return;
            }

            // =============================
            // GREETINGS
            // =============================
            const greetings = [
                "hi",
                "hello",
                "hey",
                "good morning",
                "good afternoon",
                "good evening",
                "how are you",
                "yo"
            ];

            if (greetings.includes(command)) {

                await sock.sendMessage(from, {
                    text: "👋 Hello! Type /menu to see available commands."
                });

                return;
            }

            // Ignore every other message

        } catch (err) {

            console.error(err);

        }

    });

}

startBot().catch(console.error);

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);