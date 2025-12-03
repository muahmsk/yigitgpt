import express from "express";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// PROFİL FOTO YÜKLEME
const storage = multer.diskStorage({
  destination: (req,file,cb)=>cb(null,"uploads/"),
  filename: (req,file,cb)=>{
    const n = Date.now()+"-"+Math.round(Math.random()*1e9);
    cb(null,n+path.extname(file.originalname));
  }
});
const upload = multer({storage});

// PROFİL FOTO API
app.post("/api/upload-profile", upload.single("photo"), (req,res)=>{
  res.json({url:"/uploads/"+req.file.filename});
});

// CHAT API
app.post("/api/chat", async (req,res)=>{
  try{
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${GROQ_API_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        model:req.body.model || "llama-3.3-70b-versatile",
        messages:[{role:"user",content:req.body.message}]
      })
    });
    const d = await r.json();
    res.json({reply:d.choices[0].message.content});
  }catch(e){
    res.json({reply:"Sunucu hatası."});
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>console.log("YiğitGPT çalışıyor:",PORT));
