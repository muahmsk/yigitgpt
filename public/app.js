/* MARKDOWN PARSER (mini) */
function md(text) {
  text = text
    .replace(/```([^`]+)```/gs, '<pre><code>$1</code></pre>')
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
  return text;
}

/* YAZMA EFEKTİ */
function typeEffect(text, element) {
  let i = 0;
  element.innerHTML = "";
  const speed = 8;

  function typing() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }
  typing();
}

/* GLOBAL */
let chats = JSON.parse(localStorage.getItem("ygpt_chats")) || [];
let currentChat = null;

/* SEND */
async function send() {
  const input = document.getElementById("input");
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";

  const model = document.getElementById("modelSelect").value;

  const loading = document.createElement("div");
  loading.className = "message bot loading";
  loading.innerHTML = "<span>.</span><span>.</span><span>.</span>";
  document.getElementById("messages").appendChild(loading);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, model }),
    });

    const data = await res.json();
    loading.remove();

    addMessage("bot", data.reply || "Cevap yok", true);

  } catch {
    loading.remove();
    addMessage("bot", "Sunucu hatası.");
  }
}

/* MESAJ EKLEME */
function addMessage(role, text, typing = false) {
  const div = document.createElement("div");
  div.className = `message ${role}`;

  if (typing) {
    div.innerHTML = "";
    document.getElementById("messages").appendChild(div);
    typeEffect(md(text), div);
  } else {
    div.innerHTML = md(text);
    document.getElementById("messages").appendChild(div);
  }

  document.getElementById("messages").scrollTop = 999999;
}

/* CHAT MANAGEMENT */
function newChat() {
  const title = "Sohbet " + (chats.length + 1);
  chats.push({ id: Date.now(), title, messages: [] });
  currentChat = chats[chats.length - 1].id;
  save();
  render();
}

function deleteChat() {
  if (!currentChat) return;
  chats = chats.filter((c) => c.id !== currentChat);
  currentChat = chats[0] ? chats[0].id : null;
  save();
  render();
}

function clearAll() {
  if (!confirm("Tüm sohbetler silinsin mi?")) return;
  chats = [];
  currentChat = null;
  save();
  render();
}

function exportChat(type) {
  const chat = chats.find((c) => c.id === currentChat);
  if (!chat) return;

  const data =
    type === "json"
      ? JSON.stringify(chat, null, 2)
      : chat.messages.map((m) => `${m.role}: ${m.text}`).join("\n\n");

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data]));
  a.download = "chat." + type;
  a.click();
}

function save() {
  localStorage.setItem("ygpt_chats", JSON.stringify(chats));
}

function render() {
  renderChats();
  renderMessages();
}

function renderChats() {
  const list = document.getElementById("chatList");
  list.innerHTML = "";
  chats.forEach((chat) => {
    const div = document.createElement("div");
    div.className = "chat-item";
    div.innerText = chat.title;
    div.onclick = () => {
      currentChat = chat.id;
      render();
    };
    list.appendChild(div);
  });
}

function renderMessages() {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  const chat = chats.find((c) => c.id === currentChat);
  if (!chat) return;

  chat.messages.forEach((m) => {
    addMessage(m.role, m.text);
  });
}

/* ENTER & SHIFT+ENTER */
document.getElementById("input").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

/* THEME */
function toggleTheme() {
  const body = document.body;
  body.className = body.className === "dark" ? "light" : "dark";
  localStorage.setItem("theme", body.className);
}

/* LOAD */
window.onload = () => {
  const t = localStorage.getItem("theme");
  if (t) document.body.className = t;

  if (!chats.length) newChat();
  else {
    currentChat = chats[0].id;
    render();
  }
};
