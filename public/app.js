const authBox = document.getElementById("authBox");
const app = document.getElementById("app");

/* AUTH UI */
function showRegister(){
  authTitle.innerText = "YiğitGPT Kayıt";
  password2.style.display = "block";
  authBtn.innerText = "Kayıt Ol";
  authBtn.onclick = register;
  toggleText.style.display = "none";
  backLogin.style.display = "block";
}

function showLogin(){
  authTitle.innerText = "YiğitGPT Giriş";
  password2.style.display = "none";
  authBtn.innerText = "Giriş Yap";
  authBtn.onclick = login;
  toggleText.style.display = "block";
  backLogin.style.display = "none";
}

/* REGISTER */
async function register(){
  const u = username.value.trim();
  const p = password.value.trim();
  const p2 = password2.value.trim();

  if(!u || !p || !p2) return alert("Boş alan bırakma");
  if(p !== p2) return alert("Şifreler uyuşmuyor");

  const res = await fetch("/api/register",{
    method:"POST",
    headers:{ "Content-Type":"application/json"},
    body:JSON.stringify({username:u,password:p})
  });

  const d = await res.json();
  alert(d.message);
  if(d.success) showLogin();
}

/* LOGIN */
async function login(){
  const u = username.value.trim();
  const p = password.value.trim();

  const res = await fetch("/api/login",{
    method:"POST",
    headers:{ "Content-Type":"application/json"},
    body:JSON.stringify({username:u,password:p})
  });

  const d = await res.json();
  if(!d.success) return alert(d.message);

  localStorage.setItem("user", JSON.stringify(d.user));
  openApp();
}

/* OPEN APP */
function openApp(){
  authBox.style.display="none";
  app.style.display="flex";
}

/* LOGOUT */
function logout(){
  localStorage.removeItem("user");
  location.reload();
}

/* AUTO LOGIN */
window.onload = ()=>{
  if(localStorage.getItem("user")){
    openApp();
  }
};

/* ⚠️ Chat kodların burada kalabilir (send, chat vs çalışır) */
let isRegister = false;

function toggleAuth() {
  isRegister = !isRegister;
  document.getElementById("authTitle").innerText = isRegister ? "YiğitGPT Kayıt Ol" : "YiğitGPT Giriş";
  document.getElementById("switchAuth").innerText = isRegister ? "Zaten hesabın var mı? Giriş yap" : "Hesabın yok mu? Kayıt ol";
}

function login(){
  const u = username.value;
  const p = password.value;

  if(!u || !p) return alert("Alanları doldur");

  const users = JSON.parse(localStorage.getItem("users")) || {};

  if(isRegister){
    if(users[u]) return alert("Bu kullanıcı var");
    users[u] = p;
    localStorage.setItem("users",JSON.stringify(users));
    alert("Kayıt başarılı");
    toggleAuth();
  } else {
    if(users[u] !== p) return alert("Hatalı giriş");
    localStorage.setItem("session",u);
    startApp();
  }
}

function startApp(){
  document.getElementById("authBox").style.display="none";
  document.getElementById("app").style.display="flex";
}

function logout(){
  localStorage.removeItem("session");
  location.reload();
}

window.onload = ()=>{
  const s = localStorage.getItem("session");
  if(s) startApp();
}


