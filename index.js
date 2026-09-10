const http = require("http");

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({
    server: "FIREGAME SMP",
    status: "online",
    kills: []
  }));
});

server.listen(process.env.PORT || 3000);
