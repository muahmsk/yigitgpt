const authBox = document.getElementById("authBox");
const app = document.getElementById("app");

function login(){
  const u=username.value.trim(), p=password.value.trim();
  if(!u||!p) return alert("Boş olmaz");
  localStorage.setItem("user",u);
  authBox.style.display="none"; app.style.display="flex";
}
function logout(){localStorage.clear();location.reload();}
if(localStorage.getItem("user")){
  authBox.style.display="none"; app.style.display="flex";
}

// PROFİL FOTO
async function uploadPhoto(){
  const f=uploadInput.files[0];
  const fd=new FormData();
  fd.append("photo",f);
  const r=await fetch("/api/upload-profile",{method:"POST",body:fd});
  const d=await r.json();
  profileImg.src=d.url; localStorage.setItem("avatar",d.url);
}
if(localStorage.getItem("avatar")) profileImg.src=localStorage.getItem("avatar");

// MARKDOWN
function md(t){
 return t.replace(/```([\s\S]*?)```/g,"<pre><code>$1</code></pre>")
 .replace(/\*\*(.*?)\*\*/g,"<b>$1</b>").replace(/\n/g,"<br>");
}

// CHAT
let chats=JSON.parse(localStorage.getItem("chats"))||[], current=null;
function save(){localStorage.setItem("chats",JSON.stringify(chats));}
function newChat(){
 const title="Sohbet "+(chats.length+1);
 chats.push({id:Date.now(),title,messages:[]});
 current=chats[chats.length-1].id; save(); render();
}
function deleteChat(){chats=chats.filter(c=>c.id!==current);current=chats[0]?.id;save();render();}
function clearAll(){chats=[];current=null;save();render();}

async function send(){
 const t=input.value.trim(); if(!t) return;
 addMsg("user",t);
 input.value="";

 const load=document.createElement("div");
 load.className="message bot loading";
 load.innerHTML="<span>.</span><span>.</span><span>.</span>";
 messages.appendChild(load);

 const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
 body:JSON.stringify({message:t,model:modelSelect.value})});
 const d=await r.json();
 load.remove();
 addMsg("bot",d.reply,true);
}

function addMsg(role,text,type=false){
 let chat=chats.find(c=>c.id===current);
 if(!chat) return;
 chat.messages.push({role,text});
 save();
 
 const div=document.createElement("div");
 div.className="message "+role;
 messages.appendChild(div);

 if(type) typeEffect(md(text),div);
 else div.innerHTML=md(text);

 messages.scrollTop=99999;
}

function typeEffect(txt,el){
 let i=0; el.innerHTML="";
 function w(){
  if(i<txt.length){el.innerHTML+=txt[i++];setTimeout(w,8);}
 } w();
}

function render(){
 chatList.innerHTML="";
 chats.forEach(c=>{
  const d=document.createElement("div");
  d.className="chat-item";d.innerText=c.title;
  d.onclick=()=>{current=c.id;loadMsgs()};
  chatList.appendChild(d);
 });
 loadMsgs();
}

function loadMsgs(){
 messages.innerHTML="";
 const c=chats.find(c=>c.id===current);
 if(!c) return;
 c.messages.forEach(m=>addPreview(m.role,m.text));
}

function addPreview(role,text){
 const div=document.createElement("div");
 div.className="message "+role;
 div.innerHTML=md(text);
 messages.appendChild(div);
}

// ENTER
input.addEventListener("keydown",e=>{
 if(e.key==="Enter"&&!e.shiftKey){
  e.preventDefault();send();
 }
});

// TEMA
function toggleTheme(){
 document.body.className = document.body.className==="dark"?"light":"dark";
 localStorage.setItem("theme",document.body.className);
}
if(localStorage.getItem("theme")) document.body.className=localStorage.getItem("theme");

// TTS
function speak(){
 const c=chats.find(c=>c.id===current);
 if(!c) return;
 const m=[...c.messages].reverse().find(m=>m.role=="bot");
 if(!m) return;
 const u=new SpeechSynthesisUtterance(m.text);
 speechSynthesis.speak(u);
}

// EXPORT
function exportChat(type){
 const c=chats.find(c=>c.id===current);
 let d= type=="json"?JSON.stringify(c,0,2):c.messages.map(m=>m.role+": "+m.text).join("\n");
 const a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([d]));a.download="chat."+type;a.click();
}

if(!chats.length) newChat(); else{current=chats[0].id;render();}
// ✅ AUTH
async function login(){
  const u = username.value;
  const p = password.value;

  const r = await fetch("/api/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({username:u,password:p})
  });

  const d = await r.json();
  if(d.error) return alert(d.error);

  localStorage.setItem("user", JSON.stringify(d));
  location.reload();
}

async function uploadPhoto(){
  const file = uploadInput.files[0];
  const user = JSON.parse(localStorage.getItem("user"));

  const f = new FormData();
  f.append("photo", file);
  f.append("userId", user.id);

  const r = await fetch("/api/upload-profile",{method:"POST",body:f});
  const d = await r.json();

  user.photo = d.url;
  localStorage.setItem("user", JSON.stringify(user));
  profileImg.src = d.url;
}

function logout(){
  localStorage.removeItem("user");
  location.reload();
}

// ✅ LOGIN CHECK
window.onload = ()=>{
  const user = JSON.parse(localStorage.getItem("user"));
  if(user){
    authBox.style.display="none";
    profileImg.src = user.photo;
  }else{
    document.getElementById("app").style.display="none";
  }
}
