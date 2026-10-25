// Приймач вебхука для тестів: зберігає отримані замовлення в tests/.out/orders.jsonl
import http from "node:http";
import fs from "node:fs";
http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    fs.appendFileSync("tests/.out/orders.jsonl", JSON.stringify({ sig: req.headers["x-signature-sha256"], body: JSON.parse(body) }) + "\n");
    res.writeHead(200).end("ok");
  });
}).listen(4100, () => console.log("receiver :4100"));
