const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {

        if (qr) {
            console.log("📱 Scan this QR code with WhatsApp:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("✅ WhatsApp Connected!");
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log("❌ Connection closed.");

            if (shouldReconnect) {
                console.log("🔄 Reconnecting...");
                startBot();
            }
        }
    });

    // Message handler - added here inside startBot()
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];

        if (!msg.message) return;

        const from = msg.key.remoteJid;

        // Ignore messages sent by the bot itself
        if (msg.key.fromMe) return;

        // Get the message text
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

        console.log(`📩 Message from ${from}: ${text}`);

        // Simple auto-reply
        await sock.sendMessage(from, {
            text: `Hello! You said: "${text}"`
        });
    });
}

startBot();