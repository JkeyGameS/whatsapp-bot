// -----------------------------
// Commands
// -----------------------------
if (text.toLowerCase() === "/menu") {
    await sock.sendMessage(from, {
        text: `
🤖 *WhatsApp AI Bot*

━━━━━━━━━━━━━━
📋 *Available Commands*
━━━━━━━━━━━━━━

📖 */menu*
Show this menu.

👋 */hello*
Bot says hello.

👥 *Group Commands*
/tagall
/groupinfo
/kick @user
/promote @user
/demote @user

🛡️ *Moderation*
/mute
/unmute
/lock
/unlock

🤖 *AI Commands*
/ai <question>
/summarize
/image <prompt>

⚙️ *Utilities*
/ping
/help

━━━━━━━━━━━━━━
Made with ❤️ by Jkey
        `
    });

    return;
}