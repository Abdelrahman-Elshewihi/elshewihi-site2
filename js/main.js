/* =====================================================
   DATA
   كل محتوى المشاريع موجود في data/projects.json — مش هنا.
   عشان تضيف مشروع جديد، افتح data/projects.json بس ومتلمسش الملف ده.

   شكل كل مشروع في projects.json:
   {
     "id": "معرّف فريد بالإنجليزي",
     "featured": true/false          -> true = كارت كبير في الأول
     "image": "images/xxx.jpg"       -> اختياري لو فيه "video"
     "video": "كود يوتيوب فقط"        -> اختياري، لو موجود بيشغل فيديو بدل الصورة
     "videoVertical": true/false     -> true لو الفيديو Shorts (عمودي)
     "tags": ["logo","card","website","video","app","voice"]  -> يحدد تحت أي فلتر يظهر
     "category": {"ar":"..","en":".."},
     "title":    {"ar":"..","en":".."},
     "desc":     {"ar":"..","en":".."},
     "problem":  {"ar":"..","en":".."},
     "did":      {"ar":"..","en":".."},
     "tech": ["اسم أداة 1","اسم أداة 2"],
     "price": {"value":"100","currency":"USD"}
   }
===================================================== */
let PROJECTS = [];
let CURRENT_FILTER = "all"; // "all" أو أي كلمة من الـ tags (logo/card/website/video/app/voice)

/* =====================================================
   PROMO — إعدادات العرض/الخصم
   ده المكان الوحيد اللي محتاج تعدل فيه عشان تشغّل/توقف أي عرض مستقبلي.

   active   -> true يشغّل العرض على كل المشاريع اللي ليها سعر رقمي، false يوقفه فوراً
   percent  -> نسبة الخصم (مثلاً 60 يعني خصم 60%)
   label    -> نص لافتة العرض اللي بتظهر فوق قسم الأعمال

   السعر الأصلي بيتحسب تلقائياً من نسبة الخصم — يعني لو غيّرت "percent"
   كل أسعار المشاريع هتتحدث لوحدها من غير ما تلمس projects.json خالص.
   المشاريع اللي سعرها نصي (زي "تواصل معنا") مش بتتأثر بالعرض.
===================================================== */
const PROMO = {
  active: true,
  percent: 60,
  label: {
    ar: "🎒 خصم %60 بمناسبة العودة المدرسية — لفترة محدودة",
    en: "🎒 60% Off — Back to School Offer, Limited Time"
  }
};

// بيحسب السعر بعد الخصم لأي مشروع، وبيرجع null لو العرض متوقف أو المشروع سعره نصي مش رقمي
function getDiscount(project){
  if(!PROMO.active || !project.price || !project.price.value) return null;
  const original = parseFloat(String(project.price.value).replace(/,/g, ""));
  if(isNaN(original)) return null;
  const discounted = Math.round(original * (1 - PROMO.percent / 100));
  return { original, discounted, currency: project.price.currency };
}

