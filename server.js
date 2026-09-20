const http = require('http');
const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  // للسماح للتطبيق يتصل
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200); return res.end();
  }

  // ده أهم حاجة - مكان الرد
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { message } = JSON.parse(body);
        let reply = `سؤالك "${message}" سمح شديد! يا زول، أنا دبّرها، مساعدك السوداني. لو سألتني عن أكلة، دراسة، أو أي حاجة بديك إجابة ظابطة قدام البيت 😉`;
        
        if (message.includes('سلام')) reply = 'وعليكم السلام يا ملك! كيف أقدر أساعدك الليلة؟';
        if (message.includes('اكلة') || message.includes('اكل')) reply = 'أظبط ليك ملاح تقلية؟ تحمر بصل، لحمة مفرومة، صلصة، وويكة، وتاكلها بكسرة - أرهب أكلة سودانية!';
        if (message.includes('كيف حالك')) reply = 'الحمد لله بخير والله! انت كيفك؟';

        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify({ reply }));
      } catch(e){ res.writeHead(500); res.end(); }
    });
    return;
  }

  // صفحة تجربة
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end('<h1>موتور دبّرها شغال ✅<br>الرابط: /api/chat</h1>');
});

server.listen(PORT, ()=>console.log('Live'));
