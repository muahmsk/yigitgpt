// server.js (GÜÇLENDİRİLMİŞ)
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const OpenAI = require("openai");

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `
Sen YiğitGPT adında üst seviye bir yapay zekasın.
Cevapların her zaman:
- Detaylı
- Mantıklı
- Öğretici
- Net
- Hatasız
- Açıklamalı
olmalıdır.

Kurallar:
- Soruyu analiz etmeden cevap verme.
- Kısa ve boş cevaplardan kaçın.
- Kod yazarken çalışır ve temiz yaz.
- Birden fazla çözüm varsa listele.
- Türkçe konuş.
`;

app.post("/chat", async (req, res) => {
  const { message, model } = req.body;

  try {
    const response = await client.chat.completions.create({
      model: model || "mixtral-8x7b-32768",
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
    });

    res.json({ reply: response.choices[0].message.content });

  } catch (error) {
    console.error(error);
    res.json({ reply: "YiğitGPT API Hatası." });
  }
});

app.listen(port, () => {
  console.log(`✅ YiğitGPT güçlendirildi: http://localhost:${port}`);
});
