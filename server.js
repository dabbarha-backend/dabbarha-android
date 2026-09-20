const http = require('http');
const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <html dir="rtl">
    <head><title>موقعك شغال</title></head>
    <body style="font-family:Arial; text-align:center; padding:50px">
      <h1>🎉 مبروك! موقعك شغال قدام البيت</h1>
      <p>السيرفر شغال بدون مفتاح ومجاني مدى الحياة</p>
      <p>الرابط ده هو موقعك النهائي</p>
      <hr>
      <p>جرب تكتب في المتصفح /api/search?q=مرحبا</p>
    </body>
    </html>
  `);
});

server.listen(PORT, () => console.log('Running on ' + PORT));
