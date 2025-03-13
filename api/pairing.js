const { whatsappClient } = require("../server");

export default async function handler(req, res) {
    try {
        if (!whatsappClient) {
            return res.status(500).json({ success: false, message: "Bot belum siap. Tunggu beberapa saat." });
        }

        const phoneNumber = req.query.number;
        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: "Nomor WA harus disertakan dalam parameter ?number=62xxxx" });
        }

        let code = await whatsappClient.requestPairingCode(phoneNumber);
        code = code?.match(/.{1,4}/g)?.join("-") || code;

        console.log(`📌 Pairing Code untuk ${phoneNumber}: ${code}`);
        res.json({ success: true, pairing_code: code });
    } catch (error) {
        console.error("❌ Gagal mendapatkan pairing code:", error.message);
        res.status(500).json({ success: false, message: "Gagal mendapatkan pairing code" });
    }
}
