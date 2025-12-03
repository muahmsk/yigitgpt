function typeEffect(text, element) {
  let i = 0;
  element.textContent = "";
  const speed = 15;

  function typing() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }
  typing();
}

async function send() {
  const input = document.getElementById("input");
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";

  const loading = document.createElement("div");
  loading.className = "message bot loading";
  loading.innerHTML = "<span>.</span><span>.</span><span>.</span>";
  document.getElementById("messages").appendChild(loading);

  const model = document.getElementById("modelSelect").value;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ message: text, model })
    });

    const data = await res.json();
    loading.remove();
    addMessage("bot", data.reply || "Cevap yok", true);

  } catch {
    loading.remove();
    addMessage("bot", "Sunucu hatası.");
  }
}

function addMessage(role, text, typing=false) {
  const div = document.createElement("div");
  div.className = "message " + role;
  document.getElementById("messages").appendChild(div);

  if (typing) {
    typeEffect(text, div);
  } else {
    div.textContent = (role === "user" ? "🧑 " : "🤖 ") + text;
  }

  document.getElementById("messages").scrollTop = 99999;
}

function toggleTheme(){
  const body = document.body;
  body.className = body.className === "dark" ? "light" : "dark";
}