/* =====================================================
   i18n
===================================================== */
const I18N = {
  ar:{
    skip:"تخطي إلى المحتوى", introSkip:"اضغط أي مكان للمتابعة",
    navAbout:"نبذة", navSkills:"المهارات", navProjects:"الأعمال", navContact:"تواصل", navCta:"لنبدأ",
    heroTitle1:"طالب في كلية الهندسة،", heroTitle2:"مصمم جرافيك وبحب البرمجة.",
    heroSub:"طالب في كلية الهندسة، بحب جدًا البرمجة وبحوّل الأفكار لتجارب رقمية متكاملة.",
    heroCta1:"شوف الأعمال", heroCta2:"تواصل واتساب",
    availTag:"متاح لمشاريع جديدة", scroll:"اسكرول",
    aboutEyebrow:"مين أنا", aboutTitle:"مصمم جرافيك بيحب البرمجة.",
    aboutDesc:"طالب في كلية الهندسة، بحب البرمجة وبحوّل الأفكار لتجارب رقمية متكاملة.",
    b1t:"هندسة البرمجيات", b1d:"بحب البرمجة وبشتغل على تحويل الأفكار لحلول رقمية واضحة وشغالة.",
    b1quote:"\"الكود الجميل هو اللي بيشتغل صح، مش بس اللي شكله حلو.\"",
    b2t:"تصميم جرافيك", b2d:"لوجوهات، كروت شخصية، وهويات بصرية — من الفكرة للتسليم.",
    b3t:"حل المشكلات", b3d:"بافكر في المشكلة الأساسية قبل الحل — عشان النتيجة تكون مفيدة فعلاً.",
    b4t:"بشتغل دلوقتي على", b4d:"تطوير مهاراتي في البرمجة والتصميم، وبناء تجارب رقمية مختلفة.",
    skillsEyebrow:"المهارات والخبرات", skillsTitle:"مهارات بتتوسع باستمرار", skillsDesc:"من الهوية البصرية والتصميم، لحد تطوير المواقع والبرمجة.",
    sg1:"التصميم والهوية البصرية", sg2:"تطوير الويب", sg4:"الأدوات والتقنيات",
    projEyebrow:"الأعمال", projTitle:"أعمال أنجزت بعناية", projDesc:"اضغط على أي مشروع لعرض التفاصيل كاملة، وعلى الكمبيوتر هتلاقي تفاعلات إضافية.",
    filterAll:"الكل", filterLogo:"لوجوهات", filterCard:"كروت شخصية", filterWebsite:"مواقع", filterVideo:"مونتاج", filterApp:"تطبيقات", filterVoice:"فويس أوفر",
    projValue:"القيمة التقديرية", viewLabel:"عرض", openLabel:"فتح",
    contactEyebrow:"لنبدأ مشروعك", whatsappBtn:"واتساب", linkedinBtn:"LinkedIn",
    footNote:"صُمم وبُني يدويًا — 2026. أول مشروع في الـPortfolio هو الـPortfolio نفسه.",
    modalProblem:"المشكلة", modalDid:"اللي عملته", modalValue:"القيمة التقديرية", watchOnYoutube:"شاهد الفيديو على يوتيوب ↗"
  },
  en:{
    skip:"Skip to content", introSkip:"Tap anywhere to continue",
    navAbout:"About", navSkills:"Skills", navProjects:"Work", navContact:"Contact", navCta:"Let's talk",
    heroTitle1:"Engineering student,", heroTitle2:"Graphic designer who loves programming.",
    heroSub:"Engineering student, graphic designer, and programming enthusiast — turning ideas into complete digital experiences.",
    heroCta1:"View Work", heroCta2:"Message on WhatsApp",
    availTag:"Available for new projects", scroll:"Scroll",
    aboutEyebrow:"About", aboutTitle:"An engineering student who loves programming and design.",
    aboutDesc:"An engineering student who loves programming and turns ideas into complete digital experiences.",
    b1t:"Software Engineering", b1d:"I like understanding what I build and turning ideas into clear, working solutions.",
    b1quote:"\"Beautiful code is code that works right, not just code that looks nice.\"",
    b2t:"Creative Work", b2d:"Logo design, business cards, and full brand identities for real clients — from concept to delivery.",
    b3t:"Problem Solving", b3d:"I think about the root problem before the solution — so the result is actually useful.",
    b4t:"Currently working on", b4d:"Improving my programming and design skills, and building digital experiences.",
    skillsEyebrow:"Skills & Expertise", skillsTitle:"Skills that keep expanding", skillsDesc:"From visual identity and design, to web development and programming.",
    sg1:"Visual Design", sg2:"Web Development", sg4:"Tools & Technologies",
    projEyebrow:"Work", projTitle:"Projects crafted with care", projDesc:"Click any project for the full details, with extra interactions on desktop.",
    filterAll:"All", filterLogo:"Logos", filterCard:"Business Cards", filterWebsite:"Websites", filterVideo:"Video Editing", filterApp:"Apps", filterVoice:"Voice Over",
    projValue:"Est. value", viewLabel:"VIEW", openLabel:"OPEN",
    contactEyebrow:"Start your project", whatsappBtn:"WhatsApp", linkedinBtn:"LinkedIn",
    footNote:"Designed & built by hand — 2026. This portfolio is itself project #1.",
    modalProblem:"The problem", modalDid:"What I did", modalValue:"Est. value", watchOnYoutube:"Watch on YouTube ↗"
  }
};
let LANG = "ar";

