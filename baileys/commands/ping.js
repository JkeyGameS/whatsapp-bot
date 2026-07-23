if (text.toLowerCase() === "/ping") {
    await sock.sendMessage(from, {
        text: "🏓 Pong! Bot is online."
    });
    return;
}