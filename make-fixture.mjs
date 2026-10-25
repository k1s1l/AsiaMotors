// Генерує ТЕСТОВИЙ фід для автоматичної перевірки інтерфейсу.
// Це не дані Asia Motors: усі назви позначені «[ТЕСТ]», артикули — TEST-xxxx.
import fs from "node:fs";
const cats = [
  [1, null, "[ТЕСТ] Двигун"], [2, 1, "[ТЕСТ] Фільтри"], [3, 1, "[ТЕСТ] Ремені"],
  [4, null, "[ТЕСТ] Гальмівна система"], [5, 4, "[ТЕСТ] Колодки"], [6, 4, "[ТЕСТ] Диски"],
  [7, null, "[ТЕСТ] Підвіска"], [8, null, "[ТЕСТ] Електрика"],
];
const makes = ["Chery Tiggo", "Geely", "Great Wall"]; // реальні марки — лише щоб перевірити фільтр «Марка авто»
const leafs = [2, 3, 5, 6, 7, 8];
let offers = "";
for (let i = 1; i <= 60; i++) {
  const cat = leafs[i % leafs.length];
  const price = 100 + i * 37;
  const old = i % 7 === 0 ? ` <oldprice>${price + 150}</oldprice>` : "";
  const avail = i % 5 === 0 ? "false" : "true";
  offers += `<offer id="t${i}" available="${avail}"><name>[ТЕСТ] Деталь №${i}</name><categoryId>${cat}</categoryId><price>${price}</price>${old}<currencyId>UAH</currencyId><vendor>TestBrand${(i % 3) + 1}</vendor><vendorCode>TEST-${String(i).padStart(4, "0")}</vendorCode><description><![CDATA[<p>Тестовий опис для перевірки верстки. <script>alert(1)</script><b>Жирний</b></p>]]></description><param name="Сторона">${i % 2 ? "Ліва" : "Права"}</param><param name="Тест-параметр">${"ABC"[i % 3]}</param><param name="Сумісність">${makes[i % 3]} X1, ${makes[(i + 1) % 3]} X2</param></offer>\n`;
}
const xml = `<?xml version="1.0" encoding="UTF-8"?><yml_catalog><shop><name>TEST</name><currencies><currency id="UAH" rate="1"/></currencies><categories>${cats.map(([id, p, n]) => `<category id="${id}"${p ? ` parentId="${p}"` : ""}>${n}</category>`).join("")}</categories><offers>${offers}</offers></shop></yml_catalog>`;
fs.mkdirSync("tests/.out", { recursive: true });
fs.writeFileSync("tests/.out/test-feed.xml", xml);
console.log("tests/.out/test-feed.xml");
