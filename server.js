const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const question = encodeURIComponent(req.body.message);
    const r = await fetch(`https://text.pollinations.ai/${question}?model=openai&search=true`);
    const answer = await r.text();
    res.json({ reply: answer });
  } catch (e) {
    res.json({ reply: "جرب تاني النت ضعيف: " + e.message });
  }
});

app.get('/', (req, res) => res.send('Dabbarha Perplexity Free OK'));
app.listen(process.env.PORT || 10000, () => console.log('Ready'));
