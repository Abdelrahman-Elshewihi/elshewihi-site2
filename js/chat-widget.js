/* =====================================================
   AI CHAT WIDGET — واجهة الشات بوت
   الملف ده مسؤول بس عن: فتح/قفل نافذة الشات، إرسال سؤال الزائر
   لـ /api/chat، وعرض الرد. أي "ذكاء" أو معلومات عن عبدالرحمن
   مش موجودة هنا خالص — دي في data/profile.json و api/chat.js.

   ملحوظة: الملف ده متعمّد يكون منفصل عن main.js عشان لو حبيت
   يوم تشيل فيتشر الشات بالكامل، تمسح السطر بتاعه من index.html بس
   (وده الوحيد اللي بيستدعي main.js) من غير ما تلمس باقي الموقع.
===================================================== */

// نصوص الواجهة (عربي/إنجليزي) — مستقلة عن I18N بتاع main.js عمدًا
const CHAT_TEXT = {
  ar: {
    title: "اسأل عن عبدالرحمن",
    sub: "بيرد الذكاء الاصطناعي — متاح 24 ساعة",
    placeholder: "اكتب سؤالك هنا...",
    greeting: "أهلاً! أنا مساعد ذكاء اصطناعي هنا عشان أجاوبك على أي سؤال عن عبدالرحمن، شغله، وأسعاره. اسأل براحتك 👋",
    error: "حصلت مشكلة، حاول تاني كمان شوية."
  },
  en: {
    title: "Ask about Abdelrahman",
    sub: "AI-powered — available 24/7",
    placeholder: "Type your question...",
    greeting: "Hi! I'm an AI assistant here to answer any question about Abdelrahman, his work, and pricing. Feel free to ask 👋",
    error: "Something went wrong, please try again shortly."
  }
};

// بيرجع "ar" أو "en" حسب لغة الموقع الحالية (اللي main.js بيظبطها على html.lang)
function currentChatLang() {
  return document.documentElement.lang === "en" ? "en" : "ar";
}

// بيحتفظ بآخر رسايل المحادثة عشان نبعتها مع كل سؤال جديد (context)
let chatHistory = [];
let chatStarted = false;

function buildChatWidget() {
  const fab = document.createElement("button");
  fab.className = "chat-fab";
  fab.id = "chatFab";
  fab.setAttribute("aria-label", "Chat");
  fab.innerHTML = `
    <svg class="chat-fab-chat" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16v12H7l-3 3V4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
    <svg class="chat-fab-close" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

  const panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.id = "chatPanel";
  panel.innerHTML = `
    <div class="chat-header">
      <div>
        <div class="chat-header-title" id="chatTitle"></div>
        <div class="chat-header-sub" id="chatSub"></div>
      </div>
    </div>
    <div class="chat-body" id="chatBody"></div>
    <div class="chat-input-row">
      <input type="text" id="chatInput" autocomplete="off">
      <button id="chatSend" aria-label="Send">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>`;

  document.body.append(fab, panel);
  return { fab, panel };
}

function addMessage(body, role, text) {
  const msg = document.createElement("div");
  msg.className = `chat-msg ${role}`;
  msg.textContent = text;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
  return msg;
}

function showTyping(body) {
  const typing = document.createElement("div");
  typing.className = "chat-msg bot typing";
  typing.innerHTML = "<i></i><i></i><i></i>";
  body.appendChild(typing);
  body.scrollTop = body.scrollHeight;
  return typing;
}

async function sendMessage(body, input, sendBtn) {
  const text = input.value.trim();
  if (!text) return;

  const lang = currentChatLang();
  addMessage(body, "user", text);
  input.value = "";
  input.disabled = true;
  sendBtn.disabled = true;

  const typing = showTyping(body);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: chatHistory })
    });
    const data = await res.json();
    typing.remove();

    if (!res.ok || !data.reply) throw new Error(data.error || "chat_failed");

    addMessage(body, "bot", data.reply);
    // بنسجل آخر رسالتين (سؤال + رد) في التاريخ عشان الموديل يفتكر سياق المحادثة
    chatHistory.push({ role: "user", content: text });
    chatHistory.push({ role: "assistant", content: data.reply });
  } catch (err) {
    typing.remove();
    addMessage(body, "bot", CHAT_TEXT[lang].error);
  } finally {
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

function initChatWidget() {
  const { fab, panel } = buildChatWidget();
  const body = panel.querySelector("#chatBody");
  const input = panel.querySelector("#chatInput");
  const sendBtn = panel.querySelector("#chatSend");

  function refreshTexts() {
    const lang = currentChatLang();
    panel.querySelector("#chatTitle").textContent = CHAT_TEXT[lang].title;
    panel.querySelector("#chatSub").textContent = CHAT_TEXT[lang].sub;
    input.placeholder = CHAT_TEXT[lang].placeholder;
  }
  refreshTexts();

  fab.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("open");
    fab.classList.toggle("open", isOpen);
    refreshTexts(); // تحديث النصوص لو المستخدم غيّر اللغة قبل ما يفتح الشات
    if (isOpen) {
      if (!chatStarted) {
        addMessage(body, "bot", CHAT_TEXT[currentChatLang()].greeting);
        chatStarted = true;
      }
      input.focus();
    }
  });

  sendBtn.addEventListener("click", () => sendMessage(body, input, sendBtn));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage(body, input, sendBtn);
  });
}

document.addEventListener("DOMContentLoaded", initChatWidget);
