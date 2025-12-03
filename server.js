import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const USERS_FILE = "./users.json";
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");

const readUsers = () => JSON.parse(fs.readFileSync(USERS_FILE));
const saveUsers = (u) => fs.writeFileSync(USERS_FILE, JSON.stringify(u,null,2));

/* REGISTER */
app.post("/api/register",(req,res)=>{
  const {username,password} = req.body;
  let users = readUsers();

  if(users.find(u=>u.username===username))
    return res.json({success:false,message:"Kullanıcı var"});

  users.push({username,password,photo:"/default.png"});
  saveUsers(users);
  res.json({success:true,message:"Kayıt başarılı"});
});

/* LOGIN */
app.post("/api/login",(req,res)=>{
  const {username,password} = req.body;
  let users = readUsers();

  const user = users.find(u => u.username===username && u.password===password);
  if(!user) return res.json({success:false,message:"Hatalı giriş"});

  res.json({success:true,user});
});

/* CHAT */
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post("/api/chat", async (req,res)=>{
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
});

const PORT = process.env.PORT || 10000;
app.listen(PORT,()=>console.log("YiğitGPT çalışıyor:",PORT));
