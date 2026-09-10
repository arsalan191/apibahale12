const http = require("http");

const port = process.env.PORT || 10000;

// ذخیره موقت Kill ها
const kills = {};

const server = http.createServer((req, res) => {
  // API سایت
  if (req.method === "GET") {
    const leaderboard = Object.entries(kills)
      .map(([name, count]) => ({
        name,
        kills: count
      }))
      .sort((a, b) => b.kills - a.kills);

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    });

    res.end(JSON.stringify({
      server: "FIREGAME SMP",
      status: "online",
      kills: leaderboard
    }));

    return;
  }

  // دریافت Kill از WebhookIntegrations
  if (req.method === "POST") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        console.log("WEBHOOK RECEIVED:", JSON.stringify(data));

        let killer = null;

        // اگر killer مستقیماً ارسال شده باشد
        if (data.killer) {
          killer = data.killer;
        }

        // اگر داخل content باشد
        if (!killer && data.content) {
          const match = data.content.match(/killer[:=]\s*([A-Za-z0-9_]+)/i);
          if (match) {
            killer = match[1];
          }
        }

        if (killer) {
          kills[killer] = (kills[killer] || 0) + 1;
          console.log(`KILL REGISTERED: ${killer}`);
        }

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          success: true
        }));

      } catch (error) {
        console.error("WEBHOOK ERROR:", error);

        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          success: false
        }));
      }
    });

    return;
  }

  res.writeHead(404, {
    "Content-Type": "application/json"
  });

  res.end(JSON.stringify({
    error: "Not Found"
  }));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`FIREGAME API running on port ${port}`);
});
