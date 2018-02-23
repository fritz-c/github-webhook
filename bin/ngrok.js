const ngrok = require('ngrok');

const PORT = process.env.PORT || 8000;
ngrok.connect(PORT, (err, url) => {
  console.log(`ngrok linked ${url} -> http://localhost:${PORT}`);
});