function t(key){ return I18N[LANG][key] || key; }
function applyI18n(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n");
    if(I18N[LANG][k]!==undefined) el.textContent = I18N[LANG][k];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el=>{
    const k = el.getAttribute("data-i18n-ph");
    if(I18N[LANG][k]!==undefined) el.setAttribute("placeholder", I18N[LANG][k]);
  });
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG==="ar" ? "rtl" : "ltr";
  document.getElementById("langToggle").textContent = LANG==="ar" ? "EN" : "AR";
  applyPromoBanner();
}

// بيظهر لافتة العرض فوق قسم الأعمال لو PROMO.active = true، وبيخفيها تلقائي لو العرض اتوقف
function applyPromoBanner(){
  const banner = document.getElementById("promoBanner");
  if(!banner) return;
  if(PROMO.active){
    banner.textContent = PROMO.label[LANG] || PROMO.label.ar;
    banner.classList.add("active");
  }else{
    banner.classList.remove("active");
  }
}

/* =====================================================
   PROJECTS RENDER
===================================================== */
function renderProjects(){
  const grid = document.getElementById("projectsGrid");
  if(!grid) return;

  grid.innerHTML = "";

  const filtered = CURRENT_FILTER === "all" ? PROJECTS : PROJECTS.filter(p => (p.tags || []).includes(CURRENT_FILTER));
  filtered.forEach(project => {
    const card = document.createElement("article");
    card.className = `proj-card${project.featured ? " featured" : ""}`;
    card.setAttribute("data-cursor-label", t("viewLabel"));
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", getLocalized(project.title));

    const glare = document.createElement("div");
    glare.className = "glare";

    const media = document.createElement("div");
    media.className = "proj-media";

    const image = document.createElement("img");
    // لو مفيش "image" متحطة للمشروع وعنده فيديو، هناخد صورة الغلاف تلقائي من يوتيوب — مش لازم ترفع صورة بنفسك لكل فيديو
    image.src = project.image || (project.video ? `https://img.youtube.com/vi/${project.video}/hqdefault.jpg` : "");
    image.alt = getLocalized(project.title);
    image.loading = "lazy";

    media.appendChild(image);

    // شارة "-60%" ثابتة على غلاف أي مشروع سعره اتخفّض، وبتفضل ظاهرة على الموبايل والديسكتوب من غير الحاجة لعمل hover
    const discount = getDiscount(project);
    if(discount){
      const saleBadge = document.createElement("div");
      saleBadge.className = "sale-badge";
      saleBadge.textContent = `-${PROMO.percent}%`;
      media.appendChild(saleBadge);
    }

    if(project.video){
      const playIcon = document.createElement("div");
      playIcon.className = "proj-play";
      playIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" fill="rgba(5,7,12,.55)" stroke="rgba(255,255,255,.5)"/><path d="M10 8.5v7l6-3.5-6-3.5Z" fill="#fff"/></svg>`;
      media.appendChild(playIcon);
    }

    const body = document.createElement("div");
    body.className = "proj-body";

    const category = document.createElement("div");
    category.className = "proj-cat";
    category.textContent = getLocalized(project.category);

    const title = document.createElement("h3");
    title.className = "proj-title";
    title.textContent = getLocalized(project.title);

    const description = document.createElement("p");
    description.className = "proj-desc";
    description.textContent = getLocalized(project.desc);

    const open = document.createElement("span");
    open.className = "proj-open";
    open.innerHTML = `${t("openLabel")} <span aria-hidden="true">↗</span>`;

    const value = document.createElement("div");
    value.className = "proj-value";

    const valueLabel = document.createElement("span");
    valueLabel.className = "k";
    valueLabel.textContent = t("projValue");

    const valueText = document.createElement("span");
    valueText.className = "v";
    // priceText (لو موجود) بيبقى بديل نصي زي "تواصل معنا"، وبيتقدم على أي حاجة تانية
    // بعده: لو فيه خصم فعّال، بيتعرض السعر الأصلي مشطوب + السعر الجديد بارز
    // وإلا السعر العادي زي ما هو
    if(project.priceText){
      valueText.textContent = getLocalized(project.priceText);
    }else if(discount){
      // ملحوظة مهمة: الاتجاه dir="ltr" هنا إجباري — من غيره المتصفح بيقلب ترتيب
      // الأرقام والعملة عشوائي لأن الصفحة كلها RTL والأرقام طبيعتها LTR
      valueText.innerHTML = `<span class="price-value" dir="ltr"><s class="price-original">${discount.original}</s> <b class="price-discounted">${discount.discounted}</b> <span class="price-currency">${discount.currency}</span></span>`;
    }else{
      valueText.innerHTML = `<span class="price-value" dir="ltr">${project.price.value} ${project.price.currency}</span>`;
    }

    body.append(category, title, description, open);
    value.append(valueLabel, valueText);
    card.append(glare, media, body, value);

    card.addEventListener("click", () => openModal(project));
    card.addEventListener("keydown", event => {
      if(event.key === "Enter" || event.key === " "){
        event.preventDefault();
        openModal(project);
      }
    });
    grid.appendChild(card);
  });

  if(!isTouchDevice) setupTilt();
}

