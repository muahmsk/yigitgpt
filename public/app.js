// public/app.js (DÜZENLENMİŞ - SHIFT+ENTER AKTİF)

const body = document.body;

let chats = JSON.parse(localStorage.getItem("yigitgpt_chats")) || [];
let currentChat = null;

/* THEME */
function toggleTheme() {
  const current = localStorage.getItem("theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  loadTheme();
}

function loadTheme() {
  const t = localStorage.getItem("theme") || "dark";
  body.className = t;
}

/* CHAT MANAGEMENT */
function newChat() {
  const chat = {
    id: Date.now(),
    title: "Yeni Sohbet",
    messages: [],
  };
  chats.push(chat);
  currentChat = chat.id;
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

/* SEND MESSAGE */
async function send() {
  const inputEl = document.getElementById("input");
  const text = inputEl.value.trim();
  if (!text) return;

  if (!currentChat) {
    newChat();
  }

  const chat = chats.find((c) => c.id === currentChat);
  chat.messages.push({ r: "user", t: text });

  inputEl.value = "";
  render();

  const modelSelect = document.getElementById("modelSelect");
  const model = modelSelect ? modelSelect.value : "llama-3.3-70b-versatile";

  try {
    // ✅ BACKEND İLE UYUMLU DOĞRU ENDPOINT
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, model }),
    });

    const data = await res.json();

    chat.messages.push({
      r: "bot",
      t: data.reply || "Yanıt alınamadı."
    });

    save();
    render();

  } catch (err) {
    console.error(err);

    chat.messages.push({
      r: "bot",
      t: "Sunucu hatası oluştu."
    });

    save();
    render();
  }
}

/* RENDER */
function render() {
  renderChats();
  renderMessages();
}

function renderChats() {
  const chatList = document.getElementById("chatList");
  chatList.innerHTML = "";

  chats.forEach((chat) => {
    const div = document.createElement("div");
    div.className = "chat-item";
    div.innerText = chat.title;
    div.onclick = () => {
      currentChat = chat.id;
      renderMessages();
    };
    chatList.appendChild(div);
  });
}

function renderMessages() {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  const chat = chats.find((c) => c.id === currentChat);
  if (!chat) return;

  chat.messages.forEach((m) => {
    const div = document.createElement("div");
    div.className = "message " + (m.r === "user" ? "user" : "bot");

    if (m.t && m.t.includes("```")) {
      const parts = m.t.split("```");
      const code = parts[1] || "";
      const wrapper = document.createElement("div");

      const copyBtn = document.createElement("button");
      copyBtn.className = "copy";
      copyBtn.textContent = "KOPYALA";
      copyBtn.onclick = () => navigator.clipboard.writeText(code);

      const pre = document.createElement("pre");
      const codeEl = document.createElement("code");
      codeEl.textContent = code;
      pre.appendChild(codeEl);

      wrapper.appendChild(copyBtn);
      wrapper.appendChild(pre);
      div.appendChild(wrapper);
    } else {
      div.textContent = (m.r === "user" ? "🧑 " : "🤖 ") + m.t;
    }

    messagesDiv.appendChild(div);
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/* SAVE / LOAD */
function save() {
  localStorage.setItem("yigitgpt_chats", JSON.stringify(chats));
}

/* SPEECH (TTS) */
function speak() {
  const chat = chats.find((c) => c.id === currentChat);
  if (!chat || !chat.messages.length) return;
  const last = [...chat.messages].reverse().find((m) => m.r === "bot");
  if (!last) return;

  const utter = new SpeechSynthesisUtterance(last.t);
  utter.lang = "tr-TR";
  speechSynthesis.speak(utter);
}

/* EXPORT */
function exportChat(type) {
  const chat = chats.find((c) => c.id === currentChat);
  if (!chat) return;

  let data;
  if (type === "json") {
    data = JSON.stringify(chat, null, 2);
  } else {
    data = chat.messages
      .map((m) => `${m.r.toUpperCase()}: ${m.t}`)
      .join("\n\n");
  }

  const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `yigitgpt_chat.${type}`;
  a.click();
}

/* ENTER & SHIFT+ENTER */
document.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("input");

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  loadTheme();

  if (!chats.length) {
    newChat();
  } else {
    currentChat = chats[0].id;
    render();
  }
});
