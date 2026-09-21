const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 10000;
const KEY = process.env.GEMINI_API_KEY;

app.get("/", (req, res) => {
  res.json({
    app: "Dabbarha",
    status: "ok"
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    gemini_configured: !!KEY
  });
});

app.post("/api/chat", async (req, res) => {

  try {

    const message = String(
      req.body?.message || ""
    ).trim();

    if (!message) {
      return res.status(400).json({
        error: "message required"
      });
    }

    if (!KEY) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured"
      });
    }

    const model =
      process.env.GEMINI_MODEL ||
      "gemini-2.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(KEY)}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          systemInstruction: {
            parts: [
              {
                text:
                  "أنت دبّرها، مساعد عربي عملي. أعط خطوات واضحة وقصيرة ومفيدة. لا تخترع معلومات."
              }
            ]
          },

          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message
                }
              ]
            }
          ]

        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini error"
      });

    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") ||
      "لم يصل رد.";

    res.json({
      reply
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

app.listen(PORT, () => {

  console.log(
    `Dabbarha backend running on ${PORT}`
  );

});
