/* =====================================================
   API إكمال تسجيل الدخول — /api/callback
   ده تكملة /api/auth: بعد ما توافق على صفحة GitHub، بيرجعك GitHub هنا ومعاه
   "code" مؤقت. إحنا هنا بنستبدل الـ code ده بـ "token" حقيقي (باستخدام
   OAUTH_GITHUB_CLIENT_SECRET اللي متخبي في متغيرات البيئة، عشان محدش
   يقدر ياخده من الكود الظاهر للناس)، وبعدين بنبعت التوكن ده للوحة التحكم
   (admin/) عشان تكمل بيه الدخول وتقدر تحفظ التعديلات في الريبو.

   الملف ده تقني جدًا ومحتاجش أي تعديل منك أبدًا — القيم اللي بتتغير كلها
   في Environment Variables على Vercel، مش هنا.
===================================================== */

module.exports = async function handler(req, res) {
  const { code } = req.query || {};
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    res.status(400).send("حصلت مشكلة في تسجيل الدخول — راجع دليل-تفعيل-لوحة-التحكم.md.");
    return;
  }

  try {
    // بنستبدل الـ code المؤقت بـ token حقيقي من GitHub
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    if (!token) {
      res.status(400).send("GitHub رفض تسجيل الدخول. جرب تاني.");
      return;
    }

    // صفحة صغيرة بتبعت الـ token للوحة التحكم (اللي فاتحة في التاب الأصلي)
    // وبعدين تقفل نفسها — ده الشكل القياسي اللي Decap CMS بتستناه بالظبط
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`
      <script>
        (function() {
          function receiveMessage(e) {
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify({ token, provider: "github" })}',
              e.origin
            );
            window.removeEventListener("message", receiveMessage, false);
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })();
      </script>
    `);
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    res.status(500).send("حصل خطأ غير متوقع أثناء تسجيل الدخول.");
  }
};
