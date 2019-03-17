/* eslint-disable no-console */
const http = require('http');
const https = require('https');
const fs = require('fs');
const logger = require('./logger');
const app = require('./app');
const port = app.get('port');

app.set('port', port);

let server;
if (fs.existsSync(process.env.SSL_PATH_CERT || 'fullchain.pem')) {
  server = https.createServer(
    {
      cert: fs
        .readFileSync(process.env.SSL_PATH_CERT || 'fullchain.pem')
        .toString(),
      key: fs.readFileSync(process.env.SSL_PATH_KEY || 'privkey.pem').toString()
    },
    app
  );
} else {
  server = http.createServer(app);
  console.warn('SSL (HTTPS) is not active!!!');
}

server.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info(
    'Feathers application started on http://%s:%d',
    app.get('host'),
    port
  )
);
