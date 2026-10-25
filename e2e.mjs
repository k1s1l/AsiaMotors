// Наскрізна перевірка в браузері. Запускати проти сервера, зібраного на тестових даних (див. README).
import { createRequire } from "node:module";
// playwright берется з проєкту або з глобальної установки (NODE_PATH)
const { chromium } = createRequire(import.meta.url)("playwright");
import fs from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const OUT = "tests/.out/shots";
fs.mkdirSync(OUT, { recursive: true });

let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "✔" : "✘"} ${msg}`);
  if (!cond) failures++;
};

const browser = await chromium.launch();
const errors = [];

async function newPage(viewport) {
  const ctx = await browser.newContext({ viewport, locale: "uk-UA" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && !m.text().includes("status of 404") && errors.push(`${page.url()}: ${m.text()}`));
  return page;
}

/* ---------- Десктоп ---------- */
const d = await newPage({ width: 1440, height: 900 });

await d.goto(BASE + "/");
ok((await d.locator("h1").textContent()).includes("Автозапчастини"), "головна: заголовок");
ok((await d.locator(".cat-tile").count()) > 0, "головна: плитки категорій");
await d.screenshot({ path: `${OUT}/desktop-home.png`, fullPage: true });

// Мега-меню
await d.click(".catalog-btn");
ok(await d.locator(".megamenu").isVisible(), "мега-меню відкривається");
await d.hover(".megamenu__root >> nth=1");
await d.screenshot({ path: `${OUT}/desktop-megamenu.png` });
await d.keyboard.press("Escape");
ok(!(await d.locator(".megamenu").isVisible()), "мега-меню закривається по Esc");

// Підказки пошуку
await d.fill(".header__search input", "TEST-0012");
await d.waitForSelector(".search__item");
ok((await d.locator(".search__item").first().textContent()).includes("№12"), "пошук за артикулом: перша підказка");
await d.screenshot({ path: `${OUT}/desktop-search-suggest.png` });
await d.press(".header__search input", "Enter");
await d.waitForURL(/\/search\?q=/);
ok((await d.locator(".card").count()) >= 1, "сторінка результатів пошуку");

// Пошук без результатів
await d.goto(BASE + "/search?q=zzzqqq");
ok(await d.locator(".empty h2").isVisible(), "порожній результат пошуку");

// Категорія + фільтри + сортування
await d.goto(BASE + "/catalog/test-dvyhun");
const total = await d.locator(".toolbar__count b").textContent();
ok(/\d+/.test(total), `категорія: лічильник (${total})`);
await d.screenshot({ path: `${OUT}/desktop-category.png`, fullPage: true });
await d.locator(".check", { hasText: "Тільки в наявності" }).click();
await d.waitForURL(/stock=1/);
ok(!(await d.locator(".badge--no").count()), "фільтр «в наявності» прибирає відсутні товари");
await d.locator(".check", { hasText: "TestBrand1" }).click();
await d.waitForURL(/brand=TestBrand1/);
const brands = await d.locator(".card__meta").allTextContents();
ok(brands.length > 0 && brands.every((t) => t.includes("TestBrand1")), "фільтр за виробником");
await d.selectOption(".toolbar .select", "price_desc");
await d.waitForURL(/sort=price_desc/);
const prices = (await d.locator(".card .price__now").allTextContents()).map((t) => Number(t.replace(/[^\d,]/g, "").replace(",", ".")));
ok(prices.every((p, i) => i === 0 || prices[i - 1] >= p), "сортування за спаданням ціни");
ok((await d.locator(".chip").count()) >= 2, "чипи активних фільтрів");
await d.screenshot({ path: `${OUT}/desktop-category-filtered.png` });
await d.click(".chip--reset");
await d.waitForURL((u) => !u.search.includes("brand"));
ok(true, "скидання фільтрів");
await d.goto(BASE + "/catalog/test-dvyhun?view=list");
await d.screenshot({ path: `${OUT}/desktop-category-list.png` });

// Пагінація
await d.goto(BASE + "/search");
ok((await d.locator(".pagination").count()) === 1, "пагінація на списку всіх товарів");
await d.click('.pagination a[aria-label="Наступна сторінка"]');
await d.waitForURL(/page=2/);
ok((await d.locator('.pagination [aria-current="page"]').textContent()) === "2", "перехід на сторінку 2");

// Товар
await d.goto(BASE + "/product/test-detal-7");
ok((await d.locator("h1").textContent()).includes("№7"), "сторінка товару");
ok(await d.locator(".badge--sale").first().isVisible(), "знижка розрахована з oldprice");
await d.click('role=tab[name=/Характеристики/]');
ok(await d.locator(".specs").isVisible(), "вкладка характеристик");
await d.click('role=tab[name=/Сумісність/]');
ok(await d.locator(".compat").isVisible(), "вкладка сумісності");
ok(!(await d.content()).includes("alert(1)"), "скрипт з опису вирізано");
await d.click('role=tab[name="Опис"]');
await d.click('button[aria-label="Збільшити кількість"]');
await d.click("text=Додати в кошик");
await d.waitForSelector(".toast");
ok((await d.locator(".icon-btn__badge").textContent()) === "2", "додано 2 шт. у кошик");
await d.screenshot({ path: `${OUT}/desktop-product.png`, fullPage: true });

// Відсутній товар
await d.goto(BASE + "/product/test-detal-5");
ok(await d.locator(".notice", { hasText: "немає в наявності" }).isVisible(), "відсутній товар не можна купити");

// Друга позиція з картки
await d.goto(BASE + "/catalog/test-pidviska");
await d.locator(".card .btn--primary").first().click();
ok((await d.locator(".icon-btn__badge").textContent()) === "3", "купівля з картки списку");

// Кошик
await d.goto(BASE + "/cart");
await d.waitForSelector(".cart-item");
ok((await d.locator(".cart-item").count()) === 2, "кошик: 2 позиції");
const sumOf = async () => Number((await d.locator(".summary__total b").textContent()).replace(/[^\d,]/g, "").replace(",", "."));
const before = await sumOf();
ok(before === 359 * 2 + (await (async () => {
  const unit = await d.locator(".cart-item >> nth=1 >> .cart-item__unit").textContent();
  return Number(unit.replace(/[^\d,]/g, "").replace(",", "."));
})()), `кошик: сума ${before} відповідає цінам`);
await d.locator(".cart-item >> nth=0 >> button[aria-label='Зменшити кількість']").click();
ok((await sumOf()) === before - 359, "кошик: перерахунок після зміни кількості");
await d.screenshot({ path: `${OUT}/desktop-cart.png` });
await d.locator(".cart-item >> nth=1 >> .cart-item__remove").click();
ok((await d.locator(".cart-item").count()) === 1, "кошик: видалення позиції");

// Оформлення: перевірка помилок
await d.click("text=Оформити замовлення");
await d.waitForURL(/checkout/);
await d.click("text=Підтвердити замовлення");
ok((await d.locator(".field__error").count()) >= 3, "оформлення: помилки валідації порожньої форми");
await d.fill("#co-phone", "12345");
ok((await d.locator("#co-phone-err").textContent()).includes("+380"), "оформлення: неправильний телефон");
await d.screenshot({ path: `${OUT}/desktop-checkout-errors.png`, fullPage: true });
await d.fill("#co-name", "Тест Тестович");
await d.fill("#co-phone", "0501234567");
await d.fill("#co-city", "Київ");
await d.check("text=[ТЕСТ] Спосіб доставки 1");
await d.check("text=[ТЕСТ] Спосіб оплати 1");
await d.click("text=Підтвердити замовлення");
await d.waitForSelector("text=/Замовлення №.* прийнято/");
ok(true, "оформлення: замовлення прийнято");
await d.screenshot({ path: `${OUT}/desktop-checkout-done.png` });
const orders = fs.readFileSync("tests/.out/orders.jsonl", "utf8").trim().split("\n").map((l) => JSON.parse(l));
const last = orders.at(-1);
ok(last.body.customer.phone === "+380501234567" && last.body.items.length === 1 && last.body.total === 359, "вебхук отримав замовлення з перерахованою на сервері сумою");
ok(/^[0-9a-f]{64}$/.test(last.sig ?? ""), "вебхук підписано HMAC");
ok((await d.locator(".icon-btn__badge").count()) === 0, "кошик очищено після замовлення");

// Підміна ціни на клієнті не впливає на суму замовлення
const forged = await d.evaluate(async () => {
  const r = await fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ form: { name: "Тест", phone: "0501234567", email: "", city: "Київ", delivery: "[ТЕСТ] Спосіб доставки 1", payment: "[ТЕСТ] Спосіб оплати 1", comment: "", vin: "" }, lines: [{ id: "t7", qty: 1, price: 1 }] }) });
  return r.json();
});
ok(forged.total === 359, "сервер ігнорує ціну з клієнта");

// Інфо, контакти, 404
await d.goto(BASE + "/info/delivery");
ok((await d.locator("h1").textContent()) === "Доставка", "інфо-сторінка");
await d.goto(BASE + "/contacts");
ok((await d.locator(".contact-card").count()) >= 3, "контакти");
await d.screenshot({ path: `${OUT}/desktop-contacts.png` });
const r404 = await d.goto(BASE + "/product/nema-takoho");
ok(r404.status() === 404, "404 для неіснуючого товару");
await d.goto(BASE + "/catalog");
await d.screenshot({ path: `${OUT}/desktop-catalog.png`, fullPage: true });

// Перевірка всіх внутрішніх посилань головної
await d.goto(BASE + "/");
const hrefs = [...new Set(await d.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href"))))];
const bad = [];
for (const h of hrefs) {
  const r = await d.request.get(BASE + h);
  if (r.status() >= 400) bad.push(`${h} → ${r.status()}`);
}
ok(bad.length === 0, `усі ${hrefs.length} внутрішніх посилань головної працюють ${bad.join(", ")}`);

/* ---------- Мобільний ---------- */
const m = await newPage({ width: 390, height: 844 });
await m.goto(BASE + "/");
ok(await m.locator(".header__burger").isVisible(), "мобільна: бургер видно");
const scrollW = await m.evaluate(() => document.documentElement.scrollWidth);
ok(scrollW <= 390, `мобільна: немає горизонтальної прокрутки (${scrollW}px)`);
await m.screenshot({ path: `${OUT}/mobile-home.png`, fullPage: true });
await m.click(".header__burger");
ok(await m.locator(".drawer").isVisible(), "мобільне меню відкривається");
await m.locator(".drawer__link", { hasText: "[ТЕСТ] Двигун" }).click();
ok(await m.locator(".drawer__link", { hasText: "Усі товари: [ТЕСТ] Двигун" }).isVisible(), "мобільне меню: вкладені категорії");
await m.screenshot({ path: `${OUT}/mobile-menu.png` });
await m.locator(".drawer__link", { hasText: "[ТЕСТ] Фільтри" }).click();
await m.waitForURL(/test-filtry/);
ok(!(await m.locator(".drawer").count()), "мобільне меню закривається після переходу");
await m.click(".filters-toggle >> nth=0");
ok(await m.locator('.sidebar[data-open="true"]').isVisible(), "мобільні фільтри відкриваються");
await m.screenshot({ path: `${OUT}/mobile-filters.png` });
await m.click('button[aria-label="Закрити фільтри"]');
await m.screenshot({ path: `${OUT}/mobile-category.png`, fullPage: true });
for (const url of ["/product/test-detal-7", "/catalog", "/search?q=TEST", "/contacts"]) {
  await m.goto(BASE + url);
  const w = await m.evaluate(() => document.documentElement.scrollWidth);
  ok(w <= 390, `мобільна ${url}: ширина ${w}px`);
  const left = await m.evaluate(() => document.querySelector("h1").getBoundingClientRect().left);
  ok(left >= 16, `мобільна ${url}: бічний відступ ${left}px`);
}
await m.goto(BASE + "/product/test-detal-7");
await m.screenshot({ path: `${OUT}/mobile-product.png`, fullPage: true });
await m.click("text=Додати в кошик");
await m.goto(BASE + "/cart");
await m.waitForSelector(".cart-item");
ok((await m.evaluate(() => document.documentElement.scrollWidth)) <= 390, "мобільна: кошик без горизонтальної прокрутки");
await m.screenshot({ path: `${OUT}/mobile-cart.png`, fullPage: true });
await m.goto(BASE + "/checkout");
await m.screenshot({ path: `${OUT}/mobile-checkout.png`, fullPage: true });

/* ---------- Планшет ---------- */
const t = await newPage({ width: 820, height: 1180 });
for (const url of ["/", "/catalog/test-dvyhun", "/product/test-detal-7"]) {
  await t.goto(BASE + url);
  const w = await t.evaluate(() => document.documentElement.scrollWidth);
  ok(w <= 820, `планшет ${url}: ширина ${w}px`);
}
await t.goto(BASE + "/catalog/test-dvyhun");
await t.screenshot({ path: `${OUT}/tablet-category.png`, fullPage: true });

ok(errors.length === 0, `помилок JS у консолі немає${errors.length ? ":\n  " + errors.join("\n  ") : ""}`);
await browser.close();
console.log(failures ? `\n${failures} перевірок не пройдено` : "\nУсі перевірки пройдено");
process.exit(failures ? 1 : 0);
