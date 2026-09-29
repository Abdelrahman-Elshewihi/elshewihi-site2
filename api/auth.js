/* =====================================================
   API تسجيل الدخول للوحة التحكم — /api/auth
   ده أول خطوة في عملية الدخول (Login with GitHub) للوحة التحكم (admin/).
   شغال بدل Netlify Identity، عشان اللوحة تشتغل بالكامل على Vercel من غير
   أي خدمة خارجية تانية.

   إزاي شغال:
   1) لما تدوس "Login with GitHub" في صفحة /admin، اللوحة بتفتح نافذة صغيرة
      على الرابط ده (/api/auth).
   2) إحنا هنا بنحوّل النافذة لصفحة تسجيل الدخول الرسمية بتاعة GitHub.
   3) بعد ما توافق، GitHub هيرجّع النافذة لـ /api/callback (الملف التاني)
      اللي هو المسؤول عن إكمال عملية الدخول.

   محتاج متغيرين بيئة (Environment Variables) في Vercel:
   - OAUTH_GITHUB_CLIENT_ID
   - OAUTH_GITHUB_CLIENT_SECRET  (مستخدم في api/callback.js بس، مش هنا)
   التفاصيل كاملة في دليل-تفعيل-لوحة-التحكم.md
===================================================== */

module.exports = function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;

  if (!clientId) {
    res.status(500).send("لوحة التحكم مش متفعّلة لسه — OAUTH_GITHUB_CLIENT_ID ناقص. راجع دليل-تفعيل-لوحة-التحكم.md");
    return;
  }

  // العنوان اللي GitHub هيرجّع المستخدم له بعد ما يوافق (نفس الدومين، مسار /api/callback)
  const redirectUri = `https://${req.headers.host}/api/callback`;

  // scope=repo يدي اللوحة صلاحية تقرأ/تكتب في الريبو عشان تقدر تحفظ التعديلات
  const authorizeUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=repo`;

  res.writeHead(302, { Location: authorizeUrl });
  res.end();
};
