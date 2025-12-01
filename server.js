import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error("GROQ_API_KEY yok!");
  process.exit(1);
}

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const model = req.body.model || "llama-3.3-70b-versatile";

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(500).json(data);

    res.json({ reply: data.choices[0].message.content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Backend hata verdi" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("YiğitGPT çalışıyor. Port:", PORT));
