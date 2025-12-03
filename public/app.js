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
