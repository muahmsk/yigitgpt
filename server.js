import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 10000;

// ✅ USERS DATABASE
const usersFile = "./users.json";
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, "[]");

// ✅ FILE UPLOAD (profil foto)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ REGISTER
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  let users = JSON.parse(fs.readFileSync(usersFile));

  if (users.find(u => u.username === username))
    return res.json({ error: "Bu kullanıcı var" });

  const user = { id: Date.now(), username, password, photo: "/default.png" };
  users.push(user);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.json({ success: true });
});

// ✅ LOGIN
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  let users = JSON.parse(fs.readFileSync(usersFile));

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.json({ error: "Hatalı giriş" });

  res.json(user);
});

// ✅ PROFIL FOTO UPLOAD
app.post("/api/upload-profile", upload.single("photo"), (req,res)=>{
  const users = JSON.parse(fs.readFileSync(usersFile));
  const { userId } = req.body;

  const user = users.find(u=>u.id==userId);
  if(!user) return res.json({error:"User yok"});

  user.photo = "/uploads/" + req.file.filename;

  fs.writeFileSync(usersFile, JSON.stringify(users,null,2));
  res.json({url:user.photo});
});

// ✅ CHAT API (fetch artık node'da direkt var, node-fetch KULLANMIYORUZ)
app.post("/api/chat", async (req,res)=>{
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method:"POST",
    headers:{
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      model:req.body.model || "llama-3.3-70b-versatile",
      messages:[{role:"user", content:req.body.message}]
    })
  });

  const data = await response.json();
  res.json({ reply: data.choices[0].message.content });
});

app.listen(PORT, ()=>console.log("YiğitGPT çalışıyor:", PORT));