function getLocalized(value){
  if(!value) return "";
  return value[LANG] ?? value.ar ?? value.en ?? "";
}

/* 3D tilt + glare for project cards (desktop only) */
const isTouchDevice = window.matchMedia("(hover:none), (pointer:coarse)").matches;
function setupTilt(){
  document.querySelectorAll(".proj-card").forEach(card=>{
    card.addEventListener("mousemove", e=>{
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rotX = (0.5 - py) * 7;
      const rotY = (px - 0.5) * 9;
      card.style.transform = `translateY(-6px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      card.style.setProperty("--gx", (px*100)+"%");
      card.style.setProperty("--gy", (py*100)+"%");
    });
    card.addEventListener("mouseleave", ()=>{ card.style.transform = ""; });
  });
}

function openModal(p){
  // بيحدد إيه اللي يتعرض في أعلى نافذة التفاصيل: فيديو يوتيوب لو موجود، أو صورة الغلاف لو مفيش
  const modalImg = document.getElementById("modalImg");
  const modalMedia = document.querySelector(".modal-media");
  const videoWrap = document.getElementById("modalVideoWrap");
  const videoFrame = document.getElementById("modalVideoFrame");
  const videoBackdrop = document.getElementById("modalVideoBackdrop");
  if(p.video){
    // p.video = كود الفيديو بس (من https://youtu.be/CODE أو /shorts/CODE) — مش اللينك كامل
    videoFrame.src = `https://www.youtube.com/embed/${p.video}?rel=0`;
    videoWrap.classList.add("active");
    // بنلغي نسبة العرض الثابتة بتاعة modal-media يدوياً (احتياط لأي متصفح مايدعمش :has في CSS)
    modalMedia.style.aspectRatio = "auto";
    // p.videoVertical = true لو الفيديو Shorts (عمودي) → الصندوق الداخلي يبقى طولي 9:16
    // أو عريض 16:9 لو مش عمودي — وفي الحالتين الفيديو بيظهر كامل من غير أي قص
    videoWrap.classList.toggle("vertical", !!p.videoVertical);
    videoWrap.classList.toggle("horizontal", !p.videoVertical);
    // الفراغ حوالين الفيديو بيتملى بنسخة مموّهة من صورة غلاف نفس الفيديو (تأثير زي Apple Music)
    videoBackdrop.style.backgroundImage = `url(https://img.youtube.com/vi/${p.video}/hqdefault.jpg)`;
    modalImg.classList.add("hidden");
    // رابط احتياطي: لو الفيديو مش راضي يشتغل جوه الموقع (مثلاً "Allow embedding" مقفول من يوتيوب)
    const fallback = document.getElementById("modalVideoFallback");
    fallback.href = `https://www.youtube.com/watch?v=${p.video}`;
    fallback.classList.add("active");
  }else{
    videoFrame.src = "";
    videoWrap.classList.remove("active", "vertical", "horizontal");
    modalMedia.style.aspectRatio = "";
    document.getElementById("modalVideoFallback").classList.remove("active");
    modalImg.classList.remove("hidden");
    // لو المشروع مفيهوش صورة غلاف مرفوعة، وفيه فيديو، بناخد صورة الغلاف تلقائي من يوتيوب
    modalImg.src = p.image || (p.video ? `https://img.youtube.com/vi/${p.video}/hqdefault.jpg` : "");
    modalImg.alt = getLocalized(p.title);
  }
  document.getElementById("modalCat").textContent = getLocalized(p.category);
  document.getElementById("modalTitle").textContent = getLocalized(p.title);
  document.getElementById("modalDesc").textContent = getLocalized(p.desc);
  const tech = document.getElementById("modalTech");
  tech.innerHTML = "";
  (p.tech || []).forEach(item => {
    const tag = document.createElement("span");
    tag.textContent = item;
    tech.appendChild(tag);
  });
  document.getElementById("modalProblemLabel").textContent = t("modalProblem");
  document.getElementById("modalProblem").textContent = getLocalized(p.problem);
  document.getElementById("modalDidLabel").textContent = t("modalDid");
  document.getElementById("modalDid").textContent = getLocalized(p.did);
  document.getElementById("modalValueLabel").textContent = t("modalValue");
  // priceText (لو موجود) بيبقى بديل نصي زي "تواصل معنا"، وبيتقدم على أي حاجة تانية
  const modalDiscount = getDiscount(p);
  const modalSaleBadge = document.getElementById("modalSaleBadge");
  const modalPriceEl = document.getElementById("modalPrice");
  if(p.priceText){
    modalPriceEl.textContent = getLocalized(p.priceText);
    modalSaleBadge.textContent = "";
  }else if(modalDiscount){
    // نفس ملحوظة الاتجاه: dir="ltr" إجباري عشان الترتيب مايتقلبش في صفحة RTL
    modalPriceEl.innerHTML = `<span class="price-value" dir="ltr"><s class="price-original">${modalDiscount.original}</s> <span class="price-discounted">${modalDiscount.discounted}</span> <span class="price-currency">${modalDiscount.currency}</span></span>`;
    modalSaleBadge.textContent = `-${PROMO.percent}%`;
  }else{
    modalPriceEl.innerHTML = `<span class="price-value" dir="ltr">${p.price.value} ${p.price.currency}</span>`;
    modalSaleBadge.textContent = "";
  }
  const overlay = document.getElementById("modalOverlay");
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  const overlay = document.getElementById("modalOverlay");
  document.getElementById("modalVideoFrame").src = "";
  document.getElementById("modalVideoBackdrop").style.backgroundImage = "";
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalOverlay").addEventListener("click", e=>{ if(e.target.id==="modalOverlay") closeModal(); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeModal(); });

/* =====================================================
   THEME
===================================================== */
function setTheme(mode){
  document.documentElement.setAttribute("data-theme", mode);
  localStorage.setItem("theme", mode);
}
document.getElementById("themeToggle").addEventListener("click", ()=>{
  const cur = document.documentElement.getAttribute("data-theme");
  setTheme(cur==="dark" ? "light" : "dark");
});
(function initTheme(){
  const saved = localStorage.getItem("theme");
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(saved || (prefersLight ? "light" : "dark"));
})();

/* =====================================================
   LANGUAGE
===================================================== */
document.getElementById("langToggle").addEventListener("click", ()=>{
  LANG = LANG==="ar" ? "en" : "ar";
  localStorage.setItem("lang", LANG);
  applyI18n();
  renderProjects();
});
(function initLang(){
  LANG = localStorage.getItem("lang") || "ar";
})();

/* =====================================================
   SOUND (off by default, tiny hover/click blips via WebAudio — no external files)
===================================================== */
let soundOn = false;
let audioCtx;
function beep(freq, dur){
  if(!soundOn) return;
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = "sine"; o.frequency.value = freq;
    g.gain.value = 0.035;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.stop(audioCtx.currentTime + dur);
  }catch(e){}
}
document.getElementById("soundToggle").addEventListener("click", function(){
  soundOn = !soundOn;
  this.style.color = soundOn ? "var(--accent-2)" : "";
  if(soundOn) beep(880,.08);
});
document.querySelectorAll("a, button, .proj-card, .chip, .bento-card").forEach(el=>{
  el.addEventListener("mouseenter", ()=>beep(520,.05));
});

/* =====================================================
   CUSTOM CURSOR + MAGNETIC
   Desktop: hide the native pointer and keep only the interactive ring.
===================================================== */
const isTouch = window.matchMedia("(hover:none), (pointer:coarse)").matches;
if(isTouch){
  document.body.classList.add("no-cursor");
}else{
  const ring = document.querySelector(".cursor-ring");
  let mx = innerWidth / 2;
  let my = innerHeight / 2;
  let rx = mx;
  let ry = my;

  window.addEventListener("mousemove", e=>{
    mx = e.clientX;
    my = e.clientY;
  });

  function cursorLoop(){
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(cursorLoop);
  }
  cursorLoop();

  function setupMagneticElements(){
    document.querySelectorAll(".btn-primary, .btn-ghost, .contact-btn, .nav-cta, .nav-btn, .magnetic").forEach(el=>{
      el.addEventListener("mousemove", e=>{
        const r = el.getBoundingClientRect();
        const relX = e.clientX - r.left - r.width / 2;
        const relY = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${relX * 0.25}px,${relY * 0.35}px)`;
      });
      el.addEventListener("mouseleave", ()=>{ el.style.transform = ""; });
      el.addEventListener("mouseenter", ()=>ring.classList.add("grow"));
      el.addEventListener("mouseleave", ()=>ring.classList.remove("grow"));
    });

    // Restore the avatar's interactive parallax tilt.
    const avatarWrap = document.querySelector(".hero-avatar-wrap");
    if(avatarWrap){
      avatarWrap.style.perspective = "800px";
      const avatarRing = avatarWrap.querySelector(".avatar-ring");
      avatarWrap.addEventListener("mousemove", e=>{
        const r = avatarWrap.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        avatarRing.style.transform = `rotateX(${py * -10}deg) rotateY(${px * 12}deg)`;
      });
      avatarWrap.addEventListener("mouseleave", ()=>{ avatarRing.style.transform = ""; });
    }
  }
  setupMagneticElements();

  function setupProjectCursor(){
    document.querySelectorAll(".proj-card").forEach(card=>{
      card.addEventListener("mouseenter", ()=>{
        ring.classList.add("label");
        ring.querySelector("span").textContent = t("viewLabel");
      });
      card.addEventListener("mouseleave", ()=>ring.classList.remove("label"));
    });
  }

  const originalRenderProjects = renderProjects;
  renderProjects = function(){
    originalRenderProjects();
    setupProjectCursor();
  };

  document.querySelectorAll(".bento-card").forEach(card=>{
    card.addEventListener("mousemove", e=>{
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
}

/* =====================================================
   INTRO
===================================================== */
(function intro(){
  const el = document.getElementById("intro");
  const fill = document.getElementById("introFill");
  const skip = document.getElementById("introSkip");
  const seen = sessionStorage.getItem("introSeen");
  if(seen){ el.classList.add("done"); document.body.style.overflow=""; return; }
  document.body.style.overflow = "hidden";
  let done = false;
  function finish(){
    if(done) return; done = true;
    sessionStorage.setItem("introSeen","1");
    el.classList.add("done");
    document.body.style.overflow = "";
  }
  if(window.gsap){
    gsap.to(fill, { width:"100%", duration:.75, ease:"power2.inOut", onComplete: ()=> setTimeout(finish, 120) });
    gsap.fromTo(".intro-mark", {opacity:0, y:14}, {opacity:1, y:0, duration:.6, ease:"power2.out"});
    gsap.to(skip, {opacity:1, delay:.55, duration:.3});
  }else{
    fill.style.width = "100%";
    setTimeout(finish, 1200);
  }
  el.addEventListener("click", finish);
  setTimeout(finish, 1600); // hard cap so it never blocks content
})();

/* =====================================================
   LENIS + GSAP SCROLL
===================================================== */
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if(window.gsap && window.ScrollTrigger){ gsap.registerPlugin(ScrollTrigger); }

let lenis;
if(!prefersReduced && window.Lenis){
  lenis = new Lenis({ duration:1.05, easing:(t)=>1-Math.pow(1-t,3) });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  if(window.ScrollTrigger){
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time)=>{ lenis.raf(time*1000); });
    gsap.ticker.lagSmoothing(0);
  }
}

// navbar hide on scroll down
(function navScroll(){
  const nav = document.getElementById("navbar");
  let lastY = 0;
  window.addEventListener("scroll", ()=>{
    const y = window.scrollY;
    if(y > lastY && y > 120) nav.classList.add("hide"); else nav.classList.remove("hide");
    lastY = y;
  }, {passive:true});
})();

// animated parallax background orbs
(function bgParallax(){
  const orbs = [
    {el: document.getElementById("orb1"), depth: 0.12, driftX: 18},
    {el: document.getElementById("orb2"), depth: -0.18, driftX: -24},
    {el: document.getElementById("orb3"), depth: 0.08, driftX: 14}
  ];
  if(prefersReduced){ return; } // keep orbs static, no motion

  let mx = 0, my = 0;
  window.addEventListener("mousemove", e=>{
    mx = (e.clientX / innerWidth - 0.5);
    my = (e.clientY / innerHeight - 0.5);
  });

  if(window.gsap && window.ScrollTrigger){
    orbs.forEach(o=>{
      gsap.to(o.el, {
        y: () => document.documentElement.scrollHeight * o.depth,
        ease:"none",
        scrollTrigger:{ trigger: document.body, start:"top top", end:"bottom bottom", scrub:0.6 }
      });
    });
  }

  // gentle mouse-follow drift on top of the scroll transform
  if(window.gsap){
    gsap.ticker.add(()=>{
      orbs.forEach(o=>{
        gsap.set(o.el, { x: mx * o.driftX });
      });
    });
  }
})();

// hero title reveal
if(window.gsap){
  gsap.to(".hero-title .line span", { y:0, duration:1, ease:"power4.out", stagger:.1, delay:.35 });
  gsap.fromTo(".hero-sub, .hero-cta-row", {opacity:0, y:18}, {opacity:1, y:0, duration:.9, ease:"power3.out", stagger:.12, delay:.6});
  gsap.fromTo(".hero-avatar-wrap", {opacity:0, scale:.9}, {opacity:1, scale:1, duration:1, ease:"power3.out", delay:.4});

  // reveal on scroll
  document.querySelectorAll(".reveal").forEach(el=>{
    gsap.fromTo(el, {opacity:0, y:28}, {
      opacity:1, y:0, duration:.9, ease:"power3.out",
      scrollTrigger:{ trigger:el, start:"top 88%" }
    });
  });

  // blueprint draw
  document.querySelectorAll(".blueprint path.draw").forEach(path=>{
    gsap.to(path, { strokeDashoffset:0, duration:1.6, ease:"power2.out",
      scrollTrigger:{ trigger:path, start:"top 90%" } });
  });
}

if(!window.gsap){
  document.querySelectorAll(".reveal").forEach(el=>{
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}

/* =====================================================
   CONTACT LINKS
===================================================== */

/* init i18n on load */
applyI18n();

function setupFilters(){
  const bar = document.getElementById("filterBar");
  if(!bar) return;
  bar.querySelectorAll(".filter-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      CURRENT_FILTER = btn.getAttribute("data-filter");
      bar.querySelectorAll(".filter-btn").forEach(b=>{
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      renderProjects();
    });
  });
}
setupFilters();

/* =====================================================
   PROJECT DATA
===================================================== */
fetch("data/projects.json", { cache: "no-cache" })
  .then(response => {
    if(!response.ok) throw new Error("projects.json unavailable");
    return response.json();
  })
  .then(data => {
    PROJECTS = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
    renderProjects();
  })
  .catch(error => {
    console.error("Could not load projects:", error);
  });
