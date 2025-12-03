let chats = JSON.parse(localStorage.getItem("yigitgpt_chats")) || [];
let currentChat = null;

/* ========== THEME ========== */
function toggleTheme(){
  document.body.className =
    document.body.className === "dark" ? "light" : "dark";
}

/* ========== CHAT SYSTEM ========== */

function newChat(){
  const chat = { id: Date.now(), title: "Yeni Sohbet", messages: [] };
  chats.push(chat);
  currentChat = chat.id;
  save();
  render();
}

function deleteChat(){
  chats = chats.filter(c => c.id !== currentChat);
  currentChat = chats[0]?.id || null;
  save();
  render();
}

function clearAll(){
  chats = [];
  currentChat = null;
  save();
  render();
}

/* ========== SEND MESSAGE ========== */

async function send() {
  const input = document.getElementById("input");
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  autoTitle(text);
  input.value = "";

  const loading = document.createElement("div");
  loading.className = "message bot loading";
  loading.innerHTML = "<span>.</span><span>.</span><span>.</span>";
  document.getElementById("messages").appendChild(loading);

  const model = document.getElementById("modelSelect").value;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ message:text, model })
    });

    const data = await res.json();
    loading.remove();
    addMessage("bot", data.reply || "Cevap yok", true);

  } catch {
    loading.remove();
    addMessage("bot", "Sunucu hatası.");
  }
}

/* ========== MESSAGE ========== */

function typeEffect(text, el){
  let i = 0;
  el.innerHTML = "";
 	function typing(){
 	  if(i < text.length){
 	    el.innerHTML += text[i++];
 	    setTimeout(typing, 10);
 	  }
 	}
  typing();
}

function addMessage(role, text, typing=false){
  const div = document.createElement("div");
  div.className = "message " + role;

  const rendered = marked.parse(text);

  if(typing){
    let i = 0;
    function type(){
      if(i < rendered.length){
        div.innerHTML += rendered[i++];
        setTimeout(type, 5);
      }
    }
    type();
  }else{
    div.innerHTML = rendered;
  }

  document.getElementById("messages").appendChild(div);
  document.getElementById("messages").scrollTop = 99999;

  if(!currentChat) newChat();
  const chat = chats.find(c => c.id === currentChat);
  chat.messages.push({ role, content:text });
  save();
}

/* ========== AUTO TITLE ========== */
function autoTitle(text){
  const chat = chats.find(c => c.id === currentChat);
  if(chat.title === "Yeni Sohbet"){
    chat.title = text.slice(0,20) + "...";
    save();
    render();
  }
}

/* ========== FILE UPLOAD ========== */
document.getElementById("fileInput")?.addEventListener("change", e=>{
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("input").value += "\n\n" + reader.result;
  }
  reader.readAsText(file);
});

/* ========== ENTER FIX ========== */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  input.addEventListener("keydown", e=>{
    if(e.key === "Enter" && !e.ctrlKey) e.preventDefault();
    if(e.key === "Enter" && e.ctrlKey) send();
  });

  if(!chats.length) newChat();
  else {
    currentChat = chats[0].id;
    render();
  }
});

/* ========== RENDER ========== */

function render(){
  renderChats();
}

function renderChats(){
  const list = document.getElementById("chatList");
  list.innerHTML = "";
  chats.forEach(chat=>{
    const div = document.createElement("div");
    div.className = "chat-item";
    div.textContent = chat.title;
    div.onclick = () => { currentChat = chat.id; loadChat(); };
    list.appendChild(div);
  });
}

function loadChat(){
  const msg = document.getElementById("messages");
  msg.innerHTML = "";
  const chat = chats.find(c=>c.id===currentChat);
  chat.messages.forEach(m=>{
    const div = document.createElement("div");
    div.className = "message " + m.role;
    div.innerHTML = marked.parse(m.content);
    msg.appendChild(div);
  });
}

/* ========== SAVE ========== */
function save(){
  localStorage.setItem("yigitgpt_chats", JSON.stringify(chats));
}

/* ========== SPEECH ========== */
function speak(){
  const chat = chats.find(c=>c.id===currentChat);
  const last = [...chat.messages].reverse().find(m=>m.role==="bot");
  if(!last) return;
  const ut = new SpeechSynthesisUtterance(last.content);
  ut.lang = "tr-TR";
  speechSynthesis.speak(ut);
}
