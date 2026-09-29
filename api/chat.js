/* =====================================================
   API الشات بوت — /api/chat
   ده الملف اللي بيوصل سؤال الزائر بموديل الذكاء الاصطناعي (مجانًا عن طريق Groq)
   ويرجّع الرد. الملف ده شغال على السيرفر (Vercel)، مش في المتصفح — عشان
   الـ API key بتاع Groq يفضل مخفي وميظهرش لأي حد بيفتح كود الموقع.

   إزاي يشتغل بالظبط (3 خطوات بسيطة):
   1) الزائر بيكتب سؤال في نافذة الشات (js/chat-widget.js)
   2) السؤال بييجي هنا، وإحنا بنلزّق معاه "ملف تعريف" كامل عن عبدالرحمن
      (اسمه، مهاراته، أسعاره، مشاريعه...) ماخوذ تلقائيًا من data/profile.json
      و data/projects.json — يعني لو ضفت مشروع جديد أو غيّرت سعر في
      الملفين دول، الشات بوت هيعرف المعلومة الجديدة أوتوماتيك من غير
      ما تلمس الملف ده خالص.
   3) بنبعت الكل لموديل Groq المجاني، وبيرجعلنا رد بيتبعت للزائر.

   ⚠️ الحاجة الوحيدة اللي المفروض تحتاج تعدلها في الملف ده هي قسم
   "PROMO_MIRROR" تحت لو غيّرت نسبة الخصم في js/main.js — لازم الرقمين
   يفضلوا متطابقين عشان الشات بوت يقول للزوار السعر الصح.
===================================================== */

// بيانات المشروع (اللي إحنا فعلاً محتاجينها هنا فقط، من غير أي كود خاص بواجهة الموقع)
const profile = require("../data/profile.json");
const projectsData = require("../data/projects.json");

/* =====================================================
   PROMO_MIRROR — نسخة طبق الأصل من إعداد العرض في js/main.js
   لازم القيمتين دول (active, percent) يفضلوا زي ما هما بالظبط
   في js/main.js -> const PROMO. لو غيّرت واحد فيهم هناك، غيّره هنا كمان.
===================================================== */
const PROMO_MIRROR = {
  active: true,
  percent: 60
};

// نفس معادلة حساب السعر بعد الخصم الموجودة في js/main.js، عشان الشات بوت
// يقول للزائر السعر الصح لو فيه عرض شغال
function getDiscountedPrice(project) {
  if (!PROMO_MIRROR.active || !project.price || !project.price.value) return null;
  const original = parseFloat(String(project.price.value).replace(/,/g, ""));
  if (isNaN(original)) return null;
  const discounted = Math.round(original * (1 - PROMO_MIRROR.percent / 100));
  return { original, discounted, currency: project.price.currency };
}

// بيحوّل كل مشروع من projects.json لسطر نصي واضح يقدر الموديل يفهمه ويرد بيه
function describeProject(project) {
  const title = project.title?.ar || project.title?.en || project.id;
  const desc = project.desc?.ar || "";
  let priceLine;
  if (project.priceText) {
    priceLine = project.priceText.ar || project.priceText.en;
  } else {
    const discount = getDiscountedPrice(project);
    priceLine = discount
      ? `السعر بعد الخصم ${discount.discounted} ${discount.currency} (السعر الأصلي ${discount.original} ${discount.currency})`
      : `${project.price?.value} ${project.price?.currency}`;
  }
  return `- ${title}: ${desc} | السعر: ${priceLine}${project.link ? ` | الرابط: ${project.link}` : ""}`;
}

// بيبني "ملف التعريف" الكامل اللي بيتبعت للموديل قبل كل سؤال
function buildSystemPrompt() {
  const services = profile.services.map(s => `- ${s.ar}`).join("\n");
  const projectsList = (projectsData.items || []).map(describeProject).join("\n");
  const faq = profile.faq
    .map(f => `س: ${f.q.ar}\nج: ${f.a.ar}`)
    .join("\n\n");

  return `انت مساعد ذكاء اصطناعي جوه موقع بورتفوليو شخصي، ودورك ترد على أسئلة زوار الموقع عن صاحب الموقع بس.

معلومات عن صاحب الموقع:
- الاسم: ${profile.name.ar} (${profile.name.en})
- الصفة: ${profile.title.ar}
- نبذة: ${profile.bio.ar}
- التوفر حاليًا: ${profile.availability.ar}

الخدمات اللي بيقدمها:
${services}

الأدوات والتقنيات اللي بيستخدمها: ${profile.tools.join(", ")}

سياسة الأسعار: ${profile.pricingPolicy.ar}

أمثلة من المشاريع اللي اتعملت فعلاً (استخدمها للرد على أي سؤال عن الأسعار أو الشغل السابق):
${projectsList}

طرق التواصل:
- واتساب: ${profile.contact.whatsappLink}
- لينكدإن: ${profile.contact.linkedin}

أسئلة شائعة:
${faq}

تعليمات مهمة لطريقة الرد:
1) ردودك لازم تكون قصيرة ومباشرة (2-4 جمل عادةً)، بأسلوب ودود واحترافي.
2) رد بنفس لغة سؤال الزائر بالظبط (لو كتب عربي رد عربي، لو إنجليزي رد إنجليزي).
3) استخدم المعلومات اللي فوق بس. لو حد سأل حاجة مش موجودة عندك، قوله إنك مش متأكد وانصحه يتواصل مباشرة عن طريق واتساب.
4) لو حد سأل عن حاجة مالهاش علاقة خالص بصاحب الموقع أو شغله (زي أسئلة عامة أو مواضيع تانية)، اعتذر بلطف وقوله إنك هنا بس عشان تجاوب على أسئلة تخص عبدالرحمن وشغله.
5) متقترحش واتساب أو أي وسيلة تواصل إلا لو المستخدم سأل صراحة "إزاي أتواصل" أو "عايز أطلب مشروع" أو طلب رقم/لينك بنفسه. في أي سؤال تاني، جاوب على اللي اتسأل عنه بس من غير ما تقترح التواصل.`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, history } = req.body || {};

  // تحقق بسيط من المدخلات عشان محدش يبعت رسايل فاضية أو ضخمة جدًا
  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "الرسالة فاضية" });
    return;
  }
  if (message.length > 1000) {
    res.status(400).json({ error: "الرسالة طويلة جدًا" });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    // ده معناه إنك لسه محطتش الـ API key في إعدادات Vercel (اقرأ README)
    res.status(500).json({ error: "الشات بوت مش متفعّل لسه — الـ API key ناقص." });
    return;
  }

  // بنحتفظ بآخر كام رسالة بس من المحادثة عشان الرد يفضل سريع ورخيص
  const recentHistory = Array.isArray(history) ? history.slice(-6) : [];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b", // موديل مجاني وسريع من Groq — راجع README لو عايز تغيّره
        temperature: 0.4,
        max_tokens: 350,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          ...recentHistory,
          { role: "user", content: message }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", response.status, errText);
      res.status(502).json({ error: "في مشكلة مؤقتة في خدمة الذكاء الاصطناعي، جرب تاني كمان شوية." });
      return;
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "معلش، مقدرتش أفهم السؤال. ممكن تعيد صياغته؟";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat function error:", err);
    res.status(500).json({ error: "حصل خطأ غير متوقع، حاول تاني." });
  }
};
