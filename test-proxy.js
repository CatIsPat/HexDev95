import http from 'http';

http.get('http://localhost:3000/api/nvidia-chat/chat/completions', {
  headers: {
    "Authorization": "Bearer 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",
    "Content-Type": "application/json"
  }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
}).on('error', e => console.error(e));
