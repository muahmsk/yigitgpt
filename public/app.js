const authBox = document.getElementById("authBox");
const app = document.getElementById("app");
const input = document.getElementById("input");

// AUTH ELEMENTS
const username = document.getElementById("username");
const password = document.getElementById("password");

// ---------------- LOGIN ----------------
function login(){
  const u = username.value.trim();
  const p = password.value.trim();

  const users = JSON.parse(localStorage.getItem("users")) || {};

  if(users[u] !== p) return alert("Hatalı giriş!");

  localStorage.setItem("session", u);
  openApp();
}

// ---------------- REGISTER ----------------
function register(){
  const u = username.value.trim();
  const p = password.value.trim();

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if(users[u]) return alert("Kullanıcı zaten var!");

  users[u] = p;
  localStorage.setItem("users", JSON.stringify(users));

  alert("Kayıt başarılı, giriş yapabilirsin.");
  showLogin();
}

// ---------------- AUTH SCREEN ----------------
function showRegister(){
  document.getElementById("authTitle").innerText = "YiğitGPT Kayıt";
  document.getElementById("authBtn").innerText = "Kayıt Ol";
  document.getElementById("authBtn").onclick = register;
}

function showLogin(){
  document.getElementById("authTitle").innerText = "YiğitGPT Giriş";
  document.getElementById("authBtn").innerText = "Giriş Yap";
  document.getElementById("authBtn").onclick = login;
}

// ---------------- APP CONTROL ----------------
function openApp(){
  authBox.style.display="none";
  app.style.display="flex";
}

function logout(){
  localStorage.removeItem("session");
  location.reload();
}

// ---------------- AUTO LOGIN ----------------
window.onload = ()=>{
  const session = localStorage.getItem("session");
  if(session) openApp();
};

// ---------------- ENTER FIX ----------------
input.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});
// ---------------- CHAT SYSTEM ----------------

async function send(){
  const input = document.getElementById("input");
  const msg = input.value.trim();
  if(!msg) return;

  addMessage("user", msg);
  input.value = "";

  const loading = document.createElement("div");
  loading.className = "message bot loading";
  loading.innerHTML = "<span>.</span><span>.</span><span>.</span>";
  document.getElementById("messages").appendChild(loading);

  const model = document.getElementById("modelSelect").value;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, model })
    });

    const data = await res.json();
    loading.remove();
    addMessage("bot", data.reply || "Cevap yok");

  } catch (err) {
    loading.remove();
    addMessage("bot", "Sunucu hatası.");
  }
}


// ---------------- MESSAGE RENDER ----------------

function addMessage(role, text){
  const div = document.createElement("div");
  div.className = "message " + role;
  div.innerText = text;
  document.getElementById("messages").appendChild(div);
  document.getElementById("messages").scrollTop = 99999;
}
/* ==== SOL MENÜ FONKSİYONLARI ==== */

function newChat() {
  const messages = document.getElementById("messages");
  messages.innerHTML = "";
  addSystem("Yeni sohbet başlatıldı.");
}

function deleteChat() {
  const messages = document.getElementById("messages");
  const all = messages.querySelectorAll(".message");
  if(all.length === 0) return alert("Silinecek mesaj yok");
  all[all.length - 1].remove();
}

function clearAll() {
  const messages = document.getElementById("messages");
  messages.innerHTML = "";
}

function exportChat(type) {
  const messages = document.getElementById("messages");
  const all = [...messages.children].map(m => m.innerText);

  if(type === "txt") {
    download("chat.txt", all.join("\n\n"));
  }

  if(type === "json") {
    download("chat.json", JSON.stringify(all, null, 2));
  }
}

function download(name, content) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content]));
  a.download = name;
  a.click();
}

/* ==== SİSTEM MESAJI ==== */
function addSystem(text) {
  const messages = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = "message bot";
  div.innerText = text;
  messages.appendChild(div);
}


