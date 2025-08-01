const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    if (req.url === '/payment-test.html') {
        fs.readFile('payment-test.html', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>File not found</h1>');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>Not found</h1>');
    }
});

const PORT = 8082;
server.listen(PORT, () => {
    console.log(`Payment test server running at http://localhost:${PORT}/`);
    console.log(`Payment page available at http://localhost:${PORT}/payment-test.html`);
}); 