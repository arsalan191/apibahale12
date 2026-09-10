const http = require("http");

const port = process.env.PORT || 10000;

// ========================================
// FIREGAME SMP - KILL DATA
// ========================================

const kills = {};

// ========================================
// SERVER
// ========================================

const server = http.createServer((req, res) => {

  // CORS برای سایت
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ========================================
  // GET
  // سایت Leaderboard از اینجا اطلاعات می‌گیرد
  // ========================================

  if (req.method === "GET") {

    const leaderboard = Object.entries(kills)
      .map(([name, count]) => ({
        name: name,
        kills: count
      }))
      .sort((a, b) => b.kills - a.kills);

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      server: "FIREGAME SMP",
      status: "online",
      kills: leaderboard
    }));

    return;
  }

  // ========================================
  // POST
  // دریافت اطلاعات Kill از Aternos
  // ========================================

  if (req.method === "POST") {

    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {

      try {

        const data = JSON.parse(body);

        console.log("================================");
        console.log("🔥 WEBHOOK RECEIVED");
        console.log(JSON.stringify(data));
        console.log("================================");

        let killer = null;

        // ====================================
        // حالت 1
        // {"killer":"arslan1284"}
        // ====================================

        if (
          typeof data.killer === "string" &&
          data.killer.length > 0
        ) {
          killer = data.killer;
        }

        // ====================================
        // حالت 2
        // Discord Webhook content
        // ====================================

        if (!killer && typeof data.content === "string") {

          const match = data.content.match(
            /KILLER:\s*([A-Za-z0-9_]{1,16})/i
          );

          if (match) {
            killer = match[1];
          }
        }

        // ====================================
        // حالت 3
        // Discord Embed
        // ====================================

        if (!killer && Array.isArray(data.embeds)) {

          for (const embed of data.embeds) {

            if (
              embed &&
              typeof embed.description === "string"
            ) {

              const match = embed.description.match(
                /KILLER:\s*([A-Za-z0-9_]{1,16})/i
              );

              if (match) {
                killer = match[1];
                break;
              }
            }

          }
        }

        // ====================================
        // ثبت Kill
        // ====================================

        if (killer) {

          if (!kills[killer]) {
            kills[killer] = 0;
          }

          kills[killer]++;

          console.log(
            `🔥 KILL REGISTERED: ${killer} | TOTAL: ${kills[killer]}`
          );

        } else {

          console.log(
            "⚠️ Killer پیدا نشد."
          );

        }

        // ====================================
        // پاسخ
        // ====================================

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          success: true,
          killer: killer
        }));

      } catch (error) {

        console.error(
          "❌ WEBHOOK ERROR:",
          error
        );

        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          success: false,
          error: "Invalid JSON"
        }));

      }

    });

    return;
  }

  // ========================================
  // 404
  // ========================================

  res.writeHead(404, {
    "Content-Type": "application/json"
  });

  res.end(JSON.stringify({
    error: "Not Found"
  }));

});

// ========================================
// START SERVER
// ========================================

server.listen(port, "0.0.0.0", () => {

  console.log(
    `🔥 FIREGAME API running on port ${port}`
  );

});
