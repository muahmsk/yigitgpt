import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* Middleware */
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* API KEY */
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY tanımlı değil!");
  process.exit(1);
}

/* CHAT API */
app.post("/api/chat", async (req, res) => {
  try {
    const { message, model } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Mesaj boş olamaz." });
    }

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await r.json();

    if (!data.choices || !data.choices.length) {
      return res.json({ reply: "Yanıt alınamadı." });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (err) {
    console.error("API Hatası:", err);
    res.status(500).json({ reply: "Sunucu hatası oluştu." });
  }
});

/* SERVER START */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("✅ YiğitGPT çalışıyor. Port:", PORT);
});
