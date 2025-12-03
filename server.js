import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// CHAT API
app.post("/api/chat", async (req, res) => {
  try {
    const { message, model } = req.body;

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await r.json();
    if (!data.choices) {
      console.log(data);
      return res.json({ reply: "API'den geçersiz cevap geldi." });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (err) {
    console.error(err);
    res.json({ reply: "Sunucu hatası." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("YiğitGPT çalışıyor:", PORT));
