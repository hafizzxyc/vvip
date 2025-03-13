const { whatsappClient } = require("../server");

export default function handler(req, res) {
    if (whatsappClient && whatsappClient.user) {
        res.json({ success: true, status: "connected", user: whatsappClient.user });
    } else {
        res.json({ success: false, status: "disconnected" });
    }
}
