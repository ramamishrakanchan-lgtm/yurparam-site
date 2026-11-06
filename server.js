const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT) || 5173;
const pagePath = path.join(__dirname, "index.html");
const imagePath = path.join(__dirname, "assets", "9028195-clean.jpg");
const files = new Map([
  ["/", { path: pagePath, type: "text/html; charset=utf-8" }],
  ["/index.html", { path: pagePath, type: "text/html; charset=utf-8" }],
  ["/assets/9028195-clean.jpg", { path: imagePath, type: "image/jpeg" }]
]);

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

  if (request.method !== "GET") {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }

  const file = files.get(pathname);
  if (!file) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  fs.readFile(file.path, (error, content) => {
    if (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Could not load the requested file");
      return;
    }

    response.writeHead(200, { "Content-Type": file.type });
    response.end(content);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`AyurParam is running at http://localhost:${port}`);
});