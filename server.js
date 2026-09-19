const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "8mb" }));

const PORT = process.env.PORT || 10000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.6-sol";

function requireKey(res) {
  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server." });
    return false;
  }
  return true;
}

async function callOpenAI(input) {
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input
    })
  });

  const data = await r.json();
  if (!r.ok) {
    const message = data?.error?.message || "OpenAI request failed.";
    throw new Error(message);
  }
  return data;
}

function outputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  const parts = [];
  for (const item of data.output || []) {
    for (const c of item.content || []) {
      if (typeof c.text === "string") parts.push(c.text);
    }
  }
  return parts.join("\n").trim();
}

app.get("/", (_req, res) => {
  res.json({
    app: "Dabbarha AI Backend",
    status: "ok",
    model: OPENAI_MODEL
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    openai_configured: Boolean(OPENAI_API_KEY),
    model: OPENAI_MODEL
  });
});

app.post("/api/analyze", async (req, res) => {
  try {
    if (!requireKey(res)) return;

    const problem = String(req.body?.problem || "").trim();
    if (!problem) return res.status(400).json({ error: "problem is required" });

    const system = `
أنت المساعد الذكي داخل تطبيق «دبّرها».
حلّل مشكلة المستخدم بالعربية بطريقة عملية وواضحة.
أعطِ خلاصة قصيرة ثم خطوات عملية مرقمة، واذكر ما يحتاجه المستخدم من مستندات أو معلومات.
لا تدّعي أنك نفذت شيئًا لم تنفذه.
في المسائل الطبية أو القانونية أو المالية عالية المخاطر، نبّه المستخدم إلى ضرورة الرجوع لمختص.
`;

    const data = await callOpenAI([
      { role: "system", content: [{ type: "input_text", text: system }] },
      { role: "user", content: [{ type: "input_text", text: problem }] }
    ]);

    res.json({
      ok: true,
      model: OPENAI_MODEL,
      answer: outputText(data)
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
});

app.post("/api/analyze-image", async (req, res) => {
  try {
    if (!requireKey(res)) return;

    const image = String(req.body?.image || "");
    const question = String(req.body?.question || "اقرأ الصورة واشرح محتواها وساعدني في معرفة الخطوات العملية التالية.").trim();

    if (!image.startsWith("data:image/")) {
      return res.status(400).json({ error: "image must be a data:image/... URL" });
    }

    const data = await callOpenAI([
      {
        role: "system",
        content: [{
          type: "input_text",
          text: "أنت مساعد «دبّرها». افهم الصور والمستندات بالعربية. استخرج المعلومات الظاهرة بدقة، ثم اشرح للمستخدم ما تعنيه وما الخطوات العملية التالية. لا تخترع معلومات غير واضحة."
        }]
      },
      {
        role: "user",
        content: [
          { type: "input_text", text: question },
          { type: "input_image", image_url: image }
        ]
      }
    ]);

    res.json({
      ok: true,
      model: OPENAI_MODEL,
      answer: outputText(data)
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Image analysis failed" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Dabbarha backend running on port ${PORT}`);
});
