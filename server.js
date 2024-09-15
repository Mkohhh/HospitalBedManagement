const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Determine the file path based on the request URL
  const filePath = req.url === '/' ? '/HTML/homepage.html' : req.url;
  const fileExtension = path.extname(filePath);

  // Set the appropriate Content-Type header
  let contentType = 'text/html';
  switch (fileExtension) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
  }

  // Read and serve the requested file
  fs.readFile(__dirname + filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data, 'utf8');
    }
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
