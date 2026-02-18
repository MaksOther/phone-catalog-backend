require("dotenv").config();
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

async function seedDatabase() {
  try {
    console.log("🚚 Починаємо завантаження даних на склад...");

    // 1. Читаємо всі файли
    const phones = JSON.parse(fs.readFileSync("./data/phones.json", "utf8"));
    const tablets = JSON.parse(fs.readFileSync("./data/tablets.json", "utf8"));
    const accessories = JSON.parse(fs.readFileSync("./data/accessories.json", "utf8"));
    
    // Читаємо файл каталогу (зверни увагу, я змінив назву змінної, щоб не плутатись)
    const productsCatalog = JSON.parse(fs.readFileSync("./data/products.json", "utf8"));

    // 2. Об'єднуємо ТІЛЬКИ детальні дані (телефони, планшети, аксесуари)
    const allDetails = [...phones, ...tablets, ...accessories];
    
    console.log(`📦 Товарів для каталогу: ${productsCatalog.length}`);
    console.log(`📦 Детальних описів: ${allDetails.length}`);

    // 3. Завантажуємо КАТАЛОГ у таблицю products
    console.log("⏳ Завантажуємо каталог у таблицю products...");
    const { error: errorProducts } = await supabase.from("products").upsert(productsCatalog);

    if (errorProducts) {
      console.error("❌ Помилка при завантаженні products:", errorProducts.message);
      return; // Зупиняємо вантажівку, далі не їдемо
    }

    // 4. Завантажуємо ДЕТАЛІ у таблицю product_details 
    // (Зверни увагу: назва таблиці product_details, без "s" всередині, як ми створювали в SQL)
    console.log("⏳ Завантажуємо деталі у таблицю product_details...");
    const { error: errorDetails } = await supabase.from("product_details").upsert(allDetails);

    if (errorDetails) {
      console.error("❌ Помилка при завантаженні product_details:", errorDetails.message);
      return;
    }

    console.log("✅ Усі товари та їх деталі успішно завантажено в базу Supabase!");
  } catch (err) {
    console.error("❌ Щось пішло не так (можливо, файли не знайдено):", err);
  }
}

seedDatabase();