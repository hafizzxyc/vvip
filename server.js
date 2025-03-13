const fs = require("fs");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");

let whatsappClient = null;
let connectedNumber = null;

// Fungsi untuk memulai koneksi bot
async function startBot() {
    console.log("🔄 Memulai bot...");
    const { state, saveCreds } = await useMultiFileAuthState("sessionserver");

    whatsappClient = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state,
        printQRInTerminal: false,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    whatsappClient.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
            console.log("✅ Bot berhasil terhubung!");
            if (whatsappClient.user?.id) {
                connectedNumber = whatsappClient.user.id.split(":")[0] + "@s.whatsapp.net";
                console.log(`📲 Nomor yang terhubung: ${connectedNumber}`);
            }
        }
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(`❌ Koneksi ditutup. Alasan: ${reason}`);

            if (reason === DisconnectReason.badSession) {
                console.log("⚠️ Sesi tidak valid. Menghapus sesi dan mencoba ulang...");
                fs.rmSync("sessionserver", { recursive: true, force: true });
                return startBot();
            } else {
                console.log("🔄 Mencoba ulang koneksi...");
                startBot();
            }
        }
    });

    whatsappClient.ev.on("creds.update", saveCreds);
}

// Jalankan bot hanya sekali saat API pertama kali dipanggil
if (!global.botStarted) {
    global.botStarted = true;
    startBot();
}

// Ekspor WhatsApp client untuk digunakan di API Vercel
module.exports = { whatsappClient, startBot };
