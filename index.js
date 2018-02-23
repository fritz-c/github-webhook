const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// to support JSON-encoded bodies
app.use(bodyParser.json());
// to support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use('*', (req, res) => {
  console.log('((((req.body))))', req.body); // eslint-disable-line no-console
  console.log('((((req.query))))', req.query); // eslint-disable-line no-console
  console.log('((((req.headers))))', req.headers); // eslint-disable-line no-console
  res.status(200).send('hi');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
