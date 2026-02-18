require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка сервера" });
  }
});

app.get('/api/products/:itemId', async (req, res) => {
  const { itemId } = req.params; 

  try {
    const { data, error } = await supabase
      .from('product_details')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) {
      return res.status(404).json({ error: "Товар не знайдено" });
    }

    res.json(data); // Віддаємо знайдений товар у React
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка сервера" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Сервер працює: http://localhost:${PORT}`);
});