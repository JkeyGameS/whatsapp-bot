const command = text.trim().toLowerCase();
const isGroup = from.endsWith("@g.us");

// Your WhatsApp number (no +, no spaces)
const OWNER_NUMBER = "233XXXXXXXXX";

// Who sent the message?
const sender = isGroup ? msg.key.participant : msg.key.remoteJid;

// Is it you?
const isOwner = sender.startsWith(OWNER_NUMBER);

if (command === "/menu") {

    // In a group, only allow owner or admins
    if (isGroup) {
        const metadata = await sock.groupMetadata(from);

        const isAdmin = metadata.participants.some(
            p =>
                p.id === sender &&
                (p.admin === "admin" || p.admin === "superadmin")
        );

        if (!isOwner && !isAdmin) {
            return; // Ignore silently
        }
    }

    // In a private chat, only allow you
    if (!isGroup && !isOwner) {
        return;
    }

    await sock.sendMessage(from, {
        text: `🤖 *WhatsApp Bot*

📋 Available Commands

/menu
/ping
/hello

More commands coming soon!`
    });

    return;
}