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

