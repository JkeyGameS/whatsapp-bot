if (text.toLowerCase() === "/hello") {
    await sock.sendMessage(from, {
        text: "👋 Hello! How can I help you today?"
    });
    return;
}