// webhook.js
const http = require('http');
const { exec } = require('child_process');

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      // 校验 GitHub secret（可选）
      console.log('GitHub webhook received!');
      exec('cd ~/task-manager && git pull && npm install && pm2 restart task-manager', (err, stdout, stderr) => {
        if (err) {
          console.error('Update error:', stderr);
        } else {
          console.log('Project updated:', stdout);
        }
      });
      res.writeHead(200);
      res.end('OK');
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(7788, () => {
  console.log('Webhook server listening on port 7788');
});
