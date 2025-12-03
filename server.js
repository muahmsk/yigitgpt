import express from "express";
import path from "path";
import multer from "multer";
import fetch from "node-fetch";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const USERS_FILE = "./users.json";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// users.json yoksa oluştur
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "{}");

// FOTO YÜKLEME
const storage = multer.diskStorage({
  destination: (req,file,cb)=>cb(null,"uploads/"),
  filename:(req,file,cb)=>{
    const name = Date.now()+"-"+file.originalname;
    cb(null,name);
  }
});
const upload = multer({storage});

// KAYIT
app.post("/api/register", (req,res)=>{
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));

  if (users[username]) return res.json({error:"Bu kullanıcı var"});

  users[username] = {
    password,
    photo:"/default.png"
  };

  fs.writeFileSync(USERS_FILE,JSON.stringify(users,null,2));
  res.json({ok:true});
});

// GİRİŞ
app.post("/api/login", (req,res)=>{
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));

  if (!users[username] || users[username].password !== password)
    return res.json({error:"Hatalı giriş"});

  res.json({
    ok:true,
    username,
    photo:users[username].photo
  });
});

// PROFİL FOTO
app.post("/api/upload-profile", upload.single("photo"), (req,res)=>{
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const username = req.body.username;

  users[username].photo = "/uploads/" + req.file.filename;
  fs.writeFileSync(USERS_FILE,JSON.stringify(users,null,2));

  res.json({url:users[username].photo});
});

// CHAT
app.post("/api/chat", async (req,res)=>{
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions",{
    method:"POST",
    headers:{
      "Authorization":`Bearer ${GROQ_API_KEY}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      model:req.body.model,
      messages:[{role:"user",content:req.body.message}]
    })
  });
  const d = await r.json();
  res.json({reply:d.choices[0].message.content});
});

const PORT = process.env.PORT || 10000;
app.listen(PORT,()=>console.log("YiğitGPT başladı:",PORT));
